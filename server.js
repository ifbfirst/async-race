const fs = require('fs');
const http = require('http');
const path = require('path');

const HOST = '0.0.0.0';
const PORT = Number(process.env.PORT) || 3000;
const DIST = path.join(__dirname, 'dist');

const garage = [
  { name: 'Tesla', color: '#e6e6fa', id: 1 },
  { name: 'BMW', color: '#fede00', id: 2 },
  { name: 'Mersedes', color: '#6c779f', id: 3 },
  { name: 'Ford', color: '#ef3c40', id: 4 },
];

const winners = [{ id: 1, wins: 1, time: 10 }];

const engineState = { velocity: {}, blocked: {} };

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.map': 'application/json',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
};

function applyCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
}

function send(res, status, body, headers = {}) {
  applyCors(res);
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  if (typeof body === 'string' || Buffer.isBuffer(body)) {
    res.writeHead(status);
    res.end(body);
    return;
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.writeHead(status);
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 1e6) {
        reject(new Error('Payload too large'));
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function paginate(list, query) {
  const page = Number(query.get('_page')) || 1;
  const limit = Number(query.get('_limit')) || list.length;
  const start = (page - 1) * limit;
  return list.slice(start, start + limit);
}

function sortList(list, query) {
  const field = query.get('_sort');
  if (!field) return [...list];
  const order = (query.get('_order') || 'ASC').toUpperCase() === 'DESC' ? -1 : 1;
  return [...list].sort((a, b) => {
    if (a[field] < b[field]) return -1 * order;
    if (a[field] > b[field]) return 1 * order;
    return 0;
  });
}

function nextGarageId() {
  return garage.reduce((max, car) => Math.max(max, car.id), 0) + 1;
}

function serveStatic(urlPath, res) {
  const relative =
    urlPath === '/' ? 'index.html' : decodeURIComponent(urlPath).replace(/^\/+/, '');
  const filePath = path.normalize(path.join(DIST, relative));
  if (!filePath.startsWith(DIST)) {
    send(res, 403, { error: 'Forbidden' });
    return true;
  }
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return false;
  }
  const body = fs.readFileSync(filePath);
  send(res, 200, body, {
    'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream',
  });
  return true;
}

function handleEngine(query, res) {
  const id = query.get('id');
  const status = query.get('status');

  if (!id || Number.isNaN(+id) || +id <= 0) {
    send(
      res,
      400,
      'Required parameter "id" is missing. Should be a positive number',
      { 'Content-Type': 'text/plain; charset=utf-8' },
    );
    return;
  }

  if (!status || !/^(started)|(stopped)|(drive)$/.test(status)) {
    send(
      res,
      400,
      `Wrong parameter "status". Expected: "started", "stopped" or "drive". Received: "${status}"`,
      { 'Content-Type': 'text/plain; charset=utf-8' },
    );
    return;
  }

  if (!garage.find((car) => car.id === +id)) {
    send(res, 404, 'Car with such id was not found in the garage.', {
      'Content-Type': 'text/plain; charset=utf-8',
    });
    return;
  }

  const distance = 500000;

  if (status === 'drive') {
    if (engineState.blocked[id]) {
      send(
        res,
        429,
        "Drive already in progress. You can't run drive for the same car twice while it's not stopped.",
        { 'Content-Type': 'text/plain; charset=utf-8' },
      );
      return;
    }

    const velocity = engineState.velocity[id];
    if (!velocity) {
      send(
        res,
        404,
        'Engine parameters for car with such id was not found in the garage. Have you tried to set engine status to "started" before?',
        { 'Content-Type': 'text/plain; charset=utf-8' },
      );
      return;
    }

    engineState.blocked[id] = true;
    const duration = Math.round(distance / velocity);
    delete engineState.velocity[id];

    if (new Date().getMilliseconds() % 3 === 0) {
      setTimeout(
        () => {
          delete engineState.blocked[id];
          send(
            res,
            500,
            "Car has been stopped suddenly. It's engine was broken down.",
            { 'Content-Type': 'text/plain; charset=utf-8' },
          );
        },
        (Math.random() * duration) ^ 0,
      );
    } else {
      setTimeout(() => {
        delete engineState.blocked[id];
        send(res, 200, { success: true });
      }, duration);
    }
    return;
  }

  const delay = query.get('speed') ? +query.get('speed') : (Math.random() * 2000) ^ 0;
  const velocity =
    status === 'started' ? Math.max(50, (Math.random() * 200) ^ 0) : 0;

  if (velocity) {
    engineState.velocity[id] = velocity;
  } else {
    delete engineState.velocity[id];
    delete engineState.blocked[id];
  }

  setTimeout(() => {
    send(res, 200, { velocity, distance });
  }, delay);
}

const server = http.createServer(async (req, res) => {
  applyCors(res);
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  const { pathname } = url;
  const garageMatch = pathname.match(/^\/garage(?:\/(\d+))?$/);
  const winnersMatch = pathname.match(/^\/winners(?:\/(\d+))?$/);

  try {
    if (req.method === 'GET' && pathname === '/health') {
      send(res, 200, 'ok', { 'Content-Type': 'text/plain; charset=utf-8' });
      return;
    }

    if (req.method === 'PATCH' && pathname === '/engine') {
      handleEngine(url.searchParams, res);
      return;
    }

    if (garageMatch) {
      const id = garageMatch[1] ? Number(garageMatch[1]) : null;
      if (req.method === 'GET' && id === null) {
        const items = paginate(garage, url.searchParams);
        send(res, 200, items, { 'X-Total-Count': String(garage.length) });
        return;
      }
      if (req.method === 'GET' && id !== null) {
        const car = garage.find((item) => item.id === id);
        send(res, car ? 200 : 404, car || { error: 'Not found' });
        return;
      }
      if (req.method === 'POST' && id === null) {
        const body = await readBody(req);
        const car = {
          name: body.name || 'Unknown',
          color: body.color || '#ffffff',
          id: Number(body.id) || nextGarageId(),
        };
        garage.push(car);
        send(res, 201, car);
        return;
      }
      if (req.method === 'PUT' && id !== null) {
        const index = garage.findIndex((item) => item.id === id);
        if (index < 0) {
          send(res, 404, { error: 'Not found' });
          return;
        }
        const body = await readBody(req);
        garage[index] = {
          ...garage[index],
          name: body.name || garage[index].name,
          color: body.color || garage[index].color,
        };
        send(res, 200, garage[index]);
        return;
      }
      if (req.method === 'DELETE' && id !== null) {
        const index = garage.findIndex((item) => item.id === id);
        if (index < 0) {
          send(res, 404, { error: 'Not found' });
          return;
        }
        garage.splice(index, 1);
        send(res, 200, {});
        return;
      }
    }

    if (winnersMatch) {
      const id = winnersMatch[1] ? Number(winnersMatch[1]) : null;
      if (req.method === 'GET' && id === null) {
        const sorted = sortList(winners, url.searchParams);
        const items = paginate(sorted, url.searchParams);
        send(res, 200, items, { 'X-Total-Count': String(winners.length) });
        return;
      }
      if (req.method === 'GET' && id !== null) {
        const winner = winners.find((item) => item.id === id);
        send(res, winner ? 200 : 404, winner || { error: 'Not found' });
        return;
      }
      if (req.method === 'POST' && id === null) {
        const body = await readBody(req);
        const winner = {
          id: Number(body.id),
          wins: Number(body.wins) || 0,
          time: Number(body.time) || 0,
        };
        winners.push(winner);
        send(res, 201, winner);
        return;
      }
      if (req.method === 'PUT' && id !== null) {
        const index = winners.findIndex((item) => item.id === id);
        if (index < 0) {
          send(res, 404, { error: 'Not found' });
          return;
        }
        const body = await readBody(req);
        winners[index] = {
          ...winners[index],
          wins: Number(body.wins),
          time: Number(body.time),
        };
        send(res, 200, winners[index]);
        return;
      }
      if (req.method === 'DELETE' && id !== null) {
        const index = winners.findIndex((item) => item.id === id);
        if (index < 0) {
          send(res, 404, {});
          return;
        }
        winners.splice(index, 1);
        send(res, 200, {});
        return;
      }
    }

    if (req.method === 'GET' && serveStatic(pathname, res)) {
      return;
    }

    if (req.method === 'GET' && pathname === '/') {
      send(
        res,
        503,
        'Frontend is not built yet. Run npm run build.',
        { 'Content-Type': 'text/plain; charset=utf-8' },
      );
      return;
    }

    send(res, 404, { error: 'Not found' });
  } catch {
    send(res, 400, { error: 'Bad request' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Async Race listening on http://${HOST}:${PORT}`);
});
