# 📊 Covid19 Data Ingestion

## 🚀 Objective
This first sprint consists of:

- Setting up the environment with Docker and PostgreSQL  
- Ingesting COVID-19 data (confirmed cases and deaths) into the database  
- Verifying that the data has been correctly inserted  

---

## 🐳 Run Docker (Postgres + Adminer)

```bash
docker-compose up -d
```

🛠️ Database Access

PostgreSQL available at: localhost:5433

Adminer available at: http://localhost:8080

Default credentials:

User: covid
Password: covid
Database: covid

▶️ Run the Ingestion

```bash
mvn -q exec:java -Dexec.mainClass="com.covid19.ingestion.Main" \
  -Dexec.args="--confirmed ./time_series_covid19_confirmed_global.csv \
               --deaths ./time_series_covid19_deaths_global.csv \
               --jdbc jdbc:postgresql://localhost:5433/covid \
               --user covid --pass covid"
```

✅ Verification

Run SQL queries in Adminer (or psql) to check that data was correctly inserted:

```bash
SELECT COUNT(*) FROM daily_stats;

SELECT d.date, d.cases_cum, d.deaths_cum
FROM daily_stats d
JOIN country c ON c.id = d.country_id
WHERE c.name = 'France'
ORDER BY d.date
LIMIT 10;
```

Expected: you should see cumulative cases and deaths for France by date.


## 🌐 Sprint 2 – REST API with Spring Boot

This second sprint consists of:

- Creating a REST API with Spring Boot
- Connecting the API to PostgreSQL (via JDBC)
- Exposing endpoints to fetch aggregated COVID-19 data

---

## ▶️ Run the API

```bash
mvn spring-boot:run
```

By default, the API runs on:
👉 http://localhost:9090


## 📡 Available Endpoints

Global metrics (latest date by default):

- GET http://localhost:9090/api/v1/metrics/global

Global metrics for a specific date:

- GET http://localhost:9090/api/v1/metrics/global?date=2020-04-01

Country time series:

- GET http://localhost:9090/api/v1/metrics/country/France

Country time series with date range:

- GET http://localhost:9090/api/v1/metrics/country/France?start=2020-03-01&end=2020-03-10

## ✅ Example API Response

```bash
{
  "date": "2020-04-01",
  "cases_cumulative": 82301,
  "deaths_cumulative": 6508
}
```

## 🇫🇷 Country time series

- GET /api/v1/metrics/country/{countryName}

Example:

- GET /api/v1/metrics/country/France?start=2020-03-01&end=2020-03-10

Response:

```bash
[
  { "date": "2020-03-01", "cases_cum": 130, "deaths_cum": 2 },
  { "date": "2020-03-02", "cases_cum": 191, "deaths_cum": 3 },
  ...
]
```
