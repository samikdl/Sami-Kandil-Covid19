import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';
import { test, expect, vi } from 'vitest';

vi.mock('../src/services/api', () => ({
  getGlobalMetrics: vi.fn().mockResolvedValue({
    date: '2023-01-01',
    cases_cumulative: 100,
    deaths_cumulative: 5,
  }),
  getCountryData: vi.fn().mockResolvedValue({
    country: 'France',
    series: [],
    latest: null,
  }),
  getAllCountriesLatestStats: vi.fn().mockResolvedValue([]),
  getTopCountries: vi.fn().mockResolvedValue([]),
  getAllCountries: vi.fn().mockResolvedValue(['France']),
}));

test('affiche les trois onglets principaux', () => {
  render(<App />);

  expect(screen.getByText(/Carte mondiale/i)).toBeInTheDocument();
  expect(screen.getByText(/Graphiques détaillés/i)).toBeInTheDocument();
  expect(screen.getByText(/Comparaison pays/i)).toBeInTheDocument();
});

test('permet de changer d’onglet', async () => {
  render(<App />);

  fireEvent.click(screen.getByText(/Graphiques détaillés/i));
  expect(
    await screen.findByText(/Analyse Détaillée/i)
  ).toBeInTheDocument();

  fireEvent.click(screen.getByText(/Comparaison pays/i));
  expect(
    await screen.findByText(/Comparaison Multi-Pays/i)
  ).toBeInTheDocument();
});
