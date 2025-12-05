# COVID-19 Dashboard - Projet Full Stack

## 📋 Description

Application web de suivi et visualisation des données COVID-19 à l'échelle mondiale avec :
- Dashboard interactif en temps réel
- Carte mondiale Leaflet
- Graphiques avancés avec Recharts
- Comparaison multi-pays
- API REST Spring Boot
- Base de données PostgreSQL

## 🏗️ Architecture

```
Projet
├── frontend/          # React + TypeScript + Vite
├── backend/           # Spring Boot + Java 21
├── database/          # Scripts PostgreSQL
└── ingestion/         # ETL pour importer les données CSV
```

## 🚀 Démarrage rapide

### Prérequis

- Java 21
- Node.js 18+
- PostgreSQL 15+
- Maven 3.8+

### 1. Base de données

```bash
# Créer la base
psql -U postgres
CREATE DATABASE covid;
CREATE USER covid WITH PASSWORD 'covid';
GRANT ALL PRIVILEGES ON DATABASE covid TO covid;
\q

# Exécuter le schéma
psql -U covid -d covid -f database/schema.sql
```

### 2. Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
# API disponible sur http://localhost:9090
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# Application disponible sur http://localhost:5173
```

### 4. Ingestion des données

```bash
cd ingestion
mvn clean compile
mvn exec:java -Dexec.mainClass="com.covid19.ingestion.Main" \
  -Dexec.args="--confirmed data/time_series_covid19_confirmed_global.csv \
               --deaths data/time_series_covid19_deaths_global.csv \
               --jdbc jdbc:postgresql://localhost:5433/covid \
               --user covid \
               --pass covid"
```

## 📱 Test sur mobile

### Méthode 1 : DevTools (Simulation)
- Chrome DevTools → Toggle device toolbar (`Ctrl+Shift+M`)
- Sélectionner un appareil mobile

### Méthode 2 : Réseau local (Vrai téléphone)

1. Trouver votre IP :
   ```bash
   ip addr show | grep "inet " | grep -v 127.0.0.1
   ```

2. Lancer le frontend avec `--host` :
   ```bash
   cd frontend
   npm run dev -- --host
   ```

3. Sur votre téléphone (même WiFi) :
   - Ouvrir : `http://VOTRE_IP:5173`

4. Mettre à jour `.env` :
   ```
   VITE_API_BASE=http://VOTRE_IP:9090/api/v1
   ```

## 📊 Fonctionnalités

### Onglet 1 : Carte mondiale
- Carte interactive Leaflet avec cercles proportionnels
- Clic sur pays pour sélection
- Stats globales en temps réel
- Top 15 pays les plus touchés
- Timeline et sparkline

### Onglet 2 : Graphiques détaillés
- Sélection de pays (dropdown)
- Sélection de période (date range avec presets)
- Graphiques avec moyenne mobile
- Zoom interactif
- Histogrammes et courbes combinés

### Onglet 3 : Comparaison multi-pays
- Comparaison jusqu'à 8 pays simultanément
- Graphiques multi-séries
- Cache optimisé pour performance

## 🎨 Technologies

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Leaflet
- Lucide Icons

### Backend
- Spring Boot 3.3
- Java 21
- PostgreSQL Driver
- OpenAPI (Swagger)

### Base de données
- PostgreSQL 15
- 2 tables : `country`, `daily_stats`

## 📚 API Endpoints

```
GET  /api/v1/metrics/global                    # Stats globales
GET  /api/v1/metrics/country/{name}            # Données d'un pays
GET  /api/v1/metrics/countries                 # Liste des pays
GET  /api/v1/metrics/countries/latest          # Dernières stats de tous les pays
GET  /api/v1/metrics/countries/top             # Top N pays
```

## 🧪 Tests

### Frontend
```bash
cd frontend
npm run test
npm run test:coverage
```

### Backend
```bash
cd backend
mvn test
mvn verify
```

## 📦 Build Production

### Frontend
```bash
cd frontend
npm run build
# Fichiers dans dist/
```

### Backend
```bash
cd backend
mvn clean package
# JAR dans target/api-1.0.0.jar
java -jar target/api-1.0.0.jar
```

## 🔧 Configuration

### Frontend - `.env`
```env
VITE_API_BASE=http://localhost:9090/api/v1
```

### Backend - `application.yml`
```yaml
server:
  port: 9090

spring:
  datasource:
    url: jdbc:postgresql://localhost:5433/covid
    username: covid
    password: covid
```

## 👥 Auteurs

- Développement : Sami Kandil
- Formation : Projet académique

## 📄 Licence

Projet éducatif - Données : Johns Hopkins CSSE