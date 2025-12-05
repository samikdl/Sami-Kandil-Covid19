# Technical Documentation - COVID-19 Dashboard

## 1. Project Overview
The **COVID-19 Dashboard** is a full-stack application designed to visualize global pandemic data. It provides real-time tracking of confirmed cases and deaths through an interactive map, detailed charts, and comparative tools. The system is composed of a Spring Boot backend, a React frontend, and a PostgreSQL database, with a dedicated data ingestion module.

## 2. Architecture
The project follows a decoupled **Client-Server** architecture:

* **Frontend (SPA)**: Built with **React** and **Vite**, responsible for the user interface and data visualization.
* **Backend (API)**: A **Spring Boot** application exposing REST endpoints to serve COVID-19 metrics.
* **Database**: **PostgreSQL** instance storing countries and daily statistics.
* **Ingestion (ETL)**: A standalone Java CLI tool to parse CSV data sources and populate the database.

## 3. Technology Stack

### Backend
* **Language**: Java 21
* **Framework**: Spring Boot 3.3.4
* **Build Tool**: Maven
* **Database Access**: Spring JDBC / `JdbcTemplate`
* **Documentation**: OpenAPI (SpringDoc)

### Frontend
* **Framework**: React 19
* **Build Tool**: Vite
* **Language**: TypeScript
* **Styling**: Tailwind CSS
* **Visualization**: Recharts (charts), Leaflet (maps)
* **Icons**: Lucide React

### Infrastructure
* **Containerization**: Docker & Docker Compose
* **Services**:
    * `db`: PostgreSQL 16
    * `adminer`: Database management interface

## 4. Database Schema
The database is normalized into two main tables:

### `country`
Stores static information about countries.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `SERIAL` (PK) | Internal unique identifier |
| `name` | `TEXT` | Unique country name |
| `iso3` | `TEXT` | ISO 3166-1 alpha-3 code |
| `population` | `BIGINT` | Total population |

### `daily_stats`
Stores time-series data for each country.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `BIGSERIAL` (PK) | Internal unique identifier |
| `country_id` | `INT` (FK) | Reference to `country` table |
| `date` | `DATE` | The date of the record |
| `cases_cum` | `BIGINT` | Cumulative confirmed cases |
| `deaths_cum` | `BIGINT` | Cumulative deaths |

*Index created on `(country_id, date)` to enforce uniqueness and optimize queries.*

## 5. API Endpoints
The backend exposes the following REST endpoints under `/api/v1/metrics`:

### Global Metrics
* **GET** `/global`
    * **Query Params**: `date` (optional, YYYY-MM-DD)
    * **Response**: Global cumulative cases and deaths for the specified date (or latest available).

### Country Metrics
* **GET** `/country/{name}`
    * **Path Var**: `name` (Country name, e.g., "France")
    * **Query Params**: `start`, `end` (optional date range)
    * **Response**: Detailed time-series data and latest statistics for the specific country.

### Listings & Rankings
* **GET** `/countries`
    * **Response**: List of all available country names.
* **GET** `/countries/latest`
    * **Response**: Latest statistics for all countries (optimized for map display).
* **GET** `/countries/top`
    * **Query Params**: `metric` ("cases" or "deaths"), `limit` (default 10)
    * **Response**: Top N countries sorted by the specified metric.

## 6. Data Ingestion Process
Data is ingested from CSV files (sourced from Johns Hopkins CSSE) using a custom Java tool located in `backend/ingestion`.

**Workflow:**
1.  **Read**: Parses `--confirmed` and `--deaths` CSV files using `opencsv`.
2.  **Transform**:
    * Parses dates from header columns (format `M/d/yy` converted to `YYYY-MM-DD`).
    * Aggregates data by `(Country, Date)` key.
3.  **Load**: Upserts data into PostgreSQL using JDBC batch operations to handle conflicts gracefully.

**Command:**
```bash
mvn exec:java -Dexec.mainClass="com.covid19.ingestion.Main" \
  -Dexec.args="--confirmed [path_to_confirmed.csv] \
               --deaths [path_to_deaths.csv] \
               --jdbc jdbc:postgresql://localhost:5433/covid \
               --user covid --pass covid"
```

## 7. Frontend Application Structure
The frontend is structured around a main shell layout and dashboard components.

* **Entry Point**: `src/main.tsx` renders the `App` component within a strict mode.
* **Services**: `src/services/api.ts` handles all HTTP fetches to the Spring Boot backend using the `fetch` API.
* **Key Components**:
    * **`WorldMap`**: Interactive Leaflet map displaying bubbles proportional to case/death counts.
    * **`AdvancedChart`**: A composed chart (Line + Bar) visualizing trends and moving averages over time.
    * **`CountryComparison`**: Allows users to compare statistics between multiple countries.
    * **`StatsPanel`**: Displays KPIs and controls for date/country selection.

## 8. Setup Instructions

### Prerequisites
* Java 21
* Node.js 20+
* Docker & Docker Compose

### Step 1: Start Infrastructure
Start the PostgreSQL database container:
```bash
docker-compose up -d
Port mapping: Host 5433 -> Container 5432.
```

### Step 2: Initialize Database
The schema is automatically applied via the volume mount ./db/schema.sql:/docker-entrypoint-initdb.d/00_schema.sql on the first container startup.

### Step 3: Run Backend

Navigate to the backend directory and run the Spring Boot application:
```bash

cd backend
mvn spring-boot:run
```
The API will be accessible at http://localhost:9090.

### Step 4: Run Frontend

Navigate to the frontend directory, install dependencies, and start the development server:
```bash
cd frontend
npm install
npm run dev
```
The application will be accessible at http://localhost:5173.