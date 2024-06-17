import { createTag } from './common/tag-generator';
import { Garage } from './pages/garage';
import { Winners } from './pages/winners';
import './style.css';

export class App {
  private tagResult: HTMLElement;
  public getResultTag(): HTMLElement {
    return this.tagResult;
  }
  constructor() {
    this.tagResult = document.body;
  }

  public start(): void {
    const buttonGarage = createTag(
      'button',
      this.tagResult,
      'to garage',
      'main-button',
      'btnGarage',
    );
    const buttonWinners = createTag(
      'button',
      this.tagResult,
      'to winners',
      'main-button',
      'btnWinners',
    );

    // const buttonGarage = new Button('to garage', 'main-button', 'btnGarage');
    // this.tagResult.appendChild(buttonGarage.getResultTag());
    buttonGarage.onclick = this.toGarage.bind(this);
    // const buttonWinners = new Button('to winners', 'main-button', 'btnWinners');
    // this.tagResult.appendChild(buttonWinners.getResultTag());
    buttonWinners.onclick = this.toWinners.bind(this);
    new Garage();
    new Winners();
  }

  private toGarage(): void {
    const wrapperGarage = document.getElementById('wrapper-garage');
    if (wrapperGarage) wrapperGarage.style.display = 'block';
    const wrapperWinners = document.getElementById('wrapper-winners');
    if (wrapperWinners) wrapperWinners.style.display = 'none';
  }
  private toWinners(): void {
    const wrapperGarage = document.getElementById('wrapper-garage');
    if (wrapperGarage) wrapperGarage.style.display = 'none';
    const wrapperWinners = document.getElementById('wrapper-winners');
    if (wrapperWinners) wrapperWinners.style.display = 'block';
  }
}

export default App;
