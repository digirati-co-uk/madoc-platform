// Small auth server for validating tokens.
import { createServer, RequestListener, ServerResponse } from 'http';
import { verifySignedToken } from './utility/verify-signed-token';

const host = '0.0.0.0';
const port = 3001;

function errorResponse(res: ServerResponse) {
  res.writeHead(403, {
    'Content-Type': 'application/json',
  });
  res.write('{"error": "invalid token"}');
  res.end();
}

const requestListener: RequestListener = (req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(404);
    res.end();
    return;
  }

  const header = req.headers.authorization;
  if (!header) {
    return errorResponse(res);
  }

  const parts = (header || '').split(' ');

  if (parts.length !== 2) {
    return errorResponse(res);
  }

  const scheme = parts[0];
  const token = parts[1];

  if (!/^Bearer$/i.test(scheme)) {
    return errorResponse(res);
  }

  const verified = verifySignedToken(token);

  if (!verified) {
    return errorResponse(res);
  }

  res.writeHead(200);
  res.end();
};

const server = createServer(requestListener);

server.listen(port, host, () => {
  console.log(`Auth server is running on http://${host}:${port}`);
});
