const Util = require("./util/util");

class FunctionObserver {
    constructor() {
        this._observers = new Map();
    }

    /**
     * Adds a new callback/listener using the provided function name
     * and a callback function
     */
    subscribe(functionName, callback) {
        if (!functionName || !Util.isFunction(callback)) {
            return () => { };
        }

        // grab an instance of the observer to add the function into
        const observers = this._observers;

        let list = observers.get(functionName);

        if (!list) {
            list = [];
            observers.set(functionName, list);
        }

        list.push(callback);

        return () => {
            return this.unsubscribe(functionName, callback);
        };
    }

    /**
     * Removes an existing callback from the provided function name if it exists
     */
    unsubscribe(functionName, callback) {
        if (!functionName || !Util.isFunction(callback)) {
            return false;
        }

        const observers = this._observers;

        const list = observers.get(functionName);

        // search and remove function from the list if it exists
        if (list) {
            const index = list.indexOf(callback);

            if (index > -1) {
                list.splice(index, 1);

                return true;
            }
        }

        return false;
    }

    /**
     * Called by an external unit in order to execute all callbacks
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