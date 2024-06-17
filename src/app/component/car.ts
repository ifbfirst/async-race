import { removeCar, startEngine, stopEngine, updateCar } from '../api';
import { createTag } from '../common/tag-generator';
import { backToStart } from '../common/utils';

export class Car {
  private tagResult: HTMLElement;
  name: string;
  color: string;
  id: string;
  public getResultTag(): HTMLElement {
    return this.tagResult;
  }
  constructor(name: string, color: string, id: string) {
    this.tagResult = createTag('div', null, '', 'road');
    this.name = name;
    this.color = color;
    this.tagResult.id = id;
    this.id = id;
    this.viewRoad();
  }

  private viewRoad(): void {
    const buttonSelect = createTag(
      'button',
      this.tagResult,
      'select',
      'main-button',
      'select',
    );
    buttonSelect.onclick = () => this.selectCar(this.id);
    const buttonRemove = createTag(
      'button',
      this.tagResult,
      'remove',
      'main-button',
      'remove',
    );
    buttonRemove.onclick = () => removeCar(this.id);
    createTag('h3', this.tagResult, this.name);
    const wrapperCar = createTag('div', this.tagResult, '', 'car-wrapper');
    const buttonA = createTag(
      'button',
      wrapperCar,
      'A',
      'car-button',
      `A${this.id}`,
    );
    buttonA.onclick = () => startEngine(this.id);
    const buttonB = createTag(
      'button',
      wrapperCar,
      'B',
      'car-button',
      `B${this.id}`,
    );
    buttonB.onclick = () => backToStart(this.id);

    const flagIcon = createTag('div', wrapperCar, '', 'flag');
    flagIcon.innerHTML = '<i class="fa-solid fa-flag"></i>';
    this.viewCar(flagIcon);
  }

  private viewCar(flagIcon: HTMLElement): void {
    const carIcon = createTag('div', null, '', 'car');
    flagIcon.before(carIcon);
    carIcon.innerHTML = '<i class="fa-solid fa-car-side"></i>';
    carIcon.style.color = this.color;
  }

  private selectCar(id: string): void {
    const colorChange = <HTMLInputElement>(
      document.getElementById('color-change')
    );
    colorChange?.classList.remove('disabled');
    const nameChange = <HTMLInputElement>document.getElementById('name-change');
    nameChange?.classList.remove('disabled');
    const btnUpdate = <HTMLButtonElement>document.getElementById('update');
    btnUpdate.classList.remove('disabled');

    if (nameChange && colorChange)
      btnUpdate.onclick = () =>
        updateCar(nameChange.value, colorChange.value, id);
  }
}
