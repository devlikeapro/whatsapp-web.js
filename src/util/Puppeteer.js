/**
 * Expose a function to the page, replacing an existing binding with the same name.
 *
 * Serialized per page: puppeteer's exposeFunction throws if the binding already exists,
 * so concurrent calls (e.g. AUTHENTICATED and READY listeners racing) must queue, not interleave.
 *
 * @param {object} page - Puppeteer Page instance
 * @param {string} name
 * @param {Function} fn
 */
const pageLocks = new WeakMap();

async function exposeFunctionIfAbsent(page, name, fn) {
    const previous = pageLocks.get(page) || Promise.resolve();
    const current = previous.then(() => upsertFunction(page, name, fn));
    // Keep the chain usable even when this upsert fails
    pageLocks.set(
        page,
        current.catch(() => {}),
    );
    return await current;
}

async function upsertFunction(page, name, fn) {
    try {
        await page.removeExposedFunction(name);
    } catch (ignoredError) {
        // Not exposed yet - nothing to remove
    }
    await page.exposeFunction(name, log(fn));
}

function log(fn, msg = 'Error') {
    return function (...args) {
        try {
            const result = fn(...args);

            // async function (or returned Promise)
            if (result && typeof result.then === 'function') {
                return result.catch((err) => {
                    console.error(`[W] ${msg}`, err);
                    throw err;
                });
            }

            return result;
        } catch (err) {
            console.error(`[W] ${msg}`, err);
            throw err;
        }
    };
}

module.exports = { exposeFunctionIfAbsent };
