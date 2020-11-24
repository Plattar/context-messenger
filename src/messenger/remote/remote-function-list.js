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
        if (!remoteInterface.source || typeof remoteInterface.source.postMessage !== 'function') {
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