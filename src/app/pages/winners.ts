import { addWinners } from '../common/add-winners';
import { Navigation } from '../component/navigation';
import { removeWinners, updateCountWinners } from '../common/utils';
import { createTag } from '../common/tag-generator';

export class Winners {
  private tagResult: HTMLElement;
  private pageNumber: number;
  private navigation: Navigation;
  constructor() {
    this.navigation = new Navigation();
    this.tagResult = document.createElement('div');
    this.pageNumber = 1;
    this.init();
    this.createWinnersView();
  }

  private init(): void {
    document.body.appendChild(this.tagResult);
    this.tagResult.id = 'wrapper-winners';

    this.navigation.onPreviousAction = () => {
      const btnPrevious = document.querySelectorAll('.previous-btn')[1];
      const btnNext = document.querySelectorAll('.next-btn')[1];
      btnNext?.classList.remove('disabled');
      if (this.pageNumber === 2) btnPrevious?.classList.add('disabled');
      this.pageNumber -= 1;
      removeWinners();
      addWinners(this.pageNumber);
    };
    this.navigation.onNextAction = () => {
      const btnPrevious = document.querySelectorAll('.previous-btn')[1];
      const btnNext = document.querySelectorAll('.next-btn')[1];
      const h1 = document.getElementsByTagName('h1')[1];
      if (h1.textContent) {
        const countCars = parseInt(h1.textContent.replace(/\D+/g, ''));
        if (this.pageNumber === Math.floor(countCars / 10) || countCars === 0) {
          btnNext?.classList.add('disabled');
        }
      }
      removeWinners();
      this.pageNumber += 1;

      btnPrevious?.classList.remove('disabled');
      addWinners(this.pageNumber);
    };
  }

  private createWinnersView(): void {
    this.tagResult.style.display = 'none';
    createTag('h1', this.tagResult);

    updateCountWinners();
    createTag('h2', this.tagResult, `Page(${this.pageNumber})`);
    this.tagResult.appendChild(this.navigation.getResultTag());
    const table = createTag('table', this.tagResult);
    const tr = createTag('tr', table);
    let arrayNameOfTH = ['Number', 'Car', 'Name', 'Wins', 'Time'];
    for (let i = 0; i < arrayNameOfTH.length; i = i + 1) {
      const th = document.createElement('th');
      th.textContent = `${arrayNameOfTH[i]}`;
      tr.appendChild(th);
    }
    addWinners(1);
  }
}
