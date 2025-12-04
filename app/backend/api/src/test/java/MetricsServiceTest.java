package com.covid19.api;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.mockito.ArgumentCaptor;
import static org.mockito.Mockito.verify;


import java.util.Map;
import java.util.NoSuchElementException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;


@ExtendWith(MockitoExtension.class) // Active Mockito pour JUnit5
class MetricsServiceTest {

    @Mock
    JdbcTemplate jdbc;          // ce que MetricsService utilise

    @InjectMocks
    MetricsService service;     // instance avec le mock injecté

    @BeforeEach
    void setUp() {
        // Rien de spécial ici pour l'instant
    }

    @Test
    void latestDate_shouldReturnDateFromDb() {
        // arrange
        when(jdbc.queryForObject(
                anyString(),       // on ne vérifie pas le SQL exact
                eq(String.class)   // on veut un String
        )).thenReturn("2023-03-09");

        // act
        String result = service.latestDate();

        // assert
        assertEquals("2023-03-09", result);
        // on vérifie que JdbcTemplate a bien été appelé
        verify(jdbc).queryForObject(anyString(), eq(String.class));
    }

    @Test
    void global_withNullDate_usesLatestDateAndReturnsAggregatedValues() {
        // arrange
        // 1) latestDate() va appeler queryForObject(...)
        when(jdbc.queryForObject(
                anyString(),
                eq(String.class)
        )).thenReturn("2023-03-09");

        // 2) la méthode global() va ensuite appeler queryForMap(sql, d)
        when(jdbc.queryForMap(anyString(), any()))
                .thenReturn(Map.of(
                        "date", "2023-03-09",
                        "cases_cumulative", 123L,
                        "deaths_cumulative", 4L
                ));

        // act
        Map<String, Object> result = service.global(null); // date == null => latestDate()

        // assert
        assertEquals("2023-03-09", result.get("date"));
        assertEquals(123L, result.get("cases_cumulative"));
        assertEquals(4L, result.get("deaths_cumulative"));
    }

    @Test
    void global_withInvalidDate_throwsIllegalArgumentException() {
        // act & assert
        assertThrows(IllegalArgumentException.class, () ->
                service.global("2023/03/09") // format invalide
        );
    }

    @Test
    void global_withExplicitDate_callsQueryForMapWithThatDate() {
        when(jdbc.queryForMap(anyString(), any()))
                .thenReturn(Map.of(
                        "date", "2023-03-05",
                        "cases_cumulative", 50L,
                        "deaths_cumulative", 1L
                ));

        Map<String, Object> result = service.global("2023-03-05");

        assertEquals("2023-03-05", result.get("date"));
        assertEquals(50L, result.get("cases_cumulative"));
        assertEquals(1L, result.get("deaths_cumulative"));
    }

    @Test
    void getAllCountriesLatestStats_shouldReturnListFromJdbc() {
        // latestDate() appelé en interne
        when(jdbc.queryForObject(
                anyString(),
                eq(String.class)
        )).thenReturn("2023-03-09");

        // liste simulée renvoyée par jdbc.query(...)
        var row1 = Map.of(
                "country", "France",
                "cases", 100L,
                "deaths", 5L
        );
        var row2 = Map.of(
                "country", "Germany",
                "cases", 80L,
                "deaths", 3L
        );

        when(jdbc.query(anyString(), any(org.springframework.jdbc.core.RowMapper.class), any()))
                .thenReturn(java.util.List.of(row1, row2));

        var result = service.getAllCountriesLatestStats();

        assertEquals(2, result.size());
        assertEquals("France", result.get(0).get("country"));
        assertEquals(100L, result.get(0).get("cases"));
        assertEquals(5L, result.get(0).get("deaths"));
    }

    @Test
    void getTopCountries_withDefaultMetric_cases_shouldUseCasesCum() {
        when(jdbc.queryForObject(anyString(), eq(String.class)))
                .thenReturn("2023-03-09");

        var row = Map.of(
                "country", "France",
                "cases", 100L,
                "deaths", 5L
        );

        when(jdbc.query(anyString(), any(org.springframework.jdbc.core.RowMapper.class), any(), anyInt()))
                .thenReturn(java.util.List.of(row));

        var result = service.getTopCountries("cases", 5);

        // on récupère le SQL passé à jdbc.query
        ArgumentCaptor<String> sqlCaptor = ArgumentCaptor.forClass(String.class);
        verify(jdbc).query(sqlCaptor.capture(), any(org.springframework.jdbc.core.RowMapper.class), any(), anyInt());

        String usedSql = sqlCaptor.getValue();
        // le SQL doit utiliser cases_cum pour l'ORDER BY
        assertTrue(usedSql.contains("ORDER BY ds.cases_cum"), "SQL should order by cases_cum");

        assertEquals(1, result.size());
        assertEquals("France", result.get(0).get("country"));
    }

    @Test
    void getTopCountries_withDeathsMetric_shouldUseDeathsCum() {
        when(jdbc.queryForObject(anyString(), eq(String.class)))
                .thenReturn("2023-03-09");

        var row = Map.of(
                "country", "Italy",
                "cases", 90L,
                "deaths", 10L
        );

        when(jdbc.query(anyString(), any(org.springframework.jdbc.core.RowMapper.class), any(), anyInt()))
                .thenReturn(java.util.List.of(row));

        var result = service.getTopCountries("deaths", 3);

        ArgumentCaptor<String> sqlCaptor = ArgumentCaptor.forClass(String.class);
        verify(jdbc).query(sqlCaptor.capture(), any(org.springframework.jdbc.core.RowMapper.class), any(), anyInt());

        String usedSql = sqlCaptor.getValue();
        // le SQL doit utiliser deaths_cum pour l'ORDER BY
        assertTrue(usedSql.contains("ORDER BY ds.deaths_cum"), "SQL should order by deaths_cum");

        assertEquals(1, result.size());
        assertEquals("Italy", result.get(0).get("country"));
    }


    @Test
    void countrySeries_withUnknownCountry_throwsNoSuchElementException() {
        // arrange
        // lorsqu'on vérifie si le pays existe, tu fais :
        // SELECT COUNT(1) FROM country WHERE name = ?
        when(jdbc.queryForObject(
                anyString(),
                eq(Integer.class),
                any()
        )).thenReturn(0);  // le pays "n'existe pas"

        // act & assert
        assertThrows(NoSuchElementException.class, () ->
                service.countrySeries("Narnia", null, null)
        );
    }
}
