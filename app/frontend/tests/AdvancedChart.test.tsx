import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdvancedChart from '../src/components/AdvancedChart';

test('affiche un message quand aucune donnée', () => {
  render(<AdvancedChart data={[]} title="Analyse détaillée" />);

  expect(
    screen.getByText(/Aucune donnée disponible/i)
  ).toBeInTheDocument();

  expect(
    screen.getByText(/Sélectionnez une période avec des données/i)
  ).toBeInTheDocument();
});

test('affiche les contrôles et le récapitulatif quand il y a des données', () => {
  const data = [
    { date: '2020-01-01', cases: 10, deaths: 1 },
    { date: '2020-01-02', cases: 20, deaths: 2 },
    { date: '2020-01-03', cases: 35, deaths: 3 },
  ];

  render(<AdvancedChart data={data} title="Analyse France" />);

  // Boutons de type de graphique
  expect(
    screen.getByRole('button', { name: /Combiné/i })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /^Cas$/i })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /Décès/i })
  ).toBeInTheDocument();

  // Petit texte de récap en bas
  expect(
    screen.getByText(/Affichage:\s*3 points/i)
  ).toBeInTheDocument();
});
