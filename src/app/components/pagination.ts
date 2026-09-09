import { el, setDisabled } from '../dom';

type PaginationHandlers = {
  onPrev: () => void;
  onNext: () => void;
};

export class Pagination {
  readonly root: HTMLElement;

  private prevBtn: HTMLButtonElement;

  private nextBtn: HTMLButtonElement;

  private label: HTMLElement;

  constructor(handlers: PaginationHandlers) {
    this.root = el('div', { className: 'pager' });
    this.prevBtn = el('button', {
      className: 'btn btn-ghost',
      text: 'Previous',
      attrs: { type: 'button' },
    });
    this.nextBtn = el('button', {
      className: 'btn btn-ghost',
      text: 'Next',
      attrs: { type: 'button' },
    });
    this.label = el('p', { className: 'pager-label', text: 'Page 1' });

    this.prevBtn.addEventListener('click', handlers.onPrev);
    this.nextBtn.addEventListener('click', handlers.onNext);

    this.root.append(this.prevBtn, this.label, this.nextBtn);
  }

  setState(page: number, total: number, pageSize: number): void {
    const lastPage = Math.max(1, Math.ceil(total / pageSize));
    this.label.textContent = `Page ${page} / ${lastPage}`;
    setDisabled(this.prevBtn, page <= 1);
    setDisabled(this.nextBtn, page >= lastPage);
  }
}
