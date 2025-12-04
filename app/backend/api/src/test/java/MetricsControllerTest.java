package com.covid19.api;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;   // <-- IMPORTANT
import org.springframework.boot.test.mock.mockito.MockBean;
import java.util.NoSuchElementException;


import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import static org.hamcrest.Matchers.hasSize;

@ExtendWith(SpringExtension.class)
@WebMvcTest(MetricsController.class)
@AutoConfigureMockMvc(addFilters = false)   // <-- désactive les filtres Spring Security (pas de 401)
class MetricsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MetricsService metricsService;

    @Test
    void globalEndpoint_shouldReturnJsonFromService() throws Exception {
        when(metricsService.global(null)).thenReturn(
                Map.of(
                        "date", "2023-03-09",
                        "cases_cumulative", 123L,
                        "deaths_cumulative", 4L
                )
        );

        mockMvc.perform(get("/api/v1/metrics/global"))
               .andExpect(status().isOk())
               .andExpect(content().contentType("application/json"))
               .andExpect(jsonPath("$.date").value("2023-03-09"))
               .andExpect(jsonPath("$.cases_cumulative").value(123))
               .andExpect(jsonPath("$.deaths_cumulative").value(4));
    }

    @Test
    void countryEndpoint_shouldWrapSeriesAndLatest() throws Exception {
        List<Map<String, Object>> series = List.of(
                Map.of(
                        "date", "2020-01-01",
                        "cases_cum", 10L,
                        "deaths_cum", 1L
                ),
                Map.of(
                        "date", "2020-01-02",
                        "cases_cum", 20L,
                        "deaths_cum", 2L
                )
        );

        when(metricsService.countrySeries(eq("France"), any(), any()))
                .thenReturn(series);

        mockMvc.perform(
                    get("/api/v1/metrics/country/France")
                        .param("start", "2020-01-01")
                        .param("end", "2020-01-02")
               )
               .andExpect(status().isOk())
               .andExpect(content().contentType("application/json"))
               .andExpect(jsonPath("$.country").value("France"))
               .andExpect(jsonPath("$.series", hasSize(2)))
               .andExpect(jsonPath("$.latest.date").value("2020-01-02"))
               .andExpect(jsonPath("$.latest.cases_cum").value(20))
               .andExpect(jsonPath("$.latest.deaths_cum").value(2));
    }

    @Test
    void countryEndpoint_withUnknownCountry_returns404AndErrorBody() throws Exception {
        // Arrange : le service lève une NoSuchElementException
        when(metricsService.countrySeries(eq("Narnia"), any(), any()))
                .thenThrow(new NoSuchElementException("Country not found: Narnia"));

        // Act + Assert
        mockMvc.perform(get("/api/v1/metrics/country/Narnia"))
            .andExpect(status().isNotFound())
            .andExpect(content().contentType("application/json"))
            .andExpect(jsonPath("$.error").value("Not Found"))
            .andExpect(jsonPath("$.message").value("Country not found: Narnia"));
    }

    @Test
    void countriesEndpoint_shouldReturnListOfNames() throws Exception {
        when(metricsService.getAllCountries())
                .thenReturn(List.of("France", "Germany", "Italy"));

        mockMvc.perform(get("/api/v1/metrics/countries"))
               .andExpect(status().isOk())
               .andExpect(content().contentType("application/json"))
               .andExpect(jsonPath("$", hasSize(3)))
               .andExpect(jsonPath("$[0]").value("France"))
               .andExpect(jsonPath("$[1]").value("Germany"))
               .andExpect(jsonPath("$[2]").value("Italy"));
    }
}
