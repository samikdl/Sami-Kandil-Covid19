CREATE TABLE IF NOT EXISTS country (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  iso3        TEXT,
  population  BIGINT
);

CREATE TABLE IF NOT EXISTS daily_stats (
  id          BIGSERIAL PRIMARY KEY,
  country_id  INT NOT NULL REFERENCES country(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  cases_cum   BIGINT DEFAULT 0,
  deaths_cum  BIGINT DEFAULT 0,
  UNIQUE(country_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_stats_country_date
  ON daily_stats(country_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date
  ON daily_stats(date);
