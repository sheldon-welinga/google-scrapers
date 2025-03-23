import { GoogleReviewsScraper } from './reviews/reviews.scraper.js';

/**
 * @typedef {'GoogleReviews'} ScraperType
 */

/**
 * @typedef Options
 * @property {ScraperType} type - The type of scraper
 * @property {string} query - The query for scraping.
 * @property {number} [maxScrolls=undefined] - Max scrolls a given container can have
 * @property {boolean} [headless=undefined]
 */

/**
 * Scraper Factory
 * A simple factory to instantiate different types of scrapers.
 */
export class ScraperFactory {
  /** @param {Options} options */
  static create({ type, query, maxScrolls, headless }) {
    switch (type) {
      case 'GoogleReviews':
        return new GoogleReviewsScraper(query, { maxScrolls, headless });
      default:
        throw new Error(`Scraper type "${type}" is not supported.`);
    }
  }
}
