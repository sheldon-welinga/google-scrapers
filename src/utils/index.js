/**
 * @param {number} ms - Milliseconds
 */
export async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * @param {HTMLDivElement} container
 * @param {Object} args
 *  @param {number} args.maxScrolls
 * @returns {Promise<void>}
 */
export async function scrollContainer(container, { maxScrolls = 100 }) {
  return new Promise(resolve => {
    let isAtBottom = 0;
    let scrollCount = maxScrolls;

    const interval = setInterval(() => {
      container.scrollBy(0, 1000);
      scrollCount -= 1;

      if (scrollCount <= 0) {
        clearInterval(interval);
        resolve();
      }

      if (container.scrollHeight - container.scrollTop <= container.clientHeight) {
        if (isAtBottom > 1) {
          clearInterval(interval);
          resolve();
        }
        isAtBottom += 1;
      } else {
        isAtBottom = 0;
      }
    }, 2500);
  });
}
