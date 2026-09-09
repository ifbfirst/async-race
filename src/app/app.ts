import { el } from './dom';
import { GaragePage } from './pages/garage';
import { WinnersPage } from './pages/winners';
import { ViewName } from './types';

export class App {
  private readonly garage: GaragePage;

  private readonly winners: WinnersPage;

  private readonly garageTab: HTMLButtonElement;

  private readonly winnersTab: HTMLButtonElement;

  constructor() {
    const shell = el('div', { className: 'app' });
    const header = el('header', { className: 'topbar' });
    const brand = el('div', { className: 'brand' });
    brand.append(
      el('span', { className: 'brand-flag', attrs: { 'aria-hidden': 'true' } }),
      el('div', {
        className: 'brand-copy',
        html: '<p>Night circuit</p><h1>Async Race</h1>',
      }),
    );

    const nav = el('nav', { className: 'tabs' });
    this.garageTab = el('button', {
      className: 'tab is-active',
      text: 'Garage',
      attrs: { type: 'button' },
    });
    this.winnersTab = el('button', {
      className: 'tab',
      text: 'Winners',
      attrs: { type: 'button' },
    });
    nav.append(this.garageTab, this.winnersTab);
    header.append(brand, nav);

    this.garage = new GaragePage();
    this.winners = new WinnersPage();
    shell.append(header, this.garage.root, this.winners.root);
    document.body.append(shell);

    this.garageTab.addEventListener('click', () => void this.show('garage'));
    this.winnersTab.addEventListener('click', () => void this.show('winners'));
  }

  start(): void {
    void this.garage.load();
  }

  private async show(view: ViewName): Promise<void> {
    const garageOpen = view === 'garage';
    this.garage.root.classList.toggle('is-hidden', !garageOpen);
    this.winners.root.classList.toggle('is-hidden', garageOpen);
    this.garageTab.classList.toggle('is-active', garageOpen);
    this.winnersTab.classList.toggle('is-active', !garageOpen);
    if (!garageOpen) await this.winners.load();
  }
}

export default App;
