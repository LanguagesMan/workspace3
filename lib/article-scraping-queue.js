/**
 * Article Scraping Queue System
 * Manages background scraping of articles with retry logic
 */

import firecrawlScraper from './firecrawl-scraper.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client only if configured
let supabase = null;
const isSupabaseConfigured = process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY;

if (isSupabaseConfigured) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
  );
  console.log('[Queue] Supabase configured');
} else {
  console.warn('[Queue] Supabase not configured - running in test mode');
}

class ArticleScrapingQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
    this.concurrency = 5;
  }

  /**
   * Add article to scraping queue
   * @param {Object} article - Article object with url and id
   */
  async addToQueue(article) {
    // Check if already scraped
    if (article.full_content) {
      console.log(`[Queue] Article ${article.id} already has full content`);
      return;
    }

    // Check if already in queue
    if (this.queue.find(item => item.id === article.id)) {
      console.log(`[Queue] Article ${article.id} already in queue`);
      return;
    }

    this.queue.push({
      id: article.id,
      url: article.url,
      title: article.title,
      retries: 0,
      addedAt: Date.now(),
    });

    console.log(`[Queue] Added article to queue: ${article.title} (${this.queue.length} items)`);

    // Start processing if not already running
    if (!this.processing) {
      this.processQueue();
    }
  }

  /**
   * Add multiple articles to queue
   * @param {Array} articles - Array of article objects
   */
  async addBatchToQueue(articles) {
    for (const article of articles) {
      await this.addToQueue(article);
    }
  }

  /**
   * Process the queue
   */
  async processQueue() {
    if (this.processing) return;
    if (this.queue.length === 0) return;

    this.processing = true;
    console.log(`[Queue] Starting to process queue (${this.queue.length} items)`);

    while (this.queue.length > 0) {
      // Take up to 'concurrency' items from the queue
      const batch = this.queue.splice(0, this.concurrency);
      
      console.log(`[Queue] Processing batch of ${batch.length} articles`);

      // Process batch concurrently
      await Promise.all(
        batch.map(item => this.processArticle(item))
      );
    }

    this.processing = false;
    console.log('[Queue] Queue processing complete');
  }

  /**
   * Process a single article
   * @param {Object} item - Queue item
   */
  async processArticle(item) {
    try {
      console.log(`[Queue] Processing: ${item.title}`);

      // Scrape the article
      const result = await firecrawlScraper.scrapeArticle(item.url);

      if (result.success) {
        // Save to Supabase
        await this.saveToDatabase(item.id, result);
        console.log(`[Queue] Successfully scraped and saved: ${item.title}`);
      } else if (result.paywall) {
        // Mark as paywall in database
        await this.markAsPaywall(item.id);
        console.log(`[Queue] Article behind paywall: ${item.title}`);
      } else {
        // Retry if not at max retries
        await this.handleFailure(item);
      }

    } catch (error) {
      console.error(`[Queue] Error processing ${item.title}:`, error);
      await this.handleFailure(item);
    }
  }

  /**
   * Handle scraping failure with retry logic
   * @param {Object} item - Failed queue item
   */
  async handleFailure(item) {
    item.retries++;

    if (item.retries < this.maxRetries) {
      console.log(`[Queue] Retrying ${item.title} (attempt ${item.retries + 1}/${this.maxRetries})`);
      
      // Wait before retry
      await this.sleep(this.retryDelay);
      
      // Add back to queue
      this.queue.push(item);
    } else {
      console.error(`[Queue] Max retries reached for: ${item.title}`);
      
      // Mark as failed in database
      await this.markAsFailed(item.id);
    }
  }

  /**
   * Save scraped content to database
   * @param {string} articleId - Article ID
   * @param {Object} scrapedData - Scraped article data
   */
  async saveToDatabase(articleId, scrapedData) {
    if (!supabase) {
      console.log('[Queue] Supabase not configured - skipping database save');
      return;
    }

    try {
      const { error } = await supabase
        .from('articles')
        .update({
          full_content: scrapedData.fullContent,
          full_content_images: scrapedData.images,
          full_content_metadata: scrapedData.metadata,
          word_count: scrapedData.wordCount,
          scraped_at: scrapedData.scrapedAt,
          scrape_status: 'success',
        })
        .eq('id', articleId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('[Queue] Database save error:', error);
      throw error;
    }
  }

  /**
   * Mark article as behind paywall
   * @param {string} articleId - Article ID
   */
  async markAsPaywall(articleId) {
    if (!supabase) {
      console.log('[Queue] Supabase not configured - skipping paywall mark');
      return;
    }

    try {
      await supabase
        .from('articles')
        .update({
          scrape_status: 'paywall',
          scraped_at: new Date().toISOString(),
        })
        .eq('id', articleId);
    } catch (error) {
      console.error('[Queue] Error marking paywall:', error);
    }
  }

  /**
   * Mark article scraping as failed
   * @param {string} articleId - Article ID
   */
  async markAsFailed(articleId) {
    if (!supabase) {
      console.log('[Queue] Supabase not configured - skipping failed mark');
      return;
    }

    try {
      await supabase
        .from('articles')
        .update({
          scrape_status: 'failed',
          scraped_at: new Date().toISOString(),
        })
        .eq('id', articleId);
    } catch (error) {
      console.error('[Queue] Error marking failed:', error);
    }
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      items: this.queue.map(item => ({
        title: item.title,
        retries: item.retries,
        inQueueFor: Date.now() - item.addedAt,
      })),
    };
  }

  /**
   * Sleep utility
   * @param {number} ms - Milliseconds to sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
const queueInstance = new ArticleScrapingQueue();

export default queueInstance;

export { ArticleScrapingQueue };

