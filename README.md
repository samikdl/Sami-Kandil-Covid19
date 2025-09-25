# 📊 Covid19 Data Ingestion

## 🚀 Objective
This sprint consists of:

- Setting up the environment with Docker and PostgreSQL  
- Ingesting COVID-19 data (confirmed cases and deaths) into the database  
- Verifying that the data has been correctly inserted  

---

## 📂 Project Structure

app/
├── backend/
│ └── ingestion/ # Java Maven project (CSV reading + DB insertion)
│ ├── pom.xml
│ └── src/main/java/com/covid19/ingestion/Main.java
│
├── db/
│ ├── schema.sql # Table creation
│ └── seed.sql (optional) # Test data
│
└── docker-compose.yml # Docker config (Postgres + Adminer)

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

mvn -q exec:java -Dexec.mainClass="com.covid19.ingestion.Main" \
  -Dexec.args="--confirmed ./time_series_covid19_confirmed_global.csv \
               --deaths ./time_series_covid19_deaths_global.csv \
               --jdbc jdbc:postgresql://localhost:5433/covid \
               --user covid --pass covid"

✅ Verification

Run SQL queries in Adminer (or psql) to check that data was correctly inserted:

SELECT COUNT(*) FROM daily_stats;

SELECT d.date, d.cases_cum, d.deaths_cum
FROM daily_stats d
JOIN country c ON c.id = d.country_id
WHERE c.name = 'France'
ORDER BY d.date
LIMIT 10;

Expected: you should see cumulative cases and deaths for France by date.

