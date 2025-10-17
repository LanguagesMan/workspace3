/**
 * 🔐 Bcrypt Fallback
 *
 * Provides a minimal async-compatible interface for environments where
 * `bcryptjs` is not available (e.g. offline CI runs). Uses Node's `crypto`
 * module with PBKDF2 under the hood. Not a drop-in replacement for production,
 * but sufficient for local testing and Playwright smoke flows.
 */

const crypto = require('crypto');

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

function deriveIterations(rounds = 12) {
    const base = 10000;
    const extra = Math.max(0, rounds - 10) * 1000;
    return base + extra;
}

function hash(password, rounds = 12) {
    return new Promise((resolve, reject) => {
        try {
            const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
            const iterations = deriveIterations(rounds);
            crypto.pbkdf2(password, salt, iterations, KEY_LENGTH, 'sha512', (err, derivedKey) => {
                if (err) {
                    return reject(err);
                }
                resolve(`pbkdf2$${iterations}$${salt}$${derivedKey.toString('hex')}`);
            });
        } catch (error) {
            reject(error);
        }
    });
}

function compare(password, storedHash) {
    return new Promise((resolve, reject) => {
        try {
            const parts = storedHash.split('$');
            if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
                return resolve(false);
            }

            const iterations = parseInt(parts[1], 10);
            const salt = parts[2];
            const expected = parts[3];

            crypto.pbkdf2(password, salt, iterations, KEY_LENGTH, 'sha512', (err, derivedKey) => {
                if (err) {
                    return reject(err);
                }

                const candidate = derivedKey.toString('hex');
                const matches = crypto.timingSafeEqual(
                    Buffer.from(candidate, 'hex'),
                    Buffer.from(expected, 'hex')
                );
                resolve(matches);
            });
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { hash, compare };
