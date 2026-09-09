import { getCar, getWinners } from '../api';
import { Pagination } from '../components/pagination';
import { createWinnerRow } from '../components/winner-row';
import { WINNERS_PAGE_SIZE } from '../config';
import { el } from '../dom';
import { SortField, SortOrder } from '../types';

export class WinnersPage {
  readonly root: HTMLElement;

  private page = 1;

  private sort: SortField = 'wins';

  private order: SortOrder = 'DESC';

  private readonly title: HTMLElement;

  private readonly body: HTMLElement;

  private readonly table: HTMLTableElement;

  private readonly empty: HTMLElement;

  private readonly pager: Pagination;

  private readonly winsBtn: HTMLButtonElement;

  private readonly timeBtn: HTMLButtonElement;

  constructor() {
    this.root = el('section', {
      className: 'view view-winners is-hidden',
    });

    this.title = el('h1', { className: 'view-title', text: 'Winners' });
    const table = el('table', { className: 'winners-table' });
    const head = el('thead');
    const headRow = el('tr');
    this.winsBtn = el('button', {
      className: 'sort-btn is-active',
      text: 'Wins',
      attrs: { type: 'button' },
    });
    this.timeBtn = el('button', {
      className: 'sort-btn',
      text: 'Time',
      attrs: { type: 'button' },
    });
    const winsTh = el('th');
    const timeTh = el('th');
    winsTh.append(this.winsBtn);
    timeTh.append(this.timeBtn);
    headRow.append(
      el('th', { text: '#' }),
      el('th', { text: 'Car' }),
      el('th', { text: 'Name' }),
      winsTh,
      timeTh,
    );
    head.append(headRow);
    this.body = el('tbody');
    this.table = table;
    table.append(head, this.body);

    this.empty = el('div', {
      className: 'empty-state',
      text: 'No winners yet. Run a race in the garage.',
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

    this.root.append(this.title, table, this.empty, this.pager.root);

    this.winsBtn.addEventListener('click', () => this.toggleSort('wins'));
    this.timeBtn.addEventListener('click', () => this.toggleSort('time'));
  }

  async load(): Promise<void> {
    try {
      const { items, total } = await getWinners(
        this.page,
        WINNERS_PAGE_SIZE,
        this.sort,
        this.order,
      );
      const lastPage = Math.max(1, Math.ceil(total / WINNERS_PAGE_SIZE) || 1);
      if (this.page > lastPage) {
        this.page = lastPage;
        await this.load();
        return;
      }

      this.title.textContent = `Winners (${total})`;
      this.pager.setState(this.page, total, WINNERS_PAGE_SIZE);
      this.body.replaceChildren();

      const cars = await Promise.all(items.map((winner) => getCar(winner.id)));
      items.forEach((winner, index) => {
        const position = (this.page - 1) * WINNERS_PAGE_SIZE + index + 1;
        this.body.append(createWinnerRow(position, winner, cars[index]));
      });

    this.empty.textContent = 'No winners yet. Run a race in the garage.';
    this.empty.hidden = items.length > 0;
    this.table.hidden = items.length === 0;
      this.syncSortButtons();
    } catch {
      this.title.textContent = 'Winners';
      this.empty.hidden = false;
      this.table.hidden = true;
      this.empty.textContent =
        'Cannot reach the race server. Start it with npm run dev.';
    }
  }

  private toggleSort(field: SortField): void {
    if (this.sort === field) {
      this.order = this.order === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sort = field;
      this.order = field === 'time' ? 'ASC' : 'DESC';
    }
    this.page = 1;
    void this.load();
  }

  private syncSortButtons(): void {
    const winsLabel = this.sort === 'wins' ? `Wins ${this.arrow()}` : 'Wins';
    const timeLabel = this.sort === 'time' ? `Time ${this.arrow()}` : 'Time';
    this.winsBtn.textContent = winsLabel;
    this.timeBtn.textContent = timeLabel;
    this.winsBtn.classList.toggle('is-active', this.sort === 'wins');
    this.timeBtn.classList.toggle('is-active', this.sort === 'time');
  }

  private arrow(): string {
    return this.order === 'ASC' ? '↑' : '↓';
  }
}
