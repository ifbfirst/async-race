import { addCars } from '../common/add-cars';
import {
  createCar,
  race,
  removeCars,
  reset,
  updateCountCars,
} from '../common/utils';
import { generateCars } from '../common/generate-cars';
import { Navigation } from '../component/navigation';
import { createTag, createTagInput } from '../common/tag-generator';

export class Garage {
  private tagResult: HTMLElement;
  private pageNumber: number;
  private navigation: Navigation;
  public getResultTag(): HTMLElement {
    return this.tagResult;
  }
  constructor() {
    this.navigation = new Navigation();
    this.tagResult = document.createElement('div');
    this.pageNumber = 1;
    this.tagResult.id = 'wrapper-garage';
    document.body.appendChild(this.tagResult);
    this.init();
    this.createAdminView();
    this.createGarageView();
  }
  private init(): void {
    this.navigation.onPreviousAction = () => {
      const btnPrevious = document.querySelectorAll('.previous-btn')[0];
      const btnNext = document.querySelectorAll('.next-btn')[0];
      btnNext?.classList.remove('disabled');
      if (this.pageNumber === 2) btnPrevious?.classList.add('disabled');
      this.pageNumber -= 1;
      removeCars();
      addCars(this.pageNumber);
    };
    this.navigation.onNextAction = () => {
      const btnPrevious = document.querySelectorAll('.previous-btn')[0];
      const btnNext = document.querySelectorAll('.next-btn')[0];
      const btnRace = document.getElementById('race');
      btnRace?.classList.remove('disabled');
      const first = document.getElementById('first');
      if (first) first.textContent = '';
      const h1 = document.getElementsByTagName('h1')[0];
      btnPrevious?.classList.remove('disabled');
      if (h1.textContent) {
        const countCars = parseInt(h1.textContent.replace(/\D+/g, ''));
        if (this.pageNumber === Math.floor(countCars / 7) || countCars === 0) {
          btnNext?.classList.add('disabled');
        }
      }
      this.pageNumber += 1;
      removeCars();
      addCars(this.pageNumber);
    };
  }
  private createGarageView(): void {
    createTag('h1', this.tagResult);
    updateCountCars();
    createTag('h2', this.tagResult, `Page ${this.pageNumber}`);
    createTag('div', this.tagResult, '', '', 'first');
    this.tagResult.appendChild(this.navigation.getResultTag());
    addCars(1);
  }

  private createAdminView(): void {
    const wrapperCreateCar = createTag('div', this.tagResult);
    createTagInput(wrapperCreateCar, 'text', 'name');
    createTagInput(wrapperCreateCar, 'color', 'color');
    const btnCreate = createTag(
      'button',
      wrapperCreateCar,
      'create',
      'main-button',
      'create',
    );
    btnCreate.onclick = () => createCar();
    const wrapperUpdateCar = document.createElement('div');
    this.tagResult.appendChild(wrapperUpdateCar);
    createTagInput(wrapperUpdateCar, 'text', 'name-change');
    createTagInput(wrapperUpdateCar, 'color', 'color-change');
    createTag(
      'button',
      wrapperUpdateCar,
      'update',
      'main-button disabled',
      'update',
    );
    const wrapperControlCars = document.createElement('div');
    this.tagResult.appendChild(wrapperControlCars);
    const btnRace = createTag(
      'button',
      wrapperControlCars,
      'race',
      'main-button',
      'race',
    );

    btnRace.onclick = () => race();
    const btnReset = createTag(
      'button',
      wrapperControlCars,
      'reset',
      'main-button disabled',
      'reset',
    );
    btnReset.onclick = () => reset();
    const btnGenerate = createTag(
      'button',
      wrapperControlCars,
      'generate cars',
      'main-button',
      'generate-cars',
    );
    btnGenerate.onclick = () => generateCars();
  }
}
