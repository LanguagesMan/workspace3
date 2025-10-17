const mockTrackInteraction = jest.fn().mockResolvedValue({ success: true });
const mockGetDueCards = jest.fn().mockResolvedValue({ success: true, cards: [] });
const mockGetAllCards = jest.fn().mockResolvedValue({ success: true, cards: [] });
const mockGetStats = jest.fn().mockResolvedValue({ success: true, stats: {} });

jest.mock('../lib/srs-system', () => ({
  addCard: jest.fn(),
  getDueCards: (...args) => mockGetDueCards(...args),
  getAllCards: (...args) => mockGetAllCards(...args),
  getStats: (...args) => mockGetStats(...args),
  trackInteraction: (...args) => mockTrackInteraction(...args)
}));

const mockAggregateContent = jest.fn();

jest.mock('../lib/real-content-aggregator', () => {
  return jest.fn().mockImplementation(() => ({
    aggregateContent: (...args) => mockAggregateContent(...args)
  }));
});

const mockSmartFeed = jest.fn((profile, content) => content);

jest.mock('../lib/smart-feed-system', () => ({
  SmartFeedSystem: jest.fn().mockImplementation(() => ({
    getPersonalizedFeed: (...args) => mockSmartFeed(...args)
  }))
}));

const personalizedSRSFeed = require('../lib/personalized-srs-feed');
const srsSystem = require('../lib/srs-system');

describe('PersonalizedSRSFeed persistence hooks', () => {
  const sampleContent = [
    { id: 'content_1', type: 'video', category: 'news', level: 'A2' },
    { id: 'content_2', type: 'article', category: 'culture', level: 'A2' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockAggregateContent.mockResolvedValue(sampleContent);
    if (personalizedSRSFeed.userProfiles?.clear) {
      personalizedSRSFeed.userProfiles.clear();
    }
  });

  test('records feed impressions via trackInteraction', async () => {
    await personalizedSRSFeed.getPersonalizedFeed('user_demo', { limit: 2, includeReviews: false });

    const impressionCalls = mockTrackInteraction.mock.calls.filter(
      ([, type]) => type === 'feed_shown'
    );

    expect(impressionCalls).toHaveLength(sampleContent.length);
    impressionCalls.forEach(([userId, type, contentId], index) => {
      expect(userId).toBe('user_demo');
      expect(type).toBe('feed_shown');
      expect(contentId).toBe(sampleContent[index].id);
    });
  });

  test('records engagement via trackInteraction', async () => {
    await personalizedSRSFeed.getPersonalizedFeed('user_demo', { limit: 2, includeReviews: false });
    mockTrackInteraction.mockClear();

    await personalizedSRSFeed.recordEngagement('user_demo', 'content_1', 'like');

    expect(mockTrackInteraction).toHaveBeenCalledTimes(1);
    const [userId, type, contentId] = mockTrackInteraction.mock.calls[0];
    expect(userId).toBe('user_demo');
    expect(type).toBe('feed_like');
    expect(contentId).toBe('content_1');
  });
});
