/**
 * @typedef Review
 * @property {string|null} avatar
 * @property {string}  name
 * @property {string|null}   rating
 * @property {string}   review
 */
/**
 * @typedef Options
 * @property {number} [maxScrolls=undefined]
 * @property {boolean} [headless=undefined]
 */
/**
 * Google Reviews Scraper
 */
export class GoogleReviewsScraper extends BaseScraper {
    /**
     * @param {string} query - The search query for reviews.
     * @param {Options} [options=undefined]
     */
    constructor(query: string, options?: Options);
    get reviews(): Review[];
    #private;
}
export type Review = {
    avatar: string | null;
    name: string;
    rating: string | null;
    review: string;
};
export type Options = {
    maxScrolls?: number;
    headless?: boolean;
};
import { BaseScraper } from '../shared/base.scraper.js';
