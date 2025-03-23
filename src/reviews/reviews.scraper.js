import { GOOGLE_REVIEWS_MAX_SCROLL } from '../constants/index.js';
import { BaseScraper } from '../shared/base.scraper.js';
import { scrollContainer, sleep } from '../utils/index.js';

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
  /** @type {Array<Review>} */
  #reviews;
  #reviewSelectors;
  /** @type {number} */
  // Sometimes other reviews are so many so we don't want to keep scrolling, we will limit our scrolls to avoid abuse
  #maxScrolls;

  /**
   * @param {string} query - The search query for reviews.
   * @param {Options} [options=undefined]
   */
  constructor(query, options = {}) {
    // Scraping in headless mode sometimes produces hallucinated data.
    // Running in non-headless mode improves accuracy.
    // Unless explicitly set to true, we default to false to minimize hallucinations.
    super(query, { headless: options.headless ?? false });
    this.#maxScrolls = options.maxScrolls ?? GOOGLE_REVIEWS_MAX_SCROLL;
    this.#reviews = [];
    this.#reviewSelectors = {
      dialogSelector: "a[data-async-trigger='reviewDialog']",
      containerSelector: 'div.RVCQse, div.review-dialog-list',
      elementsSelector:
        "div[jsname='GmP9w'] >div, div[jscontroller='fIQYlf']>div, div.gws-localreviews__general-reviews-block >div",
    };
  }

  async scrape() {
    await this.searchPage();
    await this.#scrapeReviews();
  }

  async #scrapeReviews() {
    const { containerSelector, dialogSelector } = this.#reviewSelectors;

    const reviewsDialog = await this.page.$(dialogSelector);
    if (!reviewsDialog) {
      console.warn('No reviews dialog found');
      return;
    }

    await this.page.click(dialogSelector);
    await this.page.waitForSelector(containerSelector);
    await sleep(5000);

    const container = await this.page.$(containerSelector);
    if (!container) throw new Error('Reviews container not found');

    let maxScrolls = this.#maxScrolls;
    await container.evaluate(scrollContainer, { maxScrolls });
    await sleep(2000);

    const reviews = await this.#extractReviews();
    this.#reviews = reviews;
  }

  async #extractReviews() {
    return await this.page.evaluate(() => {
      /**
       * Custom map function optimized for performance.
       *
       * @template T, U
       * @param {T extends Node ? NodeListOf<T>:Array<T>} array - The array to map over.
       * @param {(item: T, index: number) => U} functor - The function to apply to each element.
       * @returns {U[]}
       */
      function map(array, functor) {
        const length = array.length; // Cache array length
        const result = new Array(length); // Preallocate result array

        for (let i = 0; i < length; i++) {
          result[i] = functor(array[i], i); // Apply function and assign directly
        }

        return result;
      }

      /**
       * @param {HTMLElement} reviewElement
       * @returns {Review}
       */
      function extractReview(reviewElement) {
        /** @type {HTMLDivElement|null}*/
        const avatarElement = reviewElement.querySelector("div[role='img']");
        /** @type {HTMLDivElement|HTMLSpanElement|null} */
        const ratingElement = reviewElement.querySelector('span.lTi8oc.z3HNkc, div.dHX2k');
        /** @type {HTMLDivElement|HTMLSpanElement|null} */
        const reviewTextElement = reviewElement.querySelector('span.review-snippet, div.OA1nbd');

        /** @type {Review} */
        const review = {
          avatar: avatarElement ? avatarElement.style.backgroundImage.slice(4, -1).replace(/&quot;\"/g, '') : null,
          name: avatarElement?.ariaLabel ?? 'Anonymous',
          rating: ratingElement ? ratingElement.getAttribute('aria-label').match(/\b\d+(\.\d+)?\b/)[0] : null,
          review: reviewTextElement ? reviewTextElement.innerText.trim() : '',
        };

        return review;
      }

      const elementsSelector = [
        "div[jsname='GmP9w'] >div",
        "div[jscontroller='fIQYlf']>div",
        'div.gws-localreviews__general-reviews-block >div',
      ].join(', ');

      /** @type {Array<Review>}  */
      const reviews = map(document.querySelectorAll(elementsSelector), extractReview);

      return reviews;
    });
  }

  get reviews() {
    return this.#reviews;
  }
}
