const Util = require("./util/util");

class FunctionObserver {
    constructor() {
        this._observers = new Map();
    }

    /**
     * Adds a new callback/listener using the provided function name
     * and a callback function
     */
    observe(functionName, callback) {
        if (!functionName || !Util.isFunction(callback)) {
            return;
        }

        // grab an instance of the observer to add the function into
        const observers = this._observers;

        let list = observers.get(functionName);

        if (!list) {
            list = [];
            observers.set(functionName, list);
        }

        list.push(callback);
    }

    /**
     * Removes an existing callback from the provided function name if it exists
     */
    remove(functionName, callback) {
        if (!functionName || !Util.isFunction(callback)) {
            return;
        }

        const observers = this._observers;

        const list = observers.get(functionName);

        // search and remove function from the list if it exists
        if (list) {
            const index = list.indexOf(callback);

            if (index > -1) {
                list.splice(index, 1);
            }
        }
    }

    /**
     * Called by an external module in order to execute all callbacks
     * belonging to the provided function
     */
    call(functionName, data) {
        if (!functionName || !data) {
            return;
        }

        const observers = this._observers;

        const list = observers.get(functionName);

        // search and remove function from the list if it exists
        if (list && list.length > 0) {
            list.forEach((observer) => {
                try {
                    if (observer) {
                        observer(data);
                    }
                }
                catch (e) {/*silent*/ }
            });
        }
    }
}

module.exports = FunctionObserver;