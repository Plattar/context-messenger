const WrappedFunction = require("./wrapped-remote-function");

class RemoteFunctionList {
    constructor() {
        return new Proxy({}, {
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
                throw new Error("RemoteFunctionList.set cannot add a remote function from current context. Use Plattar.messenger.self instead");
            }
        });
    }
}

module.exports = RemoteFunctionList;