export interface Car {
  id: number;
  name: string;
  color: string;
}

export interface Engine {
  velocity: number;
  distance: number;
}

export interface Winner {
  id: number;
  wins: number;
  time: number;
}

export interface PageResult<T> {
  items: T[];
  total: number;
}

export type SortField = 'wins' | 'time';
export type SortOrder = 'ASC' | 'DESC';
export type ViewName = 'garage' | 'winners';
