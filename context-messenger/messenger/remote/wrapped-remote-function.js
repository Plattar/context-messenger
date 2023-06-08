const Util = require("../util/util.js");
const GlobalEventHandler = require("../global-event-handler.js");

/**
 * WrappedRemoteFunction represents a container that holds and maintains a specific function
 * that can be called by any context. This particular container executes and handles remote 
 * function calls.
 */
class WrappedRemoteFunction {
    constructor(funcName, remoteInterface, functionObserver) {
        this._funcName = funcName;
        this._remoteInterface = remoteInterface;
        this._functionObserver = functionObserver;

        console.log("WrappedRemoteFunction - " + this._functionObserver);

        this._callInstances = {};

        // listen for function execution results
        GlobalEventHandler.instance().listen("__messenger__exec_fnc_result", (src, data) => {
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
                // execute the observers
                console.log("WrappedRemoteFunction.call - " + this._functionObserver);
                this._functionObserver.call(this._funcName, {
                    type: "return",
                    state: "success",
                    data: data.function_args
                });

                promise.accept(data.function_args);
            }
            else {
                // execute the observers
                this._functionObserver.call(this._funcName, {
                    type: "return",
                    state: "exception",
                    data: new Error(data.function_args)
                });

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

            // execute the observers
            this._functionObserver.call(this._funcName, {
                type: "call",
                state: "success",
                data: args
            });
        });
    }
}

module.exports = WrappedRemoteFunction;