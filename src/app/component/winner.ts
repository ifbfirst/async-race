import { getCar } from '../api';

export class Winner {
  private tagResult: HTMLElement;
  id: number;
  wins: number;
  time: number;
  public getResultTag(): HTMLElement {
    return this.tagResult;
  }
  constructor(id: number, wins: number, time: number) {
    this.tagResult = document.createElement('tr');
    this.id = id;
    this.wins = wins;
    this.time = time;
    this.tagResult.id = `tr${id}`;
    this.viewWinner(id);
  }

  private viewWinner(id: number): void {
    getCar(id).then((data) => {
      let arr = [
        this.id,
        `<i class="fa-solid fa-car-side" style="color:${data?.color};"</i>`,
        data?.name,
        this.wins,
        this.time,
      ];
      for (let i = 0; i < arr.length; i = i + 1) {
        const td = document.createElement('td');
        this.tagResult.appendChild(td);
        td.innerHTML = `${arr[i]}`;
      }
    });
  }
}
