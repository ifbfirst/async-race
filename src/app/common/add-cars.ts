import { getCars } from '../api';
import { Car } from '../component/car';

export function addCars(page: number): void {
  getCars(`http://127.0.0.1:3000/garage?_page=${page}&_limit=7`).then(
    (data) => {
      if (!data) return;
        for (let i = 0; i < data.cars.length; i = i + 1) {
          const car = new Car(
            data.cars[i].name,
            data.cars[i].color,
            data.cars[i].id,
          );
          document
            .getElementById('wrapper-garage')
            ?.appendChild(car.getResultTag());
        }
        document.getElementsByTagName('h1')[0].textContent =
          `Garage(${data.count})`;
        document.getElementsByTagName('h2')[0].textContent = `Page ${page}`;
      }
  );
}
