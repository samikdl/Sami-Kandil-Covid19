package com.covid19.ingestion;

import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;

import java.io.FileReader;
import java.nio.file.Path;
import java.sql.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

public class Main {

    record Key(String country, LocalDate date) {}
    static final DateTimeFormatter DF = DateTimeFormatter.ofPattern("M/d/yy");

    public static void main(String[] args) throws Exception {
        Map<String, String> arg = parseArgs(args);
        String confirmedPath = arg.get("--confirmed");
        String deathsPath    = arg.get("--deaths");
        String jdbc          = arg.get("--jdbc");
        String user          = arg.get("--user");
        String pass          = arg.get("--pass");

        if (confirmedPath == null || deathsPath == null || jdbc == null || user == null || pass == null) {
            System.err.println("Args manquants. Exemple:");
            System.err.println("--confirmed path --deaths path --jdbc jdbcUrl --user u --pass p");
            System.exit(1);
        }

        System.out.println("Lecture CSV...");
        Map<Key, Long> casesCum  = readTimeSeries(Path.of(confirmedPath).toString());
        Map<Key, Long> deathsCum = readTimeSeries(Path.of(deathsPath).toString());

        Set<Key> all = new HashSet<>();
        all.addAll(casesCum.keySet());
        all.addAll(deathsCum.keySet());

        try (Connection cnx = DriverManager.getConnection(jdbc, user, pass)) {
            cnx.setAutoCommit(false);
            Map<String, Integer> countryId = new HashMap<>();

            try (PreparedStatement upsertCountry = cnx.prepareStatement(
                    "INSERT INTO country(name) VALUES (?) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id");
                 PreparedStatement upsertDaily = cnx.prepareStatement(
                    """
                    INSERT INTO daily_stats(country_id, date, cases_cum, deaths_cum)
                    VALUES (?, ?, ?, ?)
                    ON CONFLICT (country_id, date) DO UPDATE
                      SET cases_cum=EXCLUDED.cases_cum, deaths_cum=EXCLUDED.deaths_cum
                    """)) {

                for (Key k : all) {
                    int cid = countryId.computeIfAbsent(k.country, c -> {
                        try {
                            upsertCountry.setString(1, c);
                            try (ResultSet rs = upsertCountry.executeQuery()) {
                                rs.next();
                                return rs.getInt(1);
                            }
                        } catch (SQLException e) { throw new RuntimeException(e); }
                    });

                    long cc = casesCum.getOrDefault(k, 0L);
                    long dc = deathsCum.getOrDefault(k, 0L);

                    upsertDaily.setInt(1, cid);
                    upsertDaily.setDate(2, java.sql.Date.valueOf(k.date));
                    upsertDaily.setLong(3, cc);
                    upsertDaily.setLong(4, dc);
                    upsertDaily.addBatch();
                }
                upsertDaily.executeBatch();
            }
            cnx.commit();
        }

        System.out.println("OK: données insérées/à jour.");
    }

    static Map<Key, Long> readTimeSeries(String path) throws Exception {
        Map<Key, Long> out = new HashMap<>();
        try (CSVReader r = new CSVReader(new FileReader(path))) {
            List<String[]> rows = r.readAll();
            String[] header = rows.get(0);
            int firstDateCol = 4;

            for (int i = 1; i < rows.size(); i++) {
                String[] row = rows.get(i);
                String country = row[1].trim();
                for (int c = firstDateCol; c < header.length; c++) {
                    LocalDate date = LocalDate.parse(header[c], DF);
                    long val = parseLong(row[c]);
                    Key key = new Key(country, date);
                    out.merge(key, val, Long::sum);
                }
            }
        } catch (CsvException e) {
            throw new RuntimeException(e);
        }
        return out;
    }

    static long parseLong(String s) {
        if (s == null || s.isBlank()) return 0L;
        try { return Long.parseLong(s.trim()); } catch (NumberFormatException e) { return 0L; }
    }

    static Map<String, String> parseArgs(String[] args) {
        Map<String, String> m = new HashMap<>();
        for (int i = 0; i < args.length - 1; i += 2) m.put(args[i], args[i+1]);
        return m;
    }
}
