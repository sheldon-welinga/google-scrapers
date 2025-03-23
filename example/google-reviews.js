import { ScraperFactory } from '../src/index.js';

const scraper = ScraperFactory.create({
  type: 'GoogleReviews',
  query: 'Inframe Studio Kenya',
  maxScrolls: 2, // Google reviews maxScrolls is 100 if not provided preventing abuse of scraper
  // headless: false,
});

scraper.init().then(() => {
  console.log(scraper.reviews);
});
