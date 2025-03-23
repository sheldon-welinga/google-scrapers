import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';
import { sleep } from '../utils/index.js';

puppeteer.use(StealthPlugin());
puppeteer.use(RecaptchaPlugin());

/**
 * @typedef  Options
 * @property {boolean} [headless=undefined]
 */

/**
 * Base Scraper Class
 * Implements common functionalities for all scrapers.
 */
export class BaseScraper {
  /** @type {string} */
  #baseUrl = 'https://google.com?hl=en';
  #retries;
  /** @type {import('puppeteer').Browser|null} */
  #browser;
  /** @type {import('puppeteer').Page|null} */
  #page;
  #defaultUserAgent;
  /** @type {string} */
  #query;
  /** @type {Options}  */
  #options;

  /**
   * @param {string} query
   * @param {Options} [options=undefined]
   *
   */
  constructor(query, options = {}) {
    this.#query = query;
    this.#retries = 0;
    this.#browser = null;
    this.#page = null;
    this.#options = options ?? {};
    this.#defaultUserAgent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }

  /**
   * Initialize the scraping process.
   */
  async init() {
    await this.#launchBrowser();
    await this.#setupPage();

    const isRecaptcha = this.#isRecaptchaPage();
    if (isRecaptcha) {
      await this.#attemptSolveRecaptcha();
    } else {
      await this.scrape(); // Abstract method to be implemented in subclasses
    }

    await this.#closeBrowser();
  }

  /**
   * Launches the Puppeteer browser.
   */
  async #launchBrowser() {
    this.#browser = await puppeteer.launch({
      headless: this.#options.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  /**
   * Sets up the page with user-agent and anti-detection measures.
   */
  async #setupPage() {
    const [page] = await this.#browser.pages();
    this.#page = page;

    await this.#page.setUserAgent(this.#defaultUserAgent);
    await this.#page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

    await sleep(1_000);
    await this.#page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    await sleep(2_000);
    await this.#page.goto(this.#baseUrl, {
      waitUntil: 'domcontentloaded',
    });
  }

  #isRecaptchaPage() {
    // Detect CAPTCHA page
    const url = this.#page.url();
    return url.includes('sorry/index');
  }

  async #attemptSolveRecaptcha() {
    console.error('⚠️ Google blocked the bot with CAPTCHA!');
    await this.#page.waitForSelector('iframe[src*="recaptcha/"]');
    await this.#page.solveRecaptchas();

    if (this.#retries <= 2) {
      await this.#page.waitForSelector('iframe[src*="recaptcha/"]');
      await this.#page.solveRecaptchas();
      this.#retries += 1;

      return this.scrape(); // Abstract method to be implemented in subclasses
    }

    await sleep(10_000);
    return await this.#closeBrowser();
  }

  async #moveMouse() {
    // Move mouse around randomly before interacting
    for (let i = 0; i < 3; i++) {
      const x = Math.floor(Math.random() * 1366);
      const y = Math.floor(Math.random() * 768);
      await this.#page.mouse.move(x, y, { steps: 10 }); // Smooth movement
      await sleep(500); // Pause for half a second
    }
  }

  /**
   * @param {import('puppeteer').ElementHandle<HTMLTextAreaElement>} searchBox
   */
  async #moveToSearchBox(searchBox) {
    const searchBoxBounding = await searchBox.boundingBox();
    if (searchBoxBounding) {
      await this.#page.mouse.move(
        searchBoxBounding.x + searchBoxBounding.width / 2,
        searchBoxBounding.y + searchBoxBounding.height / 2,
        { steps: 20 }, // Smooth movement to search bar
      );
      await sleep(500); // Small pause
      await this.#page.mouse.click(
        searchBoxBounding.x + searchBoxBounding.width / 2,
        searchBoxBounding.y + searchBoxBounding.height / 2,
      );
    }
  }

  /**
   * Closes the browser.
   */
  async #closeBrowser() {
    return this.#browser?.close();
  }

  async searchPage() {
    await this.#moveMouse();

    const searchBox = await this.page.$("textarea[name='q']");
    if (!searchBox) throw new Error('Search box not found');

    await this.#moveToSearchBox(searchBox);

    for (const char of this.#query) {
      await this.page.keyboard.type(char, { delay: Math.random() * 200 });
    }
    await sleep(1000);
    await this.page.keyboard.press('Enter');
    await this.page.waitForNavigation({ waitUntil: 'domcontentloaded' });
  }

  /**
   * Must be implemented by child classes.
   */
  async scrape() {
    throw new Error('scrape() method must be implemented in subclasses');
  }

  /**
   * Provides access to the page instance for child classes.
   */
  get page() {
    return this.#page;
  }
}
