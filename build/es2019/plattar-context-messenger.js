(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Plattar = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
const messenger = require("./messenger/messenger.js");
const memory = require("./memory/memory.js");

module.exports = {
    messenger,
    memory
}
},{"./memory/memory.js":2,"./messenger/messenger.js":8}],2:[function(require,module,exports){
const PermanentMemory = require("./permanent-memory");
const TemporaryMemory = require("./temporary-memory");

/**
 * Memory is a singleton that allows setting variables from multiple
 * iframe contexts
 */
class Memory {
    constructor() {
        this._tempMemory = new TemporaryMemory();
        this._permMemory = new PermanentMemory();
    }

    get temp() {
        return this._tempMemory;
    }

    get perm() {
        return this._permMemory;
    }
}

module.exports = new Memory();
},{"./permanent-memory":3,"./temporary-memory":4}],3:[function(require,module,exports){
const WrappedValue = require("./wrapped-value");

class PermanentMemory {
    constructor() {
        return new Proxy({}, {
            get: (target, prop, receiver) => {
                // sets the watcher callback
                if (prop === "watch") {
                    return (variable, callback) => {
                        if (!target[variable]) {
                            target[variable] = new WrappedValue(variable, true);
                        }

                        target[variable].watch = callback;
                    };
                }

                // clears everything, including specific items
                if (prop === "clear") {
                    return () => {
                        for (const pitem of Object.getOwnPropertyNames(target)) {
                            delete target[pitem];

                            localStorage.removeItem(pitem);
                        }
                    };
                }

                // clears everything, including from storage
                if (prop === "purge") {
                    return () => {
                        localStorage.clear();

                        for (const prop of Object.getOwnPropertyNames(target)) {
                            delete target[prop];
                        }
                    };
                }

                // on first access, we create a WrappedValue type
                if (!target[prop]) {
                    target[prop] = new WrappedValue(prop, true);
                }

                return target[prop].value;
            },
            set: (target, prop, value) => {
                if (!target[prop]) {
                    target[prop] = new WrappedValue(prop, true);
                }

                target[prop].value = value;

                return true;
            }
        });
    }
}

module.exports = PermanentMemory;
},{"./wrapped-value":5}],4:[function(require,module,exports){
const WrappedValue = require("./wrapped-value");

class TemporaryMemory {
    constructor() {
        return new Proxy({}, {
            get: (target, prop, receiver) => {
                // sets the watcher callback
                if (prop === "watch") {
                    return (variable, callback) => {
                        if (!target[variable]) {
                            target[variable] = new WrappedValue(variable, false);
                        }

                        target[variable].watch = callback;
                    };
                }

                // clears everything
                // purge is the same thing for all temporary variables
                if (prop === "clear" || prop === "purge") {
                    return () => {
                        for (const prop of Object.getOwnPropertyNames(target)) {
                            delete target[prop];
                        }
                    };
                }

                // on first access, we create a WrappedValue type
                if (!target[prop]) {
                    target[prop] = new WrappedValue(prop, false);
                }

                return target[prop].value;
            },
            set: (target, prop, value) => {
                if (!target[prop]) {
                    target[prop] = new WrappedValue(prop, false);
                }

                target[prop].value = value;

                return true;
            }
        });
    }
}

module.exports = TemporaryMemory;
},{"./wrapped-value":5}],5:[function(require,module,exports){
/**
 * WrappedValue represents a generic value type with a callback function
 * for when the value has changed
 */
class WrappedValue {
    constructor(varName, isPermanent) {
        this._value = undefined;
        this._callback = undefined;
        this._isPermanent = isPermanent;
        this._varName = varName;

        if (this._isPermanent) {
            this._value = JSON.parse(localStorage.getItem(this._varName));
        }
    }

    get value() {
        if (this._isPermanent && this._value == undefined) {
            this._value = JSON.parse(localStorage.getItem(this._varName));
        }

        return this._value;
    }

    set value(newValue) {
        if (typeof newValue === "function") {
            throw new TypeError("WrappedValue.value cannot be set to a function type");
        }

        const oldValue = this._value;

        this._value = newValue;

        // for permanent variables, set the variable type
        if (this._isPermanent) {
            localStorage.setItem(this._varName, JSON.stringify(this._value));
        }

        // do not fire callback if the old and new values do not match
        if (this._callback && oldValue !== newValue) {
            // perform the callback that the value has just changed
            this._callback(oldValue, this._value);
        }
    }

    /**
     * Watches for any change in the current variable
     */
    set watch(newValue) {
        if (typeof newValue === "function") {
            if (newValue.length == 2) {
                this._callback = newValue;
            }
            else {
                throw new RangeError("WrappedValue.watch callback must accept exactly 2 variables. Try using WrappedValue.watch = (oldVal, newVal) => {}");
            }
        }
        else {
            throw new TypeError("WrappedValue.watch must be a type of function. Try using WrappedValue.watch = (oldVal, newVal) => {}");
        }
    }
}

module.exports = WrappedValue;
},{}],6:[function(require,module,exports){
const WrappedFunction = require("./wrapped-local-function");

class CurrentFunctionList {
    constructor() {
        return new Proxy(this, {
            get: (target, prop, receiver) => {
                // sets the watcher callback
                if (prop === "watch") {
                    return (variable, callback) => {
                        if (!target[variable]) {
                            target[variable] = new WrappedFunction(variable);
                        }

                        target[variable].watch = callback;
                    };
                }

                // clears everything, including specific items
                if (prop === "clear" || prop === "purge") {
                    return () => {
                        for (const pitem of Object.getOwnPropertyNames(target)) {
                            delete target[pitem];
                        }
                    };
                }

                // on first access, we create a WrappedValue type
                if (!target[prop]) {
                    target[prop] = new WrappedFunction(prop);
                }

                // return an anonymous function that executes for this variable
                return (...args) => {
                    return target[prop].exec(...args);
                };
            },
            set: (target, prop, value) => {
                if (!target[prop]) {
                    target[prop] = new WrappedFunction(prop);
                }

                target[prop].value = value;

                return true;
            }
        });
    }
}

module.exports = CurrentFunctionList;
},{"./wrapped-local-function":7}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
const CurrentFunctionList = require("./current/current-function-list");
const RemoteFunctionList = require("./remote/remote-function-list");
const Util = require("./util/util.js");

/**
 * Messenger is a singleton that allows calling functions in multiple
 * contexts
 */
class Messenger {
    constructor() {
        // generate a unique id for this instance of the messenger
        this._id = Util.id();

        // ensure the parent stack does not target itself
        this._parentStack = window.parent ? (this._isIframe() ? window.parent : undefined) : undefined;

        // allow adding local functions immedietly
        this._currentFunctionList = new CurrentFunctionList();

        // we still need to confirm if a parent exists and has the messenger
        // framework added.. see _setup() function
        this._parentFunctionList = undefined;

        this._setup();

        return new Proxy(this, {
            get: (target, prop, receiver) => {
                // sets the watcher callback
                if (prop === "onload") {
                    return (variable, callback) => {
                        if (variable === "self" || variable === "id") {
                            return callback();
                        }

                        if (!target[variable]) {
                            target[variable] = new RemoteFunctionList(variable);
                        }

                        target[variable].onload(callback);
                    };
                }

                if (prop === "id") {
                    return target._id;
                }

                if (prop === "self") {
                    return this._currentFunctionList;
                }

                const targetVar = target[prop];

                // return undefined if target variable doesn't exist
                // or it has not been verified yet
                if (!targetVar || !targetVar.isValid()) {
                    return undefined;
                }

                return target[prop];
            }
        });
    }

    /**
     * Internal function call to initialise the messenger framework
     */
    _setup() {
        // if this message is recieved, then let the messenger know to
        // initialise the child object
        window.addEventListener("message", (evt) => {
            const data = evt.data;

            if (data === "__messenger__child_init") {
                const iframeID = evt.source.frameElement.id;

                if (iframeID === "self") {
                    throw new Error("Messenger[" + this._id + "].setup() Component ID of \"self\" cannot be used as the keyword is reserved");
                }

                if (iframeID === "parent") {
                    throw new Error("Messenger[" + this._id + "].setup() Component ID of \"parent\" cannot be used as keyword is reserved");
                }

                if (iframeID === "id") {
                    throw new Error("Messenger[" + this._id + "].setup() Component ID of \"id\" cannot be used as keyword is reserved");
                }

                // initialise the child iframe as a messenger pipe
                if (!this[iframeID]) {
                    this[iframeID] = new RemoteFunctionList(iframeID);
                }

                this[iframeID].setup(evt.source);

                evt.source.postMessage("__messenger__parent_init", evt.origin || "*");
            }
            else if (data === "__messenger__parent_init") {
                if (!this["parent"]) {
                    this["parent"] = new RemoteFunctionList("parent");
                }

                this["parent"].setup(evt.source);
            }
        });

        // if a parent exists, send a message calling for an initialisation
        if (this._parentStack) {
            this._parentStack.postMessage("__messenger__child_init", "*");
        }
        else {
            console.warn("Messenger[" + this._id + "] does not have a parent. Plattar.messenger.parent will be undefined");
        }
    }

    /**
     * Checks if the current Messenger is actually inside an iframe (embedded)
     */
    _isIframe() {
        return window.frameElement && window.frameElement.nodeName == "IFRAME";
    }
}

module.exports = new Messenger();
},{"./current/current-function-list":6,"./remote/remote-function-list":9,"./util/util.js":11}],9:[function(require,module,exports){
const WrappedFunction = require("./wrapped-remote-function");

class RemoteFunctionList {
    constructor(remoteName) {

        this._remoteInterface = undefined;
        this._callback = undefined;

        this._remoteName = remoteName;

        return new Proxy(this, {
            get: (target, prop, receiver) => {
                // sets the watcher callback
                if (prop === "watch") {
                    throw new Error("RemoteFunctionList.watch cannot watch execution of remote functions from current context. Did you mean to use Plattar.messenger.self instead?");
                }

                // clears everything, including specific items
                if (prop === "clear") {
                    throw new Error("RemoteFunctionList.clear cannot clear/remove remote functions from current context. Did you mean to use Plattar.messenger.self.clear() instead?");
                }

                // clears everything, including specific items
                if (prop === "purge") {
                    throw new Error("RemoteFunctionList.purge cannot clear/remove remote functions from current context. Did you mean to use Plattar.messenger.self.purge() instead?");
                }

                return target[prop];
            },
            set: (target, prop, value) => {
                if (prop === "_remoteInterface" || prop === "_callback") {
                    target[prop] = value;

                    return true;
                }

                throw new Error("RemoteFunctionList.set cannot add a remote function from current context. Use Plattar.messenger.self instead");
            }
        });
    }

    setup(remoteInterface) {
        if (typeof remoteInterface.postMessage !== 'function') {
            throw new Error("RemoteFunctionList.setup() provided invalid interface");
        }

        this._remoteInterface = remoteInterface;

        if (this._callback) {
            this._callback();
        }
    }

    isValid() {
        return this._remoteInterface != undefined;
    }

    onload(callback) {
        this._callback = callback;

        if (this.isValid()) {
            this._callback();
        }
    }
}

module.exports = RemoteFunctionList;
},{"./wrapped-remote-function":10}],10:[function(require,module,exports){
/**
 * WrappedRemoteFunction represents a container that holds and maintains a specific function
 * that can be called by any context. This particular container executes and handles remote 
 * function calls.
 */
class WrappedRemoteFunction {

}

module.exports = WrappedRemoteFunction;
},{}],11:[function(require,module,exports){
class Util {

    // generate a quick, random ID thats useful for message digests and class checks
    static id() {
        return Math.abs(Date.now() & Math.floor(Math.random() * 1000000000000000000));
    }
}

module.exports = Util;
},{}]},{},[1])(1)
});
