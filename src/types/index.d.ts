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
    static create({ type, query, maxScrolls, headless }: Options): GoogleReviewsScraper;
}
export type ScraperType = "GoogleReviews";
export type Options = {
    /**
     * - The type of scraper
     */
    type: ScraperType;
    /**
     * - The query for scraping.
     */
    query: string;
    /**
     * - Max scrolls a given container can have
     */
    maxScrolls?: number;
    headless?: boolean;
};
import { GoogleReviewsScraper } from './reviews/reviews.scraper.js';
