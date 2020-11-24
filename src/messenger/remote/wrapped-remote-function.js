const Util = require("../util/util");

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
        const promise = new Promise();

        // save this promise to be executed later
        this._callInstances[instanceID] = promise;

        // execute this event in another context
        this._remoteInterface.send("__messenger__exec_fnc", {
            instance_id: instanceID,
            function_name: this._funcName,
            function_args: args
        });

        return promise;
    }
}

module.exports = WrappedRemoteFunction;