package com.covid19.api;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class MetricsService {
  private final JdbcTemplate jdbc;
  public MetricsService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

  public String latestDate() {
    return jdbc.queryForObject("SELECT to_char(max(date),'YYYY-MM-DD') FROM daily_stats", String.class);
  }

  public Map<String, Object> global(String date) {
    String d = (date == null || date.isBlank()) ? latestDate() : date;
    if (!d.matches("\\d{4}-\\d{2}-\\d{2}")) {
      throw new IllegalArgumentException("Date must be YYYY-MM-DD");
    }
    return jdbc.queryForMap(
      "SELECT to_char(ds.date,'YYYY-MM-DD') AS date, " +
      "       SUM(ds.cases_cum) AS cases_cumulative, " +
      "       SUM(ds.deaths_cum) AS deaths_cumulative " +
      "FROM daily_stats ds " +
      "WHERE ds.date = to_date(?, 'YYYY-MM-DD') " +
      "GROUP BY ds.date",
      d
    );
  }


  public List<Map<String, Object>> countrySeries(String countryName, String start, String end) {
    Integer exists = jdbc.queryForObject(
        "SELECT COUNT(1) FROM country WHERE name = ?", Integer.class, countryName);
    if (exists == null || exists == 0) {
      throw new NoSuchElementException("Country not found: " + countryName);
    }

    if (start == null || start.isBlank()) {
      start = jdbc.queryForObject("""
        SELECT to_char(min(ds.date),'YYYY-MM-DD')
        FROM daily_stats ds JOIN country c ON c.id=ds.country_id WHERE c.name=?
      """, String.class, countryName);
    }
    if (end == null || end.isBlank()) {
      end = jdbc.queryForObject("""
        SELECT to_char(max(ds.date),'YYYY-MM-DD')
        FROM daily_stats ds JOIN country c ON c.id=ds.country_id WHERE c.name=?
      """, String.class, countryName);
    }

    if (!start.matches("\\d{4}-\\d{2}-\\d{2}") || !end.matches("\\d{4}-\\d{2}-\\d{2}")) {
      throw new IllegalArgumentException("Dates must be YYYY-MM-DD");
    }

    String sql =
        "SELECT to_char(ds.date,'YYYY-MM-DD') AS date, ds.cases_cum, ds.deaths_cum " +
        "FROM daily_stats ds JOIN country c ON c.id = ds.country_id " +
        "WHERE c.name = ? " +
        "AND ds.date BETWEEN to_date(?, 'YYYY-MM-DD') AND to_date(?, 'YYYY-MM-DD') " +
        "ORDER BY ds.date";

    return jdbc.query(sql, (rs, i) -> {
      Map<String,Object> m = new LinkedHashMap<>();
      m.put("date", rs.getString("date"));
      m.put("cases_cum", rs.getLong("cases_cum"));
      m.put("deaths_cum", rs.getLong("deaths_cum"));
      return m;
    }, countryName, start, end);
  }

  public List<String> getAllCountries() {
    return jdbc.query(
        "SELECT DISTINCT name FROM country ORDER BY name",
        (rs, i) -> rs.getString("name")
    );
  }

  // Nouvelle méthode : obtenir les dernières stats de tous les pays
  public List<Map<String, Object>> getAllCountriesLatestStats() {
    String latestDate = latestDate();
    
    String sql = """
        SELECT c.name AS country, 
               ds.cases_cum AS cases, 
               ds.deaths_cum AS deaths
        FROM daily_stats ds 
        JOIN country c ON c.id = ds.country_id
        WHERE ds.date = to_date(?, 'YYYY-MM-DD')
        ORDER BY ds.cases_cum DESC
        """;
    
    return jdbc.query(sql, (rs, i) -> {
      Map<String, Object> m = new LinkedHashMap<>();
      m.put("country", rs.getString("country"));
      m.put("cases", rs.getLong("cases"));
      m.put("deaths", rs.getLong("deaths"));
      return m;
    }, latestDate);
  }

  // Nouvelle méthode : obtenir le top N des pays
  public List<Map<String, Object>> getTopCountries(String metric, int limit) {
    String latestDate = latestDate();
    String orderBy = metric.equalsIgnoreCase("deaths") ? "deaths_cum" : "cases_cum";
    
    String sql = String.format("""
        SELECT c.name AS country, 
               ds.cases_cum AS cases, 
               ds.deaths_cum AS deaths
        FROM daily_stats ds 
        JOIN country c ON c.id = ds.country_id
        WHERE ds.date = to_date(?, 'YYYY-MM-DD')
        ORDER BY ds.%s DESC
        LIMIT ?
        """, orderBy);
    
    return jdbc.query(sql, (rs, i) -> {
      Map<String, Object> m = new LinkedHashMap<>();
      m.put("country", rs.getString("country"));
      m.put("cases", rs.getLong("cases"));
      m.put("deaths", rs.getLong("deaths"));
      return m;
    }, latestDate, limit);
  }
}