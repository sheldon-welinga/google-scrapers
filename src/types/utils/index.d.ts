/**
 * @param {number} ms - Milliseconds
 */
export function sleep(ms: number): Promise<any>;
/**
 * @param {HTMLDivElement} container
 * @param {Object} args
 *  @param {number} args.maxScrolls
 * @returns {Promise<void>}
 */
export function scrollContainer(
  container: HTMLDivElement,
  {
    maxScrolls,
  }: {
    maxScrolls: number;
  },
): Promise<void>;
