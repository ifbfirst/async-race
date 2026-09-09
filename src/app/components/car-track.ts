import { Car } from '../types';
import { el } from '../dom';

const CAR_SVG = `
  <svg class="car-icon" viewBox="0 0 160 60" aria-hidden="true">
    <ellipse cx="42" cy="46" rx="13" ry="13" fill="#141414"/>
    <ellipse cx="42" cy="46" rx="7" ry="7" fill="#6b7280"/>
    <ellipse cx="118" cy="46" rx="13" ry="13" fill="#141414"/>
    <ellipse cx="118" cy="46" rx="7" ry="7" fill="#6b7280"/>
    <path d="M26 38c3-14 16-22 32-24l18-10h28l18 10c14 2 24 12 28 24v4H26v-4z"/>
    <path class="car-glass" d="M78 8h28l16 10H74z"/>
  </svg>
`;

const FLAG_SVG = `
  <svg class="flag-icon" viewBox="0 0 28 40" aria-hidden="true">
    <rect x="4" y="2" width="3" height="36" fill="#e8e8e8"/>
    <path d="M7 4h18v16H7z" fill="#111"/>
    <path fill="#f5f5f5" d="M7 4h6v4H7zm6 4h6v4h-6zm6-4h6v4h-6zM7 12h6v4H7zm12 0h6v4h-6zM13 16h6v4h-6z"/>
  </svg>
`;

type TrackHandlers = {
  onSelect: (id: number) => void;
  onRemove: (id: number) => void;
  onStart: (id: number) => void;
  onStop: (id: number) => void;
};

export class CarTrack {
  readonly root: HTMLElement;

  readonly carEl: HTMLElement;

  readonly car: Car;

  private readonly startBtn: HTMLButtonElement;

  private readonly stopBtn: HTMLButtonElement;

  private readonly lane: HTMLElement;

  private readonly nameEl: HTMLElement;

  constructor(car: Car, handlers: TrackHandlers) {
    this.car = car;
    this.root = el('article', {
      className: 'track',
      attrs: { 'data-car-id': String(car.id) },
    });

    const header = el('div', { className: 'track-head' });
    const selectBtn = el('button', {
      className: 'btn btn-tiny',
      text: 'Select',
      attrs: { type: 'button' },
    });
    const removeBtn = el('button', {
      className: 'btn btn-tiny btn-danger',
      text: 'Remove',
      attrs: { type: 'button' },
    });
    this.nameEl = el('h3', { className: 'track-name', text: car.name });
    header.append(selectBtn, removeBtn, this.nameEl);

    this.lane = el('div', { className: 'track-lane' });
    this.startBtn = el('button', {
      className: 'engine-btn',
      text: 'A',
      attrs: { type: 'button', title: 'Start engine' },
    });
    this.stopBtn = el('button', {
      className: 'engine-btn is-disabled',
      text: 'B',
      attrs: { type: 'button', title: 'Stop engine', disabled: 'true' },
    });
    this.carEl = el('div', { className: 'car', html: CAR_SVG });
    this.carEl.style.color = car.color;
    const flag = el('div', { className: 'flag', html: FLAG_SVG });

    this.lane.append(this.startBtn, this.stopBtn, this.carEl, flag);
    this.root.append(header, this.lane);

    selectBtn.addEventListener('click', () => handlers.onSelect(car.id));
    removeBtn.addEventListener('click', () => handlers.onRemove(car.id));
    this.startBtn.addEventListener('click', () => handlers.onStart(car.id));
    this.stopBtn.addEventListener('click', () => handlers.onStop(car.id));
  }

  getTravelDistance(): number {
    const flag = this.root.querySelector('.flag');
    if (!(flag instanceof HTMLElement)) return 0;
    return Math.max(
      0,
      flag.offsetLeft - this.carEl.offsetLeft - this.carEl.offsetWidth + 8,
    );
  }

  setSelected(selected: boolean): void {
    this.root.classList.toggle('is-selected', selected);
  }

  setDriving(driving: boolean): void {
    this.root.classList.toggle('is-driving', driving);
    this.root.classList.remove('is-broken');
    this.startBtn.disabled = driving;
    this.startBtn.classList.toggle('is-disabled', driving);
    this.stopBtn.disabled = !driving;
    this.stopBtn.classList.toggle('is-disabled', !driving);
  }

  markBroken(): void {
    this.root.classList.add('is-broken');
    this.startBtn.disabled = true;
    this.startBtn.classList.add('is-disabled');
    this.stopBtn.disabled = false;
    this.stopBtn.classList.remove('is-disabled');
  }

  update(name: string, color: string): void {
    this.car.name = name;
    this.car.color = color;
    this.nameEl.textContent = name;
    this.carEl.style.color = color;
  }

  resetPosition(): void {
    this.carEl.style.transform = 'translateX(0)';
    this.root.classList.remove('is-driving', 'is-broken');
    this.startBtn.disabled = false;
    this.startBtn.classList.remove('is-disabled');
    this.stopBtn.disabled = true;
    this.stopBtn.classList.add('is-disabled');
  }
}
