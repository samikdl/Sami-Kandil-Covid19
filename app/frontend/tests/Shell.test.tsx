import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Shell from '../src/layouts/Shell';

test('affiche le titre et le sous-titre du dashboard', () => {
  render(
    <Shell>
      <div>Contenu</div>
    </Shell>
  );

  expect(
    screen.getByText(/COVID-19 Global Dashboard/i)
  ).toBeInTheDocument();

  expect(
    screen.getByText(/Real-time monitoring system/i)
  ).toBeInTheDocument();
});
