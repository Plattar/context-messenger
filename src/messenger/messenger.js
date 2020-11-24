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

                switch (prop) {
                    case "id": return target._id;
                    case "self": return target._currentFunctionList;
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

                this[iframeID].setup({
                    source: evt.source,
                    origin: evt.origin
                });

                evt.source.postMessage("__messenger__parent_init", evt.origin || "*");
            }
            else if (data === "__messenger__parent_init") {
                if (!this["parent"]) {
                    this["parent"] = new RemoteFunctionList("parent");
                }

                this["parent"].setup({
                    source: evt.source,
                    origin: evt.origin
                });
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