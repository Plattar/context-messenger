(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Plattar = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
const Memory = require("./memory/memory.js");

module.exports = {
    Memory
}
},{"./memory/memory.js":2}],2:[function(require,module,exports){
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
                            target[variable] = new WrappedValue();
                        }

                        target[variable].watch = callback;
                    };
                }

                // on first access, we create a WrappedValue type
                if (!target[prop]) {
                    target[prop] = new WrappedValue();
                }

                return target[prop].value;
            },
            set: (target, prop, value) => {
                if (!target[prop]) {
                    target[prop] = new WrappedValue();
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
                            target[variable] = new WrappedValue();
                        }

                        target[variable].watch = callback;
                    };
                }

                // on first access, we create a WrappedValue type
                if (!target[prop]) {
                    target[prop] = new WrappedValue();
                }

                return target[prop].value;
            },
            set: (target, prop, value) => {
                if (!target[prop]) {
                    target[prop] = new WrappedValue();
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
    constructor() {
        this._value = undefined;
        this._callback = (oldVal, newVal) => { };
    }

    get value() {
        return this._value;
    }

    set value(newValue) {
        if (typeof newValue === "function") {
            throw new TypeError("WrappedValue.value cannot be set to a function type");
        }

        const oldValue = this._value;

        this._value = newValue;

        // perform the callback that the value has just changed
        this._callback(oldValue, this._value);
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
},{}]},{},[1])(1)
});
