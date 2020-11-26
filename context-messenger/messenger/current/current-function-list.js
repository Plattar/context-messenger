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