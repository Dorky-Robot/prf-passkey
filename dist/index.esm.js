const defaultErrorConfig = {
    withStackTrace: false,
};
// Custom error object
// Context / discussion: https://github.com/supermacro/neverthrow/pull/215
const createNeverThrowError = (message, result, config = defaultErrorConfig) => {
    const data = result.isOk()
        ? { type: 'Ok', value: result.value }
        : { type: 'Err', value: result.error };
    const maybeStack = config.withStackTrace ? new Error().stack : undefined;
    return {
        data,
        message,
        stack: maybeStack,
    };
};

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, [])).next());
    });
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

class ResultAsync {
    constructor(res) {
        this._promise = res;
    }
    static fromSafePromise(promise) {
        const newPromise = promise.then((value) => new Ok(value));
        return new ResultAsync(newPromise);
    }
    static fromPromise(promise, errorFn) {
        const newPromise = promise
            .then((value) => new Ok(value))
            .catch((e) => new Err(errorFn(e)));
        return new ResultAsync(newPromise);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromThrowable(fn, errorFn) {
        return (...args) => {
            return new ResultAsync((() => __awaiter(this, void 0, void 0, function* () {
                try {
                    return new Ok(yield fn(...args));
                }
                catch (error) {
                    return new Err(errorFn ? errorFn(error) : error);
                }
            }))());
        };
    }
    static combine(asyncResultList) {
        return combineResultAsyncList(asyncResultList);
    }
    static combineWithAllErrors(asyncResultList) {
        return combineResultAsyncListWithAllErrors(asyncResultList);
    }
    map(f) {
        return new ResultAsync(this._promise.then((res) => __awaiter(this, void 0, void 0, function* () {
            if (res.isErr()) {
                return new Err(res.error);
            }
            return new Ok(yield f(res.value));
        })));
    }
    andThrough(f) {
        return new ResultAsync(this._promise.then((res) => __awaiter(this, void 0, void 0, function* () {
            if (res.isErr()) {
                return new Err(res.error);
            }
            const newRes = yield f(res.value);
            if (newRes.isErr()) {
                return new Err(newRes.error);
            }
            return new Ok(res.value);
        })));
    }
    andTee(f) {
        return new ResultAsync(this._promise.then((res) => __awaiter(this, void 0, void 0, function* () {
            if (res.isErr()) {
                return new Err(res.error);
            }
            try {
                yield f(res.value);
            }
            catch (e) {
                // Tee does not care about the error
            }
            return new Ok(res.value);
        })));
    }
    orTee(f) {
        return new ResultAsync(this._promise.then((res) => __awaiter(this, void 0, void 0, function* () {
            if (res.isOk()) {
                return new Ok(res.value);
            }
            try {
                yield f(res.error);
            }
            catch (e) {
                // Tee does not care about the error
            }
            return new Err(res.error);
        })));
    }
    mapErr(f) {
        return new ResultAsync(this._promise.then((res) => __awaiter(this, void 0, void 0, function* () {
            if (res.isOk()) {
                return new Ok(res.value);
            }
            return new Err(yield f(res.error));
        })));
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    andThen(f) {
        return new ResultAsync(this._promise.then((res) => {
            if (res.isErr()) {
                return new Err(res.error);
            }
            const newValue = f(res.value);
            return newValue instanceof ResultAsync ? newValue._promise : newValue;
        }));
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    orElse(f) {
        return new ResultAsync(this._promise.then((res) => __awaiter(this, void 0, void 0, function* () {
            if (res.isErr()) {
                return f(res.error);
            }
            return new Ok(res.value);
        })));
    }
    match(ok, _err) {
        return this._promise.then((res) => res.match(ok, _err));
    }
    unwrapOr(t) {
        return this._promise.then((res) => res.unwrapOr(t));
    }
    /**
     * @deprecated will be removed in 9.0.0.
     *
     * You can use `safeTry` without this method.
     * @example
     * ```typescript
     * safeTry(async function* () {
     *   const okValue = yield* yourResult
     * })
     * ```
     * Emulates Rust's `?` operator in `safeTry`'s body. See also `safeTry`.
     */
    safeUnwrap() {
        return __asyncGenerator(this, arguments, function* safeUnwrap_1() {
            return yield __await(yield __await(yield* __asyncDelegator(__asyncValues(yield __await(this._promise.then((res) => res.safeUnwrap()))))));
        });
    }
    // Makes ResultAsync implement PromiseLike<Result>
    then(successCallback, failureCallback) {
        return this._promise.then(successCallback, failureCallback);
    }
    [Symbol.asyncIterator]() {
        return __asyncGenerator(this, arguments, function* _a() {
            const result = yield __await(this._promise);
            if (result.isErr()) {
                // @ts-expect-error -- This is structurally equivalent and safe
                yield yield __await(errAsync(result.error));
            }
            // @ts-expect-error -- This is structurally equivalent and safe
            return yield __await(result.value);
        });
    }
}
function errAsync(err) {
    return new ResultAsync(Promise.resolve(new Err(err)));
}

/**
 * Short circuits on the FIRST Err value that we find
 */
const combineResultList = (resultList) => {
    let acc = ok([]);
    for (const result of resultList) {
        if (result.isErr()) {
            acc = err(result.error);
            break;
        }
        else {
            acc.map((list) => list.push(result.value));
        }
    }
    return acc;
};
/* This is the typesafe version of Promise.all
 *
 * Takes a list of ResultAsync<T, E> and success if all inner results are Ok values
 * or fails if one (or more) of the inner results are Err values
 */
const combineResultAsyncList = (asyncResultList) => ResultAsync.fromSafePromise(Promise.all(asyncResultList)).andThen(combineResultList);
/**
 * Give a list of all the errors we find
 */
const combineResultListWithAllErrors = (resultList) => {
    let acc = ok([]);
    for (const result of resultList) {
        if (result.isErr() && acc.isErr()) {
            acc.error.push(result.error);
        }
        else if (result.isErr() && acc.isOk()) {
            acc = err([result.error]);
        }
        else if (result.isOk() && acc.isOk()) {
            acc.value.push(result.value);
        }
        // do nothing when result.isOk() && acc.isErr()
    }
    return acc;
};
const combineResultAsyncListWithAllErrors = (asyncResultList) => ResultAsync.fromSafePromise(Promise.all(asyncResultList)).andThen(combineResultListWithAllErrors);

// eslint-disable-next-line @typescript-eslint/no-namespace
var Result;
(function (Result) {
    /**
     * Wraps a function with a try catch, creating a new function with the same
     * arguments but returning `Ok` if successful, `Err` if the function throws
     *
     * @param fn function to wrap with ok on success or err on failure
     * @param errorFn when an error is thrown, this will wrap the error result if provided
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function fromThrowable(fn, errorFn) {
        return (...args) => {
            try {
                const result = fn(...args);
                return ok(result);
            }
            catch (e) {
                return err(errorFn ? errorFn(e) : e);
            }
        };
    }
    Result.fromThrowable = fromThrowable;
    function combine(resultList) {
        return combineResultList(resultList);
    }
    Result.combine = combine;
    function combineWithAllErrors(resultList) {
        return combineResultListWithAllErrors(resultList);
    }
    Result.combineWithAllErrors = combineWithAllErrors;
})(Result || (Result = {}));
function ok(value) {
    return new Ok(value);
}
function err(err) {
    return new Err(err);
}
class Ok {
    constructor(value) {
        this.value = value;
    }
    isOk() {
        return true;
    }
    isErr() {
        return !this.isOk();
    }
    map(f) {
        return ok(f(this.value));
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mapErr(_f) {
        return ok(this.value);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    andThen(f) {
        return f(this.value);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    andThrough(f) {
        return f(this.value).map((_value) => this.value);
    }
    andTee(f) {
        try {
            f(this.value);
        }
        catch (e) {
            // Tee doesn't care about the error
        }
        return ok(this.value);
    }
    orTee(_f) {
        return ok(this.value);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    orElse(_f) {
        return ok(this.value);
    }
    asyncAndThen(f) {
        return f(this.value);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    asyncAndThrough(f) {
        return f(this.value).map(() => this.value);
    }
    asyncMap(f) {
        return ResultAsync.fromSafePromise(f(this.value));
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    unwrapOr(_v) {
        return this.value;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    match(ok, _err) {
        return ok(this.value);
    }
    safeUnwrap() {
        const value = this.value;
        /* eslint-disable-next-line require-yield */
        return (function* () {
            return value;
        })();
    }
    _unsafeUnwrap(_) {
        return this.value;
    }
    _unsafeUnwrapErr(config) {
        throw createNeverThrowError('Called `_unsafeUnwrapErr` on an Ok', this, config);
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias, require-yield
    *[Symbol.iterator]() {
        return this.value;
    }
}
class Err {
    constructor(error) {
        this.error = error;
    }
    isOk() {
        return false;
    }
    isErr() {
        return !this.isOk();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    map(_f) {
        return err(this.error);
    }
    mapErr(f) {
        return err(f(this.error));
    }
    andThrough(_f) {
        return err(this.error);
    }
    andTee(_f) {
        return err(this.error);
    }
    orTee(f) {
        try {
            f(this.error);
        }
        catch (e) {
            // Tee doesn't care about the error
        }
        return err(this.error);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    andThen(_f) {
        return err(this.error);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    orElse(f) {
        return f(this.error);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    asyncAndThen(_f) {
        return errAsync(this.error);
    }
    asyncAndThrough(_f) {
        return errAsync(this.error);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    asyncMap(_f) {
        return errAsync(this.error);
    }
    unwrapOr(v) {
        return v;
    }
    match(_ok, err) {
        return err(this.error);
    }
    safeUnwrap() {
        const error = this.error;
        return (function* () {
            yield err(error);
            throw new Error('Do not use this generator out of `safeTry`');
        })();
    }
    _unsafeUnwrap(config) {
        throw createNeverThrowError('Called `_unsafeUnwrap` on an Err', this, config);
    }
    _unsafeUnwrapErr(_) {
        return this.error;
    }
    *[Symbol.iterator]() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        // @ts-expect-error -- This is structurally equivalent and safe
        yield self;
        // @ts-expect-error -- This is structurally equivalent and safe
        return self;
    }
}
Result.fromThrowable;

/**
 * Convert the given array buffer into a Base64URL-encoded string. Ideal for converting various
 * credential response ArrayBuffers to string for sending back to the server as JSON.
 *
 * Helper method to compliment `base64URLStringToBuffer`
 */
function bufferToBase64URLString(buffer) {
    const bytes = new Uint8Array(buffer);
    let str = '';
    for (const charCode of bytes) {
        str += String.fromCharCode(charCode);
    }
    const base64String = btoa(str);
    return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Convert from a Base64URL-encoded string to an Array Buffer. Best used when converting a
 * credential ID from a JSON string to an ArrayBuffer, like in allowCredentials or
 * excludeCredentials
 *
 * Helper method to compliment `bufferToBase64URLString`
 */
function base64URLStringToBuffer(base64URLString) {
    // Convert from Base64URL to Base64
    const base64 = base64URLString.replace(/-/g, '+').replace(/_/g, '/');
    /**
     * Pad with '=' until it's a multiple of four
     * (4 - (85 % 4 = 1) = 3) % 4 = 3 padding
     * (4 - (86 % 4 = 2) = 2) % 4 = 2 padding
     * (4 - (87 % 4 = 3) = 1) % 4 = 1 padding
     * (4 - (88 % 4 = 0) = 4) % 4 = 0 padding
     */
    const padLength = (4 - (base64.length % 4)) % 4;
    const padded = base64.padEnd(base64.length + padLength, '=');
    // Convert to a binary string
    const binary = atob(padded);
    // Convert binary string to buffer
    const buffer = new ArrayBuffer(binary.length);
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return buffer;
}

// Utility functions using SimpleWebAuthn
const arrayBufferToBase64url = (buffer) => bufferToBase64URLString(buffer);
const base64urlToUint8Array = (base64url) => {
    try {
        const buffer = base64URLStringToBuffer(base64url);
        return ok(new Uint8Array(buffer));
    }
    catch (error) {
        return err(new Error(`Invalid base64url: ${error instanceof Error ? error.message : String(error)}`));
    }
};
const formatKeyAsHex = (arrayBuffer) => Array.from(new Uint8Array(arrayBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
const createRegistrationConfig = (config, options) => ({
    challenge: options.challenge,
    rp: {
        name: config.rpName,
        id: config.rpId || window?.location?.hostname || 'localhost'
    },
    user: {
        id: options.userId,
        name: options.userName,
        displayName: options.userDisplayName
    },
    pubKeyCredParams: [{ type: "public-key", alg: -7 }],
    authenticatorSelection: {
        userVerification: config.userVerification || "required",
        residentKey: config.residentKey || "required"
    },
    timeout: config.timeout || 60000,
    attestation: "none",
    extensions: {
        prf: { eval: { first: options.salt } }
    }
});
const createAuthenticationConfig = (config, options) => ({
    challenge: options.challenge,
    rpId: config.rpId || window?.location?.hostname || 'localhost',
    allowCredentials: [{
            type: "public-key",
            id: options.credentialId,
            transports: ["internal"]
        }],
    userVerification: config.userVerification || "required",
    extensions: {
        prf: { eval: { first: options.salt } }
    }
});
// Core library functions
const processRegistrationResult = (credential) => {
    const prfResult = credential.getClientExtensionResults().prf?.results?.first;
    return {
        credentialId: credential.rawId,
        encodedId: arrayBufferToBase64url(credential.rawId),
        derivedKey: prfResult ? (prfResult instanceof ArrayBuffer ? prfResult : prfResult.buffer.slice(prfResult.byteOffset, prfResult.byteOffset + prfResult.byteLength)) : null,
        keyHex: prfResult ? formatKeyAsHex(prfResult instanceof ArrayBuffer ? prfResult : prfResult.buffer.slice(prfResult.byteOffset, prfResult.byteOffset + prfResult.byteLength)) : null
    };
};
const processAuthenticationResult = (assertion) => {
    const prfResult = assertion.getClientExtensionResults().prf?.results?.first;
    if (!prfResult) {
        return err(new Error("PRF result missing from authentication assertion"));
    }
    const derivedKey = prfResult instanceof ArrayBuffer ? prfResult : prfResult.buffer.slice(prfResult.byteOffset, prfResult.byteOffset + prfResult.byteLength);
    return ok({
        derivedKey,
        keyHex: formatKeyAsHex(derivedKey)
    });
};
// Main monadic functions
const registerPasskey = (config, options) => async () => {
    try {
        const creationOptions = createRegistrationConfig(config, options);
        const credential = await navigator.credentials.create({
            publicKey: creationOptions
        });
        if (!credential) {
            return err(new Error("Failed to create credential"));
        }
        return ok(processRegistrationResult(credential));
    }
    catch (error) {
        return err(new Error(`Registration failed: ${error instanceof Error ? error.message : String(error)}`));
    }
};
const authenticateAndDeriveKey = (config, options) => async () => {
    try {
        const requestOptions = createAuthenticationConfig(config, options);
        const assertion = await navigator.credentials.get({
            publicKey: requestOptions
        });
        if (!assertion) {
            return err(new Error("Failed to get assertion"));
        }
        return processAuthenticationResult(assertion);
    }
    catch (error) {
        return err(new Error(`Authentication failed: ${error instanceof Error ? error.message : String(error)}`));
    }
};
// Utility functions for salt creation
const textToSalt = (text) => new TextEncoder().encode(text);
const randomSalt = (length = 32) => crypto.getRandomValues(new Uint8Array(length));
const randomChallenge = (length = 32) => crypto.getRandomValues(new Uint8Array(length));
const randomUserId = (length = 16) => crypto.getRandomValues(new Uint8Array(length));
// Higher-order function for combining operations
const deriveKeyFromRegistration = (config, userId, userName, userDisplayName, salt) => async () => {
    const challenge = randomChallenge();
    const registrationResult = await registerPasskey(config, {
        userId,
        userName,
        userDisplayName,
        challenge,
        salt
    })();
    if (registrationResult.isErr()) {
        return err(registrationResult.error);
    }
    const registration = registrationResult.value;
    // If PRF was supported during registration, we already have the key
    if (registration.derivedKey) {
        return ok({
            registration,
            derivedKey: {
                derivedKey: registration.derivedKey,
                keyHex: registration.keyHex || ''
            }
        });
    }
    // Otherwise, authenticate to derive the key
    const credentialIdResult = base64urlToUint8Array(registration.encodedId);
    if (credentialIdResult.isErr()) {
        return err(new Error(`Failed to decode credential ID: ${credentialIdResult.error.message}`));
    }
    const credentialId = credentialIdResult.value;
    const authResult = await authenticateAndDeriveKey(config, {
        credentialId,
        challenge: randomChallenge(),
        salt
    })();
    if (authResult.isErr()) {
        return err(authResult.error);
    }
    return ok({
        registration,
        derivedKey: authResult.value
    });
};

export { Result, arrayBufferToBase64url, authenticateAndDeriveKey, base64urlToUint8Array, createAuthenticationConfig, createRegistrationConfig, deriveKeyFromRegistration, err, formatKeyAsHex, ok, processAuthenticationResult, processRegistrationResult, randomChallenge, randomSalt, randomUserId, registerPasskey, textToSalt };
