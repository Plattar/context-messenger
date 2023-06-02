const Util = require("./util/util");

class FunctionObserver {
    constructor() {
        this._observers = new Map();
    }

    add(functionName, callback) {
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
}

module.exports = FunctionObserver;