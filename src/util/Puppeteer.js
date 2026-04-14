/**
 * Expose a function to the page if it does not exist
 *
 * NOTE:
 * Rewrite it to 'upsertFunction' after updating Puppeteer to 20.6 or higher
 * using page.removeExposedFunction
 * https://pptr.dev/api/puppeteer.page.removeexposedfunction
 *
 * @param {object} page - Puppeteer Page instance
 * @param {string} name
 * @param {Function} fn
 */
async function exposeFunctionIfAbsent(page, name, fn) {
    try {
        await page.exposeFunction(name, log(fn));
    } catch (err) {
        if (err?.message?.includes('already exists')) {
            console.warn(`[W] exposeFunctionIfAbsent: '${name}' is already exposed, skipping`, err.toString());
            return;
        }
        throw err;
    }
}

function log(fn, msg = 'Error') {
    return function (...args) {
        try {
            const result = fn(...args);

            // async function (or returned Promise)
            if (result && typeof result.then === 'function') {
                return result.catch(err => {
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


module.exports = {exposeFunctionIfAbsent};
