const WrappedValue = require("./wrapped-value");

class TemporaryMemory {
    constructor(messengerInstance) {
        return new Proxy(this, {
            get: (target, prop, receiver) => {
                // sets the watcher callback
                if (prop === "watch") {
                    return (variable, callback) => {
                        if (!target[variable]) {
                            target[variable] = new WrappedValue(variable, false, messengerInstance);
                        }

                        target[variable].watch = callback;
                    };
                }

                // clears everything
                // purge is the same thing for all temporary variables
                if (prop === "clear" || prop === "purge") {
                    return () => {
                        for (const val of Object.getOwnPropertyNames(target)) {
                            delete target[val];
                        }
                    };
                }

                if (prop === "refresh") {
                    return () => {
                        for (const val of Object.getOwnPropertyNames(target)) {
                            target[val].refresh();
                        }
                    };
                }

                // on first access, we create a WrappedValue type
                if (!target[prop]) {
                    target[prop] = new WrappedValue(prop, false, messengerInstance);
                }

                return target[prop].value;
            },
            set: (target, prop, value) => {
                if (!target[prop]) {
                    target[prop] = new WrappedValue(prop, false, messengerInstance);
                }

                target[prop].value = value;

                return true;
            }
        });
    }
}

module.exports = TemporaryMemory;