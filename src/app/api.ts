import { API_URL } from './config';
import { Car, Engine, PageResult, SortField, SortOrder, Winner } from './types';

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<{ data: T; total: number }> {
  const response = await fetch(`${API_URL}${path}`, init);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${path}`);
  }
  const totalHeader = response.headers.get('X-Total-Count');
  const data = (await response.json()) as T;
  return { data, total: totalHeader ? Number(totalHeader) : 0 };
}

export async function getCars(
  page: number,
  limit: number,
): Promise<PageResult<Car>> {
  const { data, total } = await request<Car[]>(
    `/garage?_page=${page}&_limit=${limit}`,
  );
  return { items: data, total };
}

export async function getCar(id: number): Promise<Car | null> {
  const response = await fetch(`${API_URL}/garage/${id}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Failed to load car ${id}`);
  return response.json() as Promise<Car>;
}

export async function createCar(name: string, color: string): Promise<Car> {
  const { data } = await request<Car>('/garage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name || 'Unknown', color }),
  });
  return data;
}

export async function updateCar(
  id: number,
  name: string,
  color: string,
): Promise<Car> {
  const { data } = await request<Car>(`/garage/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, color }),
  });
  return data;
}

export async function deleteCar(id: number): Promise<void> {
  await request(`/garage/${id}`, { method: 'DELETE' });
}

export async function startEngine(id: number): Promise<Engine> {
  const { data } = await request<Engine>(`/engine?id=${id}&status=started`, {
    method: 'PATCH',
  });
  return data;
}

export async function stopEngine(id: number): Promise<void> {
  await request(`/engine?id=${id}&status=stopped`, { method: 'PATCH' });
}

export async function drive(id: number): Promise<number> {
  const response = await fetch(`${API_URL}/engine?id=${id}&status=drive`, {
    method: 'PATCH',
  });
  return response.status;
}

export async function getWinners(
  page: number,
  limit: number,
  sort?: SortField,
  order?: SortOrder,
): Promise<PageResult<Winner>> {
  const sortQuery = sort && order ? `&_sort=${sort}&_order=${order}` : '';
  const { data, total } = await request<Winner[]>(
    `/winners?_page=${page}&_limit=${limit}${sortQuery}`,
  );
  return { items: data, total };
}

export async function getWinner(id: number): Promise<Winner | null> {
  const response = await fetch(`${API_URL}/winners/${id}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Failed to load winner ${id}`);
  return response.json() as Promise<Winner>;
}

export async function createWinner(
  id: number,
  wins: number,
  time: number,
): Promise<Winner> {
  const { data } = await request<Winner>('/winners', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, wins, time }),
  });
  return data;
}

export async function updateWinner(
  id: number,
  wins: number,
  time: number,
): Promise<Winner> {
  const { data } = await request<Winner>(`/winners/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wins, time }),
  });
  return data;
}

export async function deleteWinner(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/winners/${id}`, {
    method: 'DELETE',
  });
  if (response.status === 404) return;
  if (!response.ok) throw new Error(`Failed to delete winner ${id}`);
}

export async function saveRaceResult(
  id: number,
  time: number,
): Promise<Winner> {
  const current = await getWinner(id);
  if (!current) {
    return createWinner(id, 1, time);
  }
  return updateWinner(id, current.wins + 1, Math.min(current.time, time));
}
