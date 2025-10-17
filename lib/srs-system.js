/**
 * 🧠 SRS SYSTEM (Persistent)
 *
 * Wrapper that exposes the Prisma-backed adapter as the default SRS system.
 * This replaces the old in-memory implementation so every spaced-repetition
 * action is stored in the database and available to the personalization engine.
 */

const srsPrismaAdapter = require('./srs-prisma-adapter');

module.exports = srsPrismaAdapter;
