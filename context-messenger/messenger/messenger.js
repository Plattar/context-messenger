const CurrentFunctionList = require("./current/current-function-list");
const RemoteInterface = require("./remote-interface");
const RemoteFunctionList = require("./remote/remote-function-list");
const Util = require("./util/util.js");
const GlobalEventHandler = require("./global-event-handler.js");
const Broadcaster = require("./broadcaster.js");

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

        // allows calling functions on everything
        this._broadcaster = new Broadcaster(this);

        // we still need to confirm if a parent exists and has the messenger
        // framework added.. see _setup() function
        this._parentFunctionList = undefined;

        // these are the pre-registered available child objects
        this._callableList = [];

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
                    case "broadcast": return target._broadcaster;
                    case "_setup":
                    case "_registerListeners":
                    case "_id":
                    case "_broadcaster":
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

        if (window.location.protocol !== "https:") {
            console.warn("Messenger[" + this._id + "] requires https but protocol is \"" + window.location.protocol + "\", messenger will not work correctly.");
        }
    }

    /**
     * Register all critical listener interfaces so the framework can function correctly
     */
    _registerListeners() {
        GlobalEventHandler.instance().listen("__messenger__child_init", (src, data) => {
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
            this[iframeID] = new RemoteFunctionList(iframeID);
            this[iframeID].setup(new RemoteInterface(src.source, src.origin));

            // add the interface to the broadcaster
            this._broadcaster._push(iframeID);

            src.send("__messenger__parent_init");
        });

        GlobalEventHandler.instance().listen("__messenger__parent_init", (src, data) => {
            this["parent"] = new RemoteFunctionList("parent");
            this["parent"].setup(new RemoteInterface(src.source, src.origin));
        });

        // this listener will fire remotely to execute a function in the current
        // context
        GlobalEventHandler.instance().listen("__messenger__exec_fnc", (src, data) => {
            const instanceID = data.instance_id;
            const args = data.function_args;
            const fname = data.function_name;

            // using JS reflection, execute the local function
            GlobalEventHandler.instance().messengerInstance.self[fname](...args).then((res) => {
                src.send("__messenger__exec_fnc_result", {
                    function_status: "success",
                    function_name: fname,
                    function_args: res,
                    instance_id: instanceID
                });
            }).catch((err) => {
                const error_arg = Util.isError(err) ? err.message : err;

                src.send("__messenger__exec_fnc_result", {
                    function_status: "error",
                    function_name: fname,
                    function_args: (error_arg ? error_arg : "unknown error"),
                    instance_id: instanceID
                });
            });
        });
    }
}

module.exports = Messenger;