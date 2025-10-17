/**
 * Shared server bootstrapper for local development and tests.
 * Uses the startServer helper exported from server.js.
 */

const { startServer } = require('../server');

const port = parseInt(process.env.PORT, 10) || 3001;
const host = process.env.HOST;

if (host) {
  startServer(port, host);
} else {
  startServer(port);
}
