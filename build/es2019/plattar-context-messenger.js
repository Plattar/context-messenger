(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Plattar = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const Memory = require("./memory/memory.js");


},{"./memory/memory.js":2}],2:[function(require,module,exports){
const PermanentMemory = require("./permanent-memory");
const TemporaryMemory = require("./temporary-memory");

/**
 * Memory is a singleton that allows setting variables from multiple
 * iframe contexts
 */
class Memory {
    constructor() {
        this._tempMemory = new TemporaryMemory(this);
        this._permMemory = new PermanentMemory(this);
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
class PermanentMemory extends Proxy {
    constructor(memoryInstance) {
        super({}, {
            get: (target, prop, receiver) => {
                return Reflect.get(...arguments);
            },
            set: (obj, prop, value) => {
                obj[prop] = value;

                return true;
            }
        });

        this._memory = memoryInstance;
    }
}

module.exports = PermanentMemory;
},{}],4:[function(require,module,exports){
class TemporaryMemory extends Proxy {
    constructor(memoryInstance) {
        super({}, {
            get: (target, prop, receiver) => {
                return Reflect.get(...arguments);
            },
            set: (obj, prop, value) => {
                obj[prop] = value;

                return true;
            }
        });

        this._memory = memoryInstance;
    }
}

module.exports = TemporaryMemory;
},{}]},{},[1])(1)
});
