import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChartCard from '../src/components/ChartCard';

test('affiche le titre et le contenu enfant', () => {
  render(
    <ChartCard title="Mon super graphe">
      <div>Données internes</div>
    </ChartCard>
  );

  expect(
    screen.getByText('Mon super graphe')
  ).toBeInTheDocument();

  expect(
    screen.getByText('Données internes')
  ).toBeInTheDocument();
});

test('applique la classe CSS passée en props', () => {
  const { container } = render(
    <ChartCard title="Titre" className="test-class">
      <span>Child</span>
    </ChartCard>
  );

  const root = container.firstElementChild as HTMLElement | null;
  expect(root).not.toBeNull();
  expect(root!.className).toMatch(/test-class/);
});
