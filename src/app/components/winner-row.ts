import { Car, Winner } from '../types';
import { el } from '../dom';

const CAR_SVG = `
  <svg class="winner-car" viewBox="0 0 160 60" aria-hidden="true">
    <ellipse cx="42" cy="46" rx="13" ry="13" fill="#141414"/>
    <ellipse cx="42" cy="46" rx="7" ry="7" fill="#6b7280"/>
    <ellipse cx="118" cy="46" rx="13" ry="13" fill="#141414"/>
    <ellipse cx="118" cy="46" rx="7" ry="7" fill="#6b7280"/>
    <path d="M26 38c3-14 16-22 32-24l18-10h28l18 10c14 2 24 12 28 24v4H26v-4z"/>
    <path class="car-glass" d="M78 8h28l16 10H74z"/>
  </svg>
`;

export function createWinnerRow(
  position: number,
  winner: Winner,
  car: Car | null,
): HTMLTableRowElement {
  const row = el('tr');
  const carCell = el('td');
  const icon = el('div', { className: 'winner-car-wrap', html: CAR_SVG });
  icon.style.color = car?.color ?? '#9aa3b5';
  carCell.append(icon);

  const cells = [
    el('td', { text: String(position), className: 'num-cell' }),
    carCell,
    el('td', { text: car?.name ?? `Car #${winner.id}` }),
    el('td', { text: String(winner.wins) }),
    el('td', { text: winner.time.toFixed(2) }),
  ];
  row.append(...cells);
  return row;
}
