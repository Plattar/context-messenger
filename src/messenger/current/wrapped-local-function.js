/**
 * WrappedLocalFunction represents a container that holds and maintains a specific function
 * that was defined in the current web context. It can also be executed by other web contexts
 * using the Messenger framework.
 */
class WrappedLocalFunction {
    constructor(funcName) {
        this._value = undefined;
        this._callback = undefined;
        this._funcName = funcName;
    }

    /**
     * executes the internally stored function with the provided arguments
     */
    _execute(...args) {
        const rData = this._value(...args);

        if (this._callback) {
            this._callback(rData, ...args);
        }

        return rData;
    }

    /**
     * Executes the internal function in a Promise chain. Results of the execution
     * will be evaluated in the promise chain itself
     */
    exec(...args) {
        return new Promise((accept, reject) => {
            if (!this._value) {
                return reject(new Error("WrappedLocalFunction.exec() function with name " + this._funcName + "() is not defined"));
            }

            try {
                // otherwise execute the function
                return accept(this._execute(...args));
            }
            catch (e) {
                return reject(e);
            }
        });
    }

    /**
     * Stores a function for later execution
     */
    set value(newValue) {
        if (typeof newValue !== "function") {
            throw new TypeError("WrappedLocalFunction.value must be a function. To store values use Plattar.memory");
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
            throw new TypeError("WrappedLocalFunction.watch must be a type of function. Try using WrappedLocalFunction.watch = (rData, ...args) => {}");
        }
    }
}

module.exports = WrappedLocalFunction;