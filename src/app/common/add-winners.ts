import { getCars, getWinners } from '../api';
import { Winner } from '../component/winner';

export function addWinners(page: number): void {
  const table = document.getElementsByTagName('table')[0];
  getWinners(`http://127.0.0.1:3000/winners?_page=${page}&_limit=10`).then(
    (data) => {
      if (data) {
        for (let i = 0; i < data.winners.length; i = i + 1) {
          const winner = new Winner(
            data.winners[i].id,
            data.winners[i].wins,
            data.winners[i].time,
          );

          table.appendChild(winner.getResultTag());
        }
        document.getElementsByTagName('h1')[1].textContent =
          `Winners(${data.count})`;
        document.getElementsByTagName('h2')[1].textContent = `Page ${page}`;
      }
    },
  );
}
