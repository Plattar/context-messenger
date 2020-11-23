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

                // initialise the child iframe as a messenger pipe
                this[iframeID] = new RemoteFunctionList(evt.source);

                evt.source.postMessage("__messenger__parent_init", evt.origin || "*");
            }
            else if (data === "__messenger__parent_init") {
                this._parentFunctionList = new RemoteFunctionList(evt.source);
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

    /**
     * Allows calling functions on the parent stack. Use this if you
     * are inside the iframe and want to call functions on the parent page.
     */
    get parent() {
        return this._parentFunctionList;
    }

    /**
     * The current stack is the current context. This is primarily used to
     * define functions that exist on the current stack.
     */
    get self() {
        return this._currentFunctionList;
    }
}

module.exports = new Messenger();