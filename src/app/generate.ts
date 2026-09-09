import { createCar } from './api';
import { GENERATE_COUNT } from './config';

const BRANDS = [
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

const MODELS = [
  'A6',
  'S5',
  'Sonata',
  'Corolla',
  'Supra',
  'Murano',
  'Terrano',
  'Duster',
  'Kaptur',
  'Stinger',
];

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function randomColor(): string {
  return `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0')}`;
}

export async function generateCars(): Promise<void> {
  const jobs = Array.from({ length: GENERATE_COUNT }, () =>
    createCar(`${pick(BRANDS)} ${pick(MODELS)}`, randomColor()),
  );
  await Promise.all(jobs);
}
