/**
 * CSRF helpers.
 *
 * The backend issues a JS-readable `XSRF-TOKEN` cookie and expects that value echoed back on every
 * state-changing request. Without it Spring Security rejects the call inside its filter chain, so
 * the response is a bare 403 that never reaches a controller — which is why it arrives without the
 * usual `ApiResponseEntity` error envelope.
 *
 * Safe methods (GET/HEAD/OPTIONS/TRACE) are exempt and must not carry the header, otherwise every
 * read would trigger a CORS preflight for nothing.
 */

/** Cookie the backend writes the token into. */
export const CSRF_COOKIE = 'XSRF-TOKEN';

/** Header the token is sent back in. */
export const CSRF_HEADER = 'XSRF-TOKEN';

/** Methods Spring applies CSRF protection to. */
const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete']);

/**
 * Reads the current CSRF token from `document.cookie`.
 *
 * @returns the decoded token, or `null` if the cookie has not been issued yet
 */
export function getCsrfToken(): string | null {
    if (typeof document === 'undefined') return null;

    for (const part of document.cookie.split(';')) {
        const separator = part.indexOf('=');
        if (separator < 0) continue;

        const name = part.slice(0, separator).trim();
        if (name !== CSRF_COOKIE) continue;

        // Cookie values may themselves contain '=', so keep everything after the first one.
        const value = part.slice(separator + 1).trim();
        return value ? decodeURIComponent(value) : null;
    }
    return null;
}

/** True when a request with this method needs the CSRF header attached. */
export function needsCsrfToken(method?: string): boolean {
    return MUTATING_METHODS.has((method ?? 'get').toLowerCase());
}
