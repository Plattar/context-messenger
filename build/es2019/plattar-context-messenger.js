(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Plattar = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
const memory = require("./memory/memory.js");
const messenger = require("./messenger/messenger.js");

module.exports = {
    memory,
    messenger
}
},{"./memory/memory.js":2,"./messenger/messenger.js":6}],2:[function(require,module,exports){
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
        this._callback = (oldVal, newVal) => { };
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
/**
 * Messenger is a singleton that allows calling functions in multiple
 * contexts
 */
class Messenger {
    constructor() {
        this._parentStack = window.parent ? window.parent : undefined;
        this._childStack = undefined;
    }

    get parent() {

    }

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
},{}]},{},[1])(1)
});
