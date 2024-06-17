import { drive, stopEngine } from '../api';
import { showFirstCar, stopRace } from './utils';
import { Engine } from '../interfaces';

export const widthRoadElements = 180;
export let arrCars: string[] = [];
export let arrVel: number[] = [];
export let animationIDGlobal: number;

export function animation(id: string, data: Engine) {
  let animationID: number;
  const road = document.getElementById(`${id}`);
  const car = <HTMLElement>road?.querySelector('.car');
  const time = data.distance / data.velocity;
  if (road)
    animate(
      function (timePassed: number, duration: number, distance: number) {
        car.style.marginLeft = (distance / duration) * timePassed + 'px';
      },
      time,
      road?.offsetWidth - widthRoadElements,
    );

  drive(id).then((response) => {
    if (response.status === 500) {
      stopEngine(id);
      cancelAnimationFrame(animationID);
    } else if (response.status === 200) {
      arrCars.push(id);
      arrVel.push(data.velocity);
      if (arrCars.length === 1) {
        showFirstCar(arrCars[0], arrVel[0]);
        stopRace();
      }
    }
  });

  function animate(draw: Function, duration: number, distance: number) {
    let start = performance.now();

    requestAnimationFrame(function animate(time) {
      let timePassed = time - start;
      if (timePassed > duration) timePassed = duration;
      draw(timePassed, duration, distance);
      if (timePassed < duration) {
        animationID = requestAnimationFrame(animate);
        animationIDGlobal = animationID;
      }
    });
  }
}
