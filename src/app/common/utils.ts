import { addCars } from './add-cars';
import {
  animationIDGlobal,
  arrCars,
  arrVel,
  widthRoadElements,
} from './animation';
import {
  createNewCar,
  createWinner,
  getCars,
  getWinner,
  getWinners,
  startEngine,
  stopEngine,
  updateWinner,
} from '../api';

export function race(): void {
  const raseBtn = document.getElementById('race');
  const winnersBtn = document.getElementById('btnWinners');
  winnersBtn?.classList.add('disabled');
  raseBtn?.classList.add('disabled');
  const idArray = getCarsID();
  arrCars.length = 0;
  arrVel.length = 0;
  for (let i = 0; i < idArray.length; i = i + 1) {
    startEngine(`${idArray[i]}`);
  }
}

export function stopRace(): void {
  const resetBtn = document.getElementById('reset');
  resetBtn?.classList.remove('disabled');
  const winnersBtn = document.getElementById('btnWinners');
  winnersBtn?.classList.remove('disabled');
}

export function reset(): void {
  const raseBtn = document.getElementById('race');
  const resetBtn = document.getElementById('reset');
  const first = document.getElementById('first');
  arrCars.length = 0;
  arrVel.length = 0;
  if (first) first.textContent = '';
  raseBtn?.classList.remove('disabled');
  resetBtn?.classList.add('disabled');
  const idArray = getCarsID();
  for (let i = 0; i < idArray.length; i = i + 1) {
    backToStart(idArray[i]);
  }
}

function getCarsID(): string[] {
  const roads = document.querySelectorAll('.road');
  const idArray: string[] = [];
  Array.from(roads).forEach((element) => {
    idArray.push(element.id);
  });
  return idArray;
}

export function backToStart(id: string): void {
  stopEngine(id);
  cancelAnimationFrame(animationIDGlobal);
  const btnA = document.getElementById(`A${id}`);
  btnA?.classList.remove('disabled');
  const btnB = document.getElementById(`B${id}`);
  btnB?.classList.add('disabled');
  const road = document.getElementById(`${id}`);
  const car = <HTMLElement>road?.querySelector('.car');
  car.style.marginLeft = '0px';
}

export function updateCountCars(): void {
  getCars('http://127.0.0.1:3000/garage').then((data) => {
    if (data) {
      document.getElementsByTagName('h1')[0].textContent =
        `Garage(${data.cars.length})`;
      if (data.cars.length > 7)
        document.querySelectorAll('.next-btn')[0]?.classList.remove('disabled');
    }
  });
}

export function createCar(): void {
  const color = <HTMLInputElement>document.getElementById('color');
  const name = <HTMLInputElement>document.getElementById('name');
  createNewCar(name.value, color.value).then(() => {
    removeCars();
    addCars(1);
  });
}

export function removeCars(): void {
  const roads = document.getElementsByClassName('road');
  Array.from(roads).forEach((element) => {
    element.remove();
  });
}

export function removeWinners(): void {
  const winners = document.getElementsByTagName('tr');
  Array.from(winners).forEach((element, index) => {
    if (index !== 0) element.remove();
  });
}
export function showFirstCar(id: string, velocity: number): void {
  const road = document.getElementById(id);
  const name = road?.getElementsByTagName('h3')[0].textContent;

  if (road) {
    let time = Number(
      ((road.offsetWidth - widthRoadElements) / velocity).toFixed(2),
    );
    const first = document.getElementById('first');

    if (first) {
      first.textContent = '';
      first.textContent = `${name} finished in ${time} s `;
    }
    writeWinner(id, time);
  }
}

function writeWinner(id: string, time: number): void {
  getWinner(Number(id)).then((data) => {
    if (data) {
      if (data.time < time) time = data.time;
      updateWinner(Number(id), data.wins + 1, time);
    } else {
      createWinner(Number(id), 1, time);
    }
  });
}

export function updateCountWinners(): void {
  console.log('hello');
  getWinners('http://127.0.0.1:3000/winners').then((data) => {
    if (data) {
      document.getElementsByTagName('h1')[1].textContent =
        `Winners (${data.winners.length})`;
      if (data.winners.length > 10)
        document.querySelectorAll('.next-btn')[1]?.classList.remove('disabled');
    }
  });
}
