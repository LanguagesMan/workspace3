jest.mock('@prisma/client', () => {
  const { randomUUID } = require('crypto');

  const store = {
    words: new Map(),
    reviewSessions: [],
    users: new Map(),
    interactions: [],
    reset() {
      this.words.clear();
      this.reviewSessions.length = 0;
      this.users.clear();
      this.interactions.length = 0;
    }
  };

  global.__PRISMA_MOCK_STORE__ = store;

  const generateId = () => (randomUUID ? randomUUID() : `id_${Math.random().toString(16).slice(2)}`);

  class PrismaClient {
    constructor() {
      this.word = {
        async findUnique({ where }) {
          if (where?.id) {
            return store.words.get(where.id) || null;
          }
          const composite = where?.userId_word;
          if (!composite) return null;
          const { userId, word } = composite;
          for (const record of store.words.values()) {
            if (record.userId === userId && record.word === word.toLowerCase()) {
              return { ...record };
            }
          }
          return null;
        },
        async create({ data }) {
          const id = data.id || generateId();
          const record = { ...data, id };
          store.words.set(id, record);
          return { ...record };
        },
        async update({ where, data }) {
          const existing = store.words.get(where.id);
          if (!existing) throw new Error('Word not found');
          const updated = { ...existing, ...data };
          store.words.set(where.id, updated);
          return { ...updated };
        },
        async findMany({ where = {}, orderBy = [], take }) {
          let results = Array.from(store.words.values());
          if (where.userId) {
            results = results.filter(record => record.userId === where.userId);
          }
          if (where.saved !== undefined) {
            results = results.filter(record => record.saved === where.saved);
          }
          if (Array.isArray(where.OR) && where.OR.length > 0) {
            results = results.filter(record => {
              return where.OR.some(condition => {
                if (condition.nextReview?.lte) {
                  const nextReview = record.nextReview ? new Date(record.nextReview) : null;
                  return nextReview && nextReview <= condition.nextReview.lte;
                }
                if (condition.nextReview === null) {
                  return record.nextReview === null;
                }
                return false;
              });
            });
          }
          if (orderBy.length > 0) {
            const [{ nextReview }] = orderBy;
            if (nextReview) {
              const direction = nextReview === 'asc' ? 1 : -1;
              results = results.sort((a, b) => {
                const aTime = a.nextReview ? new Date(a.nextReview).getTime() : 0;
                const bTime = b.nextReview ? new Date(b.nextReview).getTime() : 0;
                return (aTime - bTime) * direction;
              });
            }
          }
          if (typeof take === 'number') {
            results = results.slice(0, take);
          }
          return results.map(record => ({ ...record }));
        },
        async count({ where = {} }) {
          let results = Array.from(store.words.values());
          if (where.userId) {
            results = results.filter(record => record.userId === where.userId);
          }
          if (where.saved !== undefined) {
            results = results.filter(record => record.saved === where.saved);
          }
          return results.length;
        },
        async delete({ where }) {
          return store.words.delete(where.id);
        }
      };

      this.reviewSession = {
        async create({ data }) {
          const record = { ...data, id: generateId() };
          store.reviewSessions.push(record);
          return { ...record };
        },
        async findMany({ where = {} }) {
          let results = store.reviewSessions;
          if (where.userId) {
            results = results.filter(session => session.userId === where.userId);
          }
          return results.map(record => ({ ...record }));
        }
      };

      this.user = {
        async findUnique({ where }) {
          return store.users.get(where.id) || null;
        },
        async update({ where, data }) {
          const existing = store.users.get(where.id) || { id: where.id };
          const updated = { ...existing, ...data };
          store.users.set(where.id, updated);
          return { ...updated };
        }
      };

      this.userInteraction = {
        async create({ data }) {
          const record = { ...data, id: generateId() };
          store.interactions.push(record);
          return { ...record };
        },
        async findMany({ where = {} }) {
          let results = store.interactions;
          if (where.userId) {
            results = results.filter(interaction => interaction.userId === where.userId);
          }
          if (where.createdAt?.gte) {
            const minTime = where.createdAt.gte.getTime();
            results = results.filter(interaction => new Date(interaction.createdAt).getTime() >= minTime);
          }
          if (where.type?.in) {
            results = results.filter(interaction => where.type.in.includes(interaction.type));
          }
          return results.map(record => ({ ...record }));
        }
      };
    }
  }

  return { PrismaClient };
});

const srsSystem = require('../lib/srs-system');

describe('SRS Prisma adapter integration (mocked)', () => {
  const store = global.__PRISMA_MOCK_STORE__;

  beforeEach(() => {
    store.reset();
    store.users.set('learner_1', { id: 'learner_1', currentLevel: 'A2', streak: 3 });
  });

  test('adds a card and retrieves it for review', async () => {
    const addResult = await srsSystem.addCard('Hola', 'Hello', 'Hola, ¿cómo estás?', 'learner_1', 'A2', 'video', 'vid_123');
    expect(addResult.success).toBe(true);

    const dueResult = await srsSystem.getDueCards('learner_1', 10);
    expect(dueResult.success).toBe(true);
    expect(dueResult.cards).toHaveLength(1);
    expect(dueResult.cards[0].word).toBe('hola');
  });

  test('reviews a card and updates spaced repetition fields', async () => {
    const { word: created } = await srsSystem.addCard('aprender', 'to learn', '', 'learner_1', 'B1');
    const reviewResult = await srsSystem.reviewCard(created.id, 5);

    expect(reviewResult.success).toBe(true);
    expect(reviewResult.interval).toBeGreaterThanOrEqual(1);
    expect(Number(reviewResult.easiness)).toBeGreaterThan(0);
  });

  test('exposes stats aggregated from stored reviews', async () => {
    const { word: created } = await srsSystem.addCard('leer', 'to read', '', 'learner_1');
    await srsSystem.reviewCard(created.id, 5);
    await srsSystem.reviewCard(created.id, 4);

    const stats = await srsSystem.getStats('learner_1');
    expect(stats.success).toBe(true);
    expect(stats.stats.totalCards).toBe(1);
    expect(stats.stats.totalReviews).toBe(2);
    expect(stats.stats.accuracy).toBeGreaterThan(0);
  });
});
