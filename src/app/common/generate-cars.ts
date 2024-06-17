import { addCars } from './add-cars';
import { createNewCar } from '../api';
import { removeCars } from './utils';

export function generateCars(): void {
  const carsName = [
    'Audi',
    'Toyota',
    'BMW',
    'Ford',
    'Honda',
    'Mazda',
    'Hyundai',
    'Nissan',
    'Renault',
    'Kia',
  ];
  const carsModel = [
    'A6',
    'S5',
    'Sonata',
    'Corolla',
    'Supra',
    'Murano',
    'Terrano',
    'Duster',
    'Kaptur',
    'Duster',
  ];

  for (let i = 0; i < 100; i = i + 1) {
    const randomName = carsName[Math.floor(Math.random() * carsName.length)];
    const randomModel = carsModel[Math.floor(Math.random() * carsName.length)];
    const randomColor = `#${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padEnd(6, '0')}`;

    createNewCar(`${randomName} ${randomModel}`, randomColor);
  }
  removeCars();
  addCars(1);
}
