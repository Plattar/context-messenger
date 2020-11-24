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
        global.default().listen("__messenger__child_init", (src, data) => {
            const iframeID = src.id;

            // check reserved key list
            switch (iframeID) {
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

        // if a parent exists, send a message calling for an initialisation
        if (this._parentStack) {
            this._parentStack.send("__messenger__child_init");
        }
        else {
            console.warn("Messenger[" + this._id + "] does not have a parent. Plattar.messenger.parent will be undefined");
        }
    }
}

module.exports = new Messenger();