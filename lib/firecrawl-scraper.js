/**
 * Firecrawl Deep Article Scraper
 * Scrapes full article content, images, and metadata from URLs
 * Handles paywalls gracefully and implements rate limiting
 */

import FirecrawlApp from '@mendable/firecrawl-js';
import dotenv from 'dotenv';

dotenv.config();

class FirecrawlScraper {
  constructor() {
    this.firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });
    this.requestQueue = [];
    this.processing = false;
    this.maxConcurrent = 5;
    this.rateLimit = 10; // requests per minute
    this.requestCount = 0;
    this.lastReset = Date.now();
  }

  /**
   * Scrape a single article with full content extraction
   * @param {string} url - Article URL to scrape
   * @returns {Promise<Object>} Scraped article data
   */
  async scrapeArticle(url) {
    try {
      // Check rate limiting
      await this.checkRateLimit();

      console.log(`[Firecrawl] Scraping article: ${url}`);

      // Use Firecrawl's scrape endpoint with options for clean content
      const result = await this.firecrawl.scrapeUrl(url, {
        formats: ['markdown', 'html'],
        onlyMainContent: true,
        includeTags: ['article', 'main', 'img'],
        excludeTags: ['nav', 'footer', 'aside', 'script', 'style'],
        waitFor: 2000, // Wait 2s for dynamic content
      });

      if (!result.success) {
        throw new Error('Firecrawl scraping failed');
      }

      // Extract clean content
      const scrapedData = this.extractArticleData(result);

      console.log(`[Firecrawl] Successfully scraped: ${url}`);
      return scrapedData;

    } catch (error) {
      console.error(`[Firecrawl] Error scraping ${url}:`, error.message);
      
      // Handle paywalls gracefully
      if (this.isPaywallError(error)) {
        return {
          success: false,
          paywall: true,
          error: 'Article behind paywall',
          url
        };
      }

      return {
        success: false,
        error: error.message,
        url
      };
    }
  }

  /**
   * Extract and clean article data from Firecrawl result
   * @param {Object} result - Firecrawl scrape result
   * @returns {Object} Clean article data
   */
  extractArticleData(result) {
    const data = result.data || result;
    
    // Extract clean text content
    const fullContent = this.cleanContent(data.markdown || data.content || '');
    
    // Extract images with alt text
    const images = this.extractImages(data.html || '');
    
    // Extract metadata
    const metadata = {
      title: data.title || data.metadata?.title || '',
      author: data.author || data.metadata?.author || '',
      publishDate: data.publishDate || data.metadata?.publishedTime || '',
      description: data.description || data.metadata?.description || '',
      ogImage: data.metadata?.ogImage || '',
      siteName: data.metadata?.ogSiteName || '',
    };

    return {
      success: true,
      url: data.url,
      fullContent,
      images,
      metadata,
      wordCount: this.countWords(fullContent),
      scrapedAt: new Date().toISOString(),
    };
  }

  /**
   * Clean and normalize article content
   * @param {string} content - Raw content
   * @returns {string} Cleaned content
   */
  cleanContent(content) {
    return content
      .replace(/\[.*?\]\(.*?\)/g, '') // Remove markdown links but keep text
      .replace(/#+\s/g, '') // Remove markdown headers
      .replace(/\*\*|__/g, '') // Remove bold markdown
      .replace(/\*|_/g, '') // Remove italic markdown
      .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
      .trim();
  }

  /**
   * Extract images from HTML content
   * @param {string} html - HTML content
   * @returns {Array} Array of image objects
   */
  extractImages(html) {
    const images = [];
    const imgRegex = /<img[^>]+src="([^">]+)"[^>]*alt="([^"]*)"[^>]*>/g;
    let match;

    while ((match = imgRegex.exec(html)) !== null) {
      images.push({
        url: match[1],
        alt: match[2] || '',
      });
    }

    return images;
  }

  /**
   * Count words in text
   * @param {string} text - Text to count
   * @returns {number} Word count
   */
  countWords(text) {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Check if error indicates a paywall
   * @param {Error} error - Error object
   * @returns {boolean} True if paywall detected
   */
  isPaywallError(error) {
    const paywallIndicators = [
      'paywall',
      'subscription required',
      'subscribe to read',
      'premium content',
      'member-only',
    ];

    const message = error.message.toLowerCase();
    return paywallIndicators.some(indicator => message.includes(indicator));
  }

  /**
   * Rate limiting check (10 requests per minute)
   */
  async checkRateLimit() {
    const now = Date.now();
    const elapsed = now - this.lastReset;

    // Reset counter every minute
    if (elapsed >= 60000) {
      this.requestCount = 0;
      this.lastReset = now;
    }

    // Wait if we've hit the limit
    if (this.requestCount >= this.rateLimit) {
      const waitTime = 60000 - elapsed;
      console.log(`[Firecrawl] Rate limit reached. Waiting ${waitTime}ms`);
      await this.sleep(waitTime);
      this.requestCount = 0;
      this.lastReset = Date.now();
    }

    this.requestCount++;
  }

  /**
   * Sleep utility
   * @param {number} ms - Milliseconds to sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Scrape multiple articles in batch (respects rate limiting)
   * @param {Array<string>} urls - Array of URLs to scrape
   * @returns {Promise<Array>} Array of scraped results
   */
  async scrapeBatch(urls) {
    const results = [];
    const batches = [];

    // Split into batches of maxConcurrent
    for (let i = 0; i < urls.length; i += this.maxConcurrent) {
      batches.push(urls.slice(i, i + this.maxConcurrent));
    }

    // Process each batch sequentially
    for (const batch of batches) {
      console.log(`[Firecrawl] Processing batch of ${batch.length} articles`);
      const batchResults = await Promise.all(
        batch.map(url => this.scrapeArticle(url))
      );
      results.push(...batchResults);
    }

    return results;
  }
}

// Export singleton instance
const scraperInstance = new FirecrawlScraper();

export default scraperInstance;

export { FirecrawlScraper };

