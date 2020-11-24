(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Plattar = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
const messenger = require("./messenger/messenger.js");
const memory = require("./memory/memory.js");

module.exports = {
    messenger,
    memory
}
},{"./memory/memory.js":2,"./messenger/messenger.js":9}],2:[function(require,module,exports){
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
const RemoteInterface = require("./remote-interface.js");

/**
 * This is a singleton class that handles events on a global basis. Allows
 * registering local event listeners etc..
 */
class GlobalEventHandler {
    constructor() {
        this._eventListeners = {};

        // global handler that forwards events to their respectful places
        // throughout the framework
        window.addEventListener("message", (evt) => {
            const data = evt.data;
            let jsonData = undefined;

            try {
                jsonData = JSON.parse(data);
            }
            catch (e) {
                // catch does nothing
                // this event might not be what we are looking for
                jsonData = undefined;
            }

            // make sure the event is properly formatted
            if (jsonData && jsonData.event && jsonData.data) {
                // see if there are any listeners for this
                if (this._eventListeners[jsonData.event]) {
                    const remoteInterface = new RemoteInterface(evt.source, evt.origin);

                    // loop through and call all the event handlers
                    this._eventListeners[jsonData.event].forEach((callback) => {
                        try {
                            callback(remoteInterface, jsonData.data);
                        }
                        catch (e) {
                            console.error("GlobalEventHandler.message() error occured during callback ");
                            console.error(e);
                        }
                    });
                }
            }
        });
    }

    listen(event, callback) {
        if (typeof callback !== "function") {
            throw new TypeError("GlobalEventHandler.listen(event, callback) callback must be a type of function.");
        }

        if (!this._eventListeners[event]) {
            this._eventListeners[event] = [];
        }

        this._eventListeners[event].push(callback);
    }
}

GlobalEventHandler.default = () => {
    if (!GlobalEventHandler._default) {
        GlobalEventHandler._default = new GlobalEventHandler();
    }

    return GlobalEventHandler._default;
};

module.exports = GlobalEventHandler;
},{"./remote-interface.js":10}],9:[function(require,module,exports){
const CurrentFunctionList = require("./current/current-function-list");
const RemoteInterface = require("./remote-interface");
const RemoteFunctionList = require("./remote/remote-function-list");
const Util = require("./util/util.js");
const global = require("./global-event-handler.js");

/**
 * Messenger is a singleton that allows calling functions in multiple
 * contexts
 */
class Messenger {
    constructor() {
        // generate a unique id for this instance of the messenger
        this._id = Util.id();

        // ensure the parent stack does not target itself
        this._parentStack = RemoteInterface.default();

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

                switch (prop) {
                    case "id": return target._id;
                    case "self": return target._currentFunctionList;
                    case "_setup":
                    case "_registerListeners":
                    case "_id":
                    case "_parentStack": return target[prop];
                    default:
                        break;
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
        this._registerListeners();

        // if a parent exists, send a message calling for an initialisation
        if (this._parentStack) {
            this._parentStack.send("__messenger__child_init");
        }
        else {
            console.warn("Messenger[" + this._id + "] does not have a parent. Plattar.messenger.parent will be undefined");
        }
    }

    /**
     * Register all critical listener interfaces so the framework can function correctly
     */
    _registerListeners() {
        global.default().listen("__messenger__child_init", (src, data) => {
            const iframeID = src.id;

            // check reserved key list
            switch (iframeID) {
                case undefined: throw new Error("Messenger[" + this._id + "].setup() Component ID cannot be undefined");
                case "self": throw new Error("Messenger[" + this._id + "].setup() Component ID of \"self\" cannot be used as the keyword is reserved");
                case "parent": throw new Error("Messenger[" + this._id + "].setup() Component ID of \"parent\" cannot be used as the keyword is reserved");
                case "id": throw new Error("Messenger[" + this._id + "].setup() Component ID of \"id\" cannot be used as the keyword is reserved");
                case "onload": throw new Error("Messenger[" + this._id + "].setup() Component ID of \"onload\" cannot be used as the keyword is reserved");
                default:
                    break;
            }

            // initialise the child iframe as a messenger pipe
            if (!this[iframeID]) {
                this[iframeID] = new RemoteFunctionList(iframeID);
            }

            this[iframeID].setup(new RemoteInterface(src.source, src.origin));

            src.send("__messenger__parent_init");
        });

        global.default().listen("__messenger__parent_init", (src, data) => {
            if (!this["parent"]) {
                this["parent"] = new RemoteFunctionList("parent");
            }

            this["parent"].setup(new RemoteInterface(src.source, src.origin));
        });

        // this listener will fire remotely to execute a function in the current
        // context
        global.default().listen("__messenger__exec_fnc", (src, data) => {
            const instanceID = data.instance_id;
            const args = data.function_args;
            const fname = data.function_name;

            // using JS reflection, execute the local function
            Plattar.messenger.self[fname](...args).then((res) => {
                src.send("__messenger__exec_fnc_result", {
                    function_status: "success",
                    function_name: fname,
                    function_args: res,
                    instance_id: instanceID
                });
            }).catch((err) => {
                src.send("__messenger__exec_fnc_result", {
                    function_status: "error",
                    function_name: fname,
                    function_args: err.message,
                    instance_id: instanceID
                });
            });
        });
    }
}

module.exports = new Messenger();
},{"./current/current-function-list":6,"./global-event-handler.js":8,"./remote-interface":10,"./remote/remote-function-list":11,"./util/util.js":13}],10:[function(require,module,exports){
/**
 * Provides a single useful interface for performing remote function calls
 */
class RemoteInterface {
    constructor(source, origin) {
        this._source = source;
        this._origin = origin;

        if (typeof this._source.postMessage !== 'function') {
            throw new Error("RemoteInterface() provided source is invalid");
        }
    }

    get source() {
        return this._source;
    }

    get origin() {
        return this._origin;
    }

    /**
     * Returns the frameElement ID, or undefined if no frameElement exists in the source
     */
    get id() {
        return this.source.frameElement ? this.source.frameElement.id : undefined;
    }

    /**
     * Use the registered source to send data upstream/downstream
     */
    send(event, data) {
        const sendData = {
            event: event,
            data: (data || {})
        };

        this.source.postMessage(JSON.stringify(sendData), this.origin);
    }

    /**
     * Creates and returns a default RemoteInterface for the parent stack
     */
    static default() {
        const parentStack = window.parent ? ((window.frameElement && window.frameElement.nodeName == "IFRAME") ? window.parent : undefined) : undefined;

        if (parentStack) {
            return new RemoteInterface(parentStack, "*");
        }

        return undefined;
    }
}

module.exports = RemoteInterface;
},{}],11:[function(require,module,exports){
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

                // pre-defined functions for this object. Don't block access to these.
                switch (prop) {
                    case "setup":
                    case "isValid":
                    case "onload":
                    case "_remoteInterface":
                    case "_callback":
                        return target[prop];
                    default:
                        break;
                }

                // on first access, we create a WrappedValue type
                if (!target[prop]) {
                    target[prop] = new WrappedFunction(prop, target._remoteInterface);
                }

                // return an anonymous function that executes for this variable
                return (...args) => {
                    return target[prop].exec(...args);
                };
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
        if (typeof remoteInterface.send !== 'function') {
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
},{"./wrapped-remote-function":12}],12:[function(require,module,exports){
const Util = require("../util/util.js");
const global = require("../global-event-handler.js");

/**
 * WrappedRemoteFunction represents a container that holds and maintains a specific function
 * that can be called by any context. This particular container executes and handles remote 
 * function calls.
 */
class WrappedRemoteFunction {
    constructor(funcName, remoteInterface) {
        this._funcName = funcName;
        this._remoteInterface = remoteInterface;

        this._callInstances = {};

        global.default().listen("__messenger__exec_fnc_result", (src, data) => {
            const instanceID = data.instance_id;

            // the function name must match
            if (data.function_name !== this._funcName) {
                return;
            }

            // the instance ID must be found, otherwise this is a rogue execution
            // that can be ignored (should not happen)
            if (!this._callInstances[instanceID]) {
                return;
            }

            const promise = this._callInstances[instanceID];

            // remove the old instance
            delete this._callInstances[instanceID];

            // perform the promise callbacks
            if (data.function_status === "success") {
                promise.accept(data.function_args);
            }
            else {
                promise.reject(new Error(data.function_args));
            }
        });
    }

    /**
     * Executes a remote function that lays outside of the current context
     */
    exec(...args) {
        const instanceID = Util.id();

        // ensure this instance ID has not been added previously
        // NOTE: This should not ever be executed as all instance ID's are unique
        // If this executes then the PRNG scheme needs to be swapped
        if (this._callInstances[instanceID]) {
            return new Promise((accept, reject) => {
                return reject(new Error("WrappedRemoteFunction.exec() cannot execute function. System generated duplicate Instance ID. PRNG needs checking"));
            });
        }

        // add this call as a unique instance and save the Promise
        // to be executed later
        return new Promise((accept, reject) => {
            // save this promise to be executed later
            this._callInstances[instanceID] = {
                accept: accept,
                reject: reject
            };

            // execute this event in another context
            this._remoteInterface.send("__messenger__exec_fnc", {
                instance_id: instanceID,
                function_name: this._funcName,
                function_args: args
            });
        });
    }
}

module.exports = WrappedRemoteFunction;
},{"../global-event-handler.js":8,"../util/util.js":13}],13:[function(require,module,exports){
class Util {

    // generate a quick, random ID thats useful for message digests and class checks
    static id() {
        return Math.abs(Math.floor(Math.random() * 10000000000000));
    }
}

module.exports = Util;
},{}]},{},[1])(1)
});
