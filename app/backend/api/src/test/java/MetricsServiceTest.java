package com.covid19.api;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.mockito.ArgumentCaptor;

import java.util.Map;
import java.util.NoSuchElementException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class MetricsServiceTest {

    @Mock
    JdbcTemplate jdbc;

    @InjectMocks
    MetricsService service;

    @BeforeEach
    void setUp() {
    }

    // Vérifie que latestDate() renvoie bien la date retournée par la base via JdbcTemplate
    @Test
    void latestDate_shouldReturnDateFromDb() {
        when(jdbc.queryForObject(
                anyString(),
                eq(String.class)
        )).thenReturn("2023-03-09");

        String result = service.latestDate();

        assertEquals("2023-03-09", result);
        verify(jdbc).queryForObject(anyString(), eq(String.class));
    }

    // Vérifie que global(null) utilise latestDate() et renvoie les valeurs agrégées attendues
    @Test
    void global_withNullDate_usesLatestDateAndReturnsAggregatedValues() {

        when(jdbc.queryForObject(
                anyString(),
                eq(String.class)
        )).thenReturn("2023-03-09");

        when(jdbc.queryForMap(anyString(), any()))
                .thenReturn(Map.of(
                        "date", "2023-03-09",
                        "cases_cumulative", 123L,
                        "deaths_cumulative", 4L
                ));

        Map<String, Object> result = service.global(null);

        assertEquals("2023-03-09", result.get("date"));
        assertEquals(123L, result.get("cases_cumulative"));
        assertEquals(4L, result.get("deaths_cumulative"));
    }

    // Vérifie que global() lève une IllegalArgumentException si le format de la date est invalide
    @Test
    void global_withInvalidDate_throwsIllegalArgumentException() {
        assertThrows(IllegalArgumentException.class, () ->
                service.global("2023/03/09")
        );
    }

    // Vérifie que global(date) utilise bien la date explicitement passée et renvoie le bon résultat
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

    // Vérifie que getAllCountriesLatestStats() renvoie bien la liste de maps construite à partir du JdbcTemplate
    @Test
    void getAllCountriesLatestStats_shouldReturnListFromJdbc() {
        when(jdbc.queryForObject(
                anyString(),
                eq(String.class)
        )).thenReturn("2023-03-09");

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

    // Vérifie que getTopCountries("cases", ...) utilise bien ORDER BY ds.cases_cum dans le SQL et renvoie les bons pays
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

        ArgumentCaptor<String> sqlCaptor = ArgumentCaptor.forClass(String.class);
        verify(jdbc).query(sqlCaptor.capture(), any(org.springframework.jdbc.core.RowMapper.class), any(), anyInt());

        String usedSql = sqlCaptor.getValue();

        assertTrue(usedSql.contains("ORDER BY ds.cases_cum"), "SQL should order by cases_cum");

        assertEquals(1, result.size());
        assertEquals("France", result.get(0).get("country"));
    }

    // Vérifie que getTopCountries("deaths", ...) utilise bien ORDER BY ds.deaths_cum dans le SQL et renvoie les bons pays
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
        assertTrue(usedSql.contains("ORDER BY ds.deaths_cum"), "SQL should order by deaths_cum");

        assertEquals(1, result.size());
        assertEquals("Italy", result.get(0).get("country"));
    }

    // Vérifie que countrySeries() lève une NoSuchElementException si le pays n'existe pas en base
    @Test
    void countrySeries_withUnknownCountry_throwsNoSuchElementException() {

        when(jdbc.queryForObject(
                anyString(),
                eq(Integer.class),
                any()
        )).thenReturn(0);

        assertThrows(NoSuchElementException.class, () ->
                service.countrySeries("Narnia", null, null)
        );
    }
}
