const CurrentFunctionList = require("./current/current-function-list");

/**
 * Messenger is a singleton that allows calling functions in multiple
 * contexts
 */
class Messenger {
    constructor() {
        this._parentStack = window.parent ? window.parent : undefined;
        this._childStack = undefined;

        this._currentFunctionList = new CurrentFunctionList();
    }

    /**
     * Allows calling functions on the parent stack. Use this if you
     * are inside the iframe and want to call functions on the parent page.
     */
    get parent() {

    }

    /**
     * The current stack is the current context. This is primarily used to
     * define functions that exist on the current stack.
     */
    get self() {
        return this._currentFunctionList;
    }

    /**
    * Allows calling functions on the child stack. Use this if you
    * want to call functions defined inside of an iframe
    */
    get child() {

    }

    /**
     * Sets a single Child stack as part of this Messenger framework.
     * It allows calling functions as defined in the child frame.
     */
    set child(value) {
        if (!value) {
            throw new TypeError("Messenger.child cannot be undefined");
        }

        if (typeof value.postMessage === "function") {
            throw new TypeError("Messenger.child must have a .postMessage() function definition");
        }

        this._childStack = value;
    }

    /**
    * Sets a single Parent stack as part of this Messenger framework.
    * It allows calling functions as defined in the parent frame.
    */
    set parent(value) {
        if (!value) {
            throw new TypeError("Messenger.parent cannot be undefined");
        }

        if (typeof value.postMessage === "function") {
            throw new TypeError("Messenger.parent must have a .postMessage() function definition");
        }

        this._parentStack = value;
    }
}

module.exports = new Messenger();