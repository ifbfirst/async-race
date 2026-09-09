import {
  createCar,
  deleteCar,
  deleteWinner,
  drive,
  getCars,
  getWinner,
  saveRaceResult,
  startEngine,
  stopEngine,
  updateCar,
} from '../api';
import { animateCar, stopAllAnimations, stopAnimation } from '../animation';
import { CarTrack } from '../components/car-track';
import { Pagination } from '../components/pagination';
import { GARAGE_PAGE_SIZE } from '../config';
import { el, setDisabled } from '../dom';
import { generateCars } from '../generate';

export class GaragePage {
  readonly root: HTMLElement;

  private page = 1;

  private selectedId: number | null = null;

  private winnerLocked = false;

  private busy = false;

  private readonly tracks = new Map<number, CarTrack>();

  private readonly runToken = new Map<number, number>();

  private readonly title: HTMLElement;

  private readonly banner: HTMLElement;

  private readonly list: HTMLElement;

  private readonly empty: HTMLElement;

  private readonly pager: Pagination;

  private readonly nameInput: HTMLInputElement;

  private readonly colorInput: HTMLInputElement;

  private readonly updateName: HTMLInputElement;

  private readonly updateColor: HTMLInputElement;

  private readonly updateBtn: HTMLButtonElement;

  private readonly raceBtn: HTMLButtonElement;

  private readonly resetBtn: HTMLButtonElement;

  private readonly generateBtn: HTMLButtonElement;

  private readonly createBtn: HTMLButtonElement;

  constructor() {
    this.root = el('section', { className: 'view view-garage' });

    const panel = el('div', { className: 'panel' });
    const createRow = el('div', { className: 'control-row' });
    this.nameInput = el('input', {
      className: 'field',
      attrs: { type: 'text', placeholder: 'Car name', maxlength: '30' },
    });
    this.colorInput = el('input', {
      className: 'field-color',
      attrs: { type: 'color', value: '#c8f542' },
    });
    this.createBtn = el('button', {
      className: 'btn btn-primary',
      text: 'Create',
      attrs: { type: 'button' },
    });
    createRow.append(this.nameInput, this.colorInput, this.createBtn);

    const updateRow = el('div', { className: 'control-row' });
    this.updateName = el('input', {
      className: 'field',
      attrs: {
        type: 'text',
        placeholder: 'Select a car to update',
        maxlength: '30',
        disabled: 'true',
      },
    });
    this.updateColor = el('input', {
      className: 'field-color',
      attrs: { type: 'color', value: '#ff5a4e', disabled: 'true' },
    });
    this.updateBtn = el('button', {
      className: 'btn btn-primary is-disabled',
      text: 'Update',
      attrs: { type: 'button', disabled: 'true' },
    });
    updateRow.append(this.updateName, this.updateColor, this.updateBtn);

    const raceRow = el('div', { className: 'control-row race-row' });
    this.raceBtn = el('button', {
      className: 'btn btn-accent',
      text: 'Race',
      attrs: { type: 'button' },
    });
    this.resetBtn = el('button', {
      className: 'btn btn-ghost is-disabled',
      text: 'Reset',
      attrs: { type: 'button', disabled: 'true' },
    });
    this.generateBtn = el('button', {
      className: 'btn btn-ghost',
      text: 'Generate 100 cars',
      attrs: { type: 'button' },
    });
    raceRow.append(this.raceBtn, this.resetBtn, this.generateBtn);
    panel.append(createRow, updateRow, raceRow);

    this.title = el('h1', { className: 'view-title', text: 'Garage' });
    this.banner = el('p', {
      className: 'banner',
      text: 'Pit lane is open. Race when you are ready.',
    });
    this.list = el('div', { className: 'track-list' });
    this.empty = el('div', {
      className: 'empty-state',
      text: 'No cars in the pit. Create one or generate a field.',
    });
    this.pager = new Pagination({
      onPrev: () => {
        this.page -= 1;
        void this.load();
      },
      onNext: () => {
        this.page += 1;
        void this.load();
      },
    });

    this.root.append(
      panel,
      this.title,
      this.banner,
      this.list,
      this.empty,
      this.pager.root,
    );

    this.createBtn.addEventListener('click', () => void this.handleCreate());
    this.updateBtn.addEventListener('click', () => void this.handleUpdate());
    this.raceBtn.addEventListener('click', () => void this.handleRace());
    this.resetBtn.addEventListener('click', () => void this.handleReset());
    this.generateBtn.addEventListener(
      'click',
      () => void this.handleGenerate(),
    );
  }

  async load(): Promise<void> {
    try {
      const { items, total } = await getCars(this.page, GARAGE_PAGE_SIZE);
      const lastPage = Math.max(1, Math.ceil(total / GARAGE_PAGE_SIZE) || 1);
      if (this.page > lastPage) {
        this.page = lastPage;
        await this.load();
        return;
      }

      this.title.textContent = `Garage (${total})`;
      this.pager.setState(this.page, total, GARAGE_PAGE_SIZE);
      this.tracks.clear();
      this.list.replaceChildren();

      items.forEach((car) => {
        const track = new CarTrack(car, {
          onSelect: (id) => this.selectCar(id),
          onRemove: (id) => void this.handleRemove(id),
          onStart: (id) => void this.startCar(id, false),
          onStop: (id) => void this.stopCar(id),
        });
        this.tracks.set(car.id, track);
        this.list.append(track.root);
        if (this.selectedId === car.id) track.setSelected(true);
      });

      this.empty.hidden = items.length > 0;
      this.list.hidden = items.length === 0;
      setDisabled(this.raceBtn, items.length === 0 || this.busy);
    } catch {
      this.banner.textContent =
        'Cannot reach the race server. Start it with npm run dev.';
    }
  }

  private selectCar(id: number): void {
    this.selectedId = id;
    const track = this.tracks.get(id);
    this.tracks.forEach((item) => item.setSelected(item.car.id === id));
    if (!track) return;
    this.updateName.value = track.car.name;
    this.updateColor.value = track.car.color;
    this.updateName.disabled = false;
    this.updateColor.disabled = false;
    setDisabled(this.updateBtn, false);
  }

  private async handleCreate(): Promise<void> {
    await createCar(this.nameInput.value.trim(), this.colorInput.value);
    this.nameInput.value = '';
    this.page = Number.MAX_SAFE_INTEGER;
    await this.load();
  }

  private async handleUpdate(): Promise<void> {
    if (this.selectedId === null) return;
    const name = this.updateName.value.trim();
    const color = this.updateColor.value;
    const updated = await updateCar(this.selectedId, name || 'Unknown', color);
    this.tracks.get(updated.id)?.update(updated.name, updated.color);
  }

  private async handleRemove(id: number): Promise<void> {
    stopAnimation(id);
    await deleteCar(id);
    const winner = await getWinner(id);
    if (winner) await deleteWinner(id);
    if (this.selectedId === id) {
      this.selectedId = null;
      this.updateName.value = '';
      this.updateName.disabled = true;
      this.updateColor.disabled = true;
      setDisabled(this.updateBtn, true);
    }
    await this.load();
  }

  private nextRun(id: number): number {
    const token = (this.runToken.get(id) ?? 0) + 1;
    this.runToken.set(id, token);
    return token;
  }

  private async startCar(id: number, recordWinner: boolean): Promise<void> {
    const track = this.tracks.get(id);
    if (!track || track.root.classList.contains('is-driving')) return;
    const token = this.nextRun(id);
    track.setDriving(true);
    try {
      const engine = await startEngine(id);
      if (this.runToken.get(id) !== token) return;
      const durationMs = engine.distance / engine.velocity;
      animateCar(track.carEl, track.getTravelDistance(), durationMs, id);
      const status = await drive(id);
      if (this.runToken.get(id) !== token) return;
      if (status !== 200) {
        stopAnimation(id);
        track.markBroken();
        return;
      }
      if (recordWinner && !this.winnerLocked) {
        this.winnerLocked = true;
        const time = Number((durationMs / 1000).toFixed(2));
        this.banner.textContent = `${track.car.name} finished first in ${time}s`;
        this.banner.classList.add('is-win');
        await saveRaceResult(id, time);
      }
    } catch {
      if (this.runToken.get(id) === token) {
        stopAnimation(id);
        track.markBroken();
      }
    }
  }

  private async stopCar(id: number): Promise<void> {
    this.nextRun(id);
    stopAnimation(id);
    await stopEngine(id).catch(() => undefined);
    this.tracks.get(id)?.resetPosition();
  }

  private async handleRace(): Promise<void> {
    if (this.tracks.size === 0) return;
    this.busy = true;
    this.winnerLocked = false;
    this.banner.classList.remove('is-win');
    this.banner.textContent = 'Green flag. Engines are live.';
    setDisabled(this.raceBtn, true);
    setDisabled(this.generateBtn, true);
    setDisabled(this.createBtn, true);
    setDisabled(this.resetBtn, true);

    await Promise.all(
      [...this.tracks.keys()].map((id) => this.startCar(id, true)),
    );

    this.busy = false;
    setDisabled(this.resetBtn, false);
    setDisabled(this.generateBtn, false);
    setDisabled(this.createBtn, false);
    if (!this.winnerLocked) {
      this.banner.textContent = 'No finisher this heat. Reset and try again.';
    }
  }

  private async handleReset(): Promise<void> {
    stopAllAnimations();
    await Promise.all(
      [...this.tracks.keys()].map((id) => {
        this.nextRun(id);
        return stopEngine(id).catch(() => undefined);
      }),
    );
    this.tracks.forEach((track) => track.resetPosition());
    this.winnerLocked = false;
    this.banner.classList.remove('is-win');
    this.banner.textContent = 'Cars back on the grid.';
    setDisabled(this.resetBtn, true);
    setDisabled(this.raceBtn, this.tracks.size === 0);
  }

  private async handleGenerate(): Promise<void> {
    setDisabled(this.generateBtn, true);
    this.banner.textContent = 'Building a full grid…';
    await generateCars();
    this.page = 1;
    await this.load();
    this.banner.textContent = '100 cars rolled into the garage.';
    setDisabled(this.generateBtn, false);
  }
}
