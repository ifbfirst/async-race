import { animation } from './common/animation';
import { Winner } from './component/winner';
import { updateCountCars, updateCountWinners } from './common/utils';
import { CarInterface, WinnerInterface } from './interfaces';

export async function getCars(link: string) {
  let response = await fetch(link);
  if (response.ok) {
    let cars: Array<CarInterface> = await response.json();
    let countCars = response.headers.get('X-Total-Count');
    return { cars: cars, count: countCars };
  }
}

export async function getCar(id: number) {
  let response = await fetch(`http://127.0.0.1:3000/garage/${id}`);
  if (response.ok) {
    let car: CarInterface = await response.json();
    return car;
  }
}

export async function createNewCar(name: string, color: string): Promise<void> {
  if (!name) name = 'Unknown';
  let car = {
    name: name,
    color: color,
  };
  await fetch('http://127.0.0.1:3000/garage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(car),
  });
  updateCountCars();
}

export async function updateCar(
  name: string,
  color: string,
  id: string,
): Promise<void> {
  let roadWrapper = document.getElementById(`${id}`);
  let carIcon = <HTMLElement>roadWrapper?.querySelector('.car');
  let carName = <HTMLElement>roadWrapper?.getElementsByTagName('h3')[0];
  let car;
  if (!name) {
    car = {
      name: carName.textContent,
      color: color,
    };
    carName.textContent = `${carName.textContent}`;
    carIcon.style.color = `${color}`;
  } else {
    car = {
      name: name,
      color: color,
    };
    carIcon.style.color = `${color}`;
    carName.textContent = `${name}`;
  }

  let response = await fetch(`http://127.0.0.1:3000/garage/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(car),
  });
  await response.json();
}

export async function removeCar(id: string): Promise<void> {
  await fetch(`http://127.0.0.1:3000/garage/${id}`, {
    method: 'DELETE',
  });
  getWinner(Number(id)).then((data) => {
    if (data) removeWinner(id);
  });
  document.getElementById(`${id}`)?.remove();
  updateCountCars();
}

export async function startEngine(id: string) {
  document.getElementById(`A${id}`)?.classList.add('disabled');
  document.getElementById(`B${id}`)?.classList.remove('disabled');
  const first = document.getElementById('first');
  if (first) first.textContent = '';

  let response = await fetch(
    `http://127.0.0.1:3000/engine?id=${Number(id)}&status=started`,
    {
      method: 'PATCH',
    },
  );
  if (response.ok) {
    let data = await response.json();
    animation(id, data);
    return {
      id: id,
      velocity: data.velocity,
    };
  }
}

export async function stopEngine(id: string): Promise<void> {
  await fetch(`http://127.0.0.1:3000/engine?id=${Number(id)}&status=stopped`, {
    method: 'PATCH',
  });
}

export async function drive(id: string) {
  let response = await fetch(
    `http://127.0.0.1:3000/engine?id=${Number(id)}&status=drive`,
    {
      method: 'PATCH',
    },
  );
  return response;
}

export async function createWinner(
  id: number,
  wins: number,
  time: number,
): Promise<void> {
  const winner = {
    id: id,
    time: time,
    wins: wins,
  };
  await fetch('http://127.0.0.1:3000/winners', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(winner),
  });

  const newWinner = new Winner(id, wins, time);
  document
    .getElementsByTagName('table')[0]
    ?.appendChild(newWinner.getResultTag());
  updateCountWinners();
}

export async function getWinners(link: string) {
  let response = await fetch(link);
  if (response.ok) {
    let winners: Array<WinnerInterface> = await response.json();
    let countWinners = response.headers.get('X-Total-Count');
    return { winners: winners, count: countWinners };
  }
}

export async function getWinner(id: number) {
  let response = await fetch(`http://127.0.0.1:3000/winners/${id}`);
  if (response.ok) {
    let winner: WinnerInterface = await response.json();
    return winner;
  } else if (response.status === 404) {
    `Winner ${id} does't exist`;
  }
}

export async function updateWinner(
  id: number,
  wins: number,
  time: number,
): Promise<void> {
  let winner = {
    wins: wins,
    time: time,
  };

  await fetch(`http://127.0.0.1:3000/winners/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(winner),
  });
  document.getElementById(`tr${id}`)?.remove();
  const updateWinner = new Winner(id, wins, time);
  document
    .getElementsByTagName('table')[0]
    ?.appendChild(updateWinner.getResultTag());
}

export async function removeWinner(id: string): Promise<void> {
  document.getElementById(`tr${id}`)?.remove();
  await fetch(`http://127.0.0.1:3000/winners/${Number(id)}`, {
    method: 'DELETE',
  });
}
