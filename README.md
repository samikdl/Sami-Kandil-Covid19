📊 Covid19 Data Ingestion

🚀 Objectif

Ce sprint consiste à :

Mettre en place l’environnement avec Docker et PostgreSQL.

Ingestion des données COVID-19 (cas confirmés et décès) dans la base de données.

Vérification que les données ont bien été insérées.

Structure du projet

app/
├── backend/
│   └── ingestion/       # Projet Java Maven (lecture CSV + insertion DB)
│       ├── pom.xml
│       └── src/main/java/com/covid19/ingestion/Main.java
├── db/
│   ├── schema.sql       # Création des tables
│   └── seed.sql         # (optionnel) données de test
└── docker-compose.yml   # Configuration Docker (Postgres + Adminer)
