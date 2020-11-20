
/**
 * WrappedFunction represents a container that holds and maintains a specific function
 * that can be called by any context
 */
class WrappedFunction {
    constructor(funcName) {
        this._value = undefined;
        this._callback = (rData, ...args) => { };
        this._funcName = funcName;
    }

    execute(...args) {
        const rData = this._value ? this._value(args) : undefined;

        if (this._callback) {
            this._callback(rData, args);
        }

        return rData;
    }

    set value(newValue) {
        if (typeof newValue !== "function") {
            throw new TypeError("WrappedFunction.value must be a function. To store values use Plattar.memory");
        }

        this._value = newValue;
    }

    /**
     * Watches for when this function is executed by some context
     */
    set watch(newValue) {
        if (typeof newValue === "function") {
            this._callback = newValue;
        }
        else {
            throw new TypeError("WrappedFunction.watch must be a type of function. Try using WrappedFunction.watch = (rData, ...args) => {}");
        }
    }
}

module.exports = WrappedFunction;