/**
 * @typedef  Options
 * @property {boolean} [headless=undefined]
 */
/**
 * Base Scraper Class
 * Implements common functionalities for all scrapers.
 */
export class BaseScraper {
  /**
   * @param {string} query
   * @param {Options} [options=undefined]
   *
   */
  constructor(query: string, options?: Options);
  /**
   * Initialize the scraping process.
   */
  init(): Promise<void>;
  searchPage(): Promise<void>;
  /**
   * Must be implemented by child classes.
   */
  scrape(): Promise<void>;
  /**
   * Provides access to the page instance for child classes.
   */
  get page(): import('puppeteer').Page;
  #private;
}
export type Options = {
  headless?: boolean;
};
