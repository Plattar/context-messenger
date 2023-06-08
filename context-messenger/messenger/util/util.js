class Util {

    /**
     * generate a quick, random ID thats useful for message digests and class checks
     */
    static id() {
        return Math.abs(Math.floor(Math.random() * 10000000000000));
    }

    /**
     * checks if the provided object is a type of Promise object
     */
    static isPromise(obj) {
        return !!obj && (typeof obj === "object" || typeof obj === "function") && typeof obj.then === "function";
    }

    /**
     * checks if the provided object is a type of Error object
     */
    static isError(e) {
        return e && e.stack && e.message && typeof e.stack === "string" && typeof e.message === "string";
    }

    /**
     * checks if the provided object is a type of Function object
     */
    static isFunction(obj) {
        return obj && obj instanceof Function;
    }
}

module.exports = Util;