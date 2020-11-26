const WrappedValue = require("./wrapped-value");

class PermanentMemory {
    constructor(messengerInstance) {
        return new Proxy(this, {
            get: (target, prop, receiver) => {
                // sets the watcher callback
                if (prop === "watch") {
                    return (variable, callback) => {
                        if (!target[variable]) {
                            target[variable] = new WrappedValue(variable, true, messengerInstance);
                        }

                        target[variable].watch = callback;
                    };
                }

                // clears everything, including specific items
                if (prop === "clear") {
                    return () => {
                        for (const pitem of Object.getOwnPropertyNames(target)) {
                            delete target[pitem];

                            localStorage.removeItem(pitem);
                        }
                    };
                }

                // clears everything, including from storage
                if (prop === "purge") {
                    return () => {
                        localStorage.clear();

                        for (const pitem of Object.getOwnPropertyNames(target)) {
                            delete target[pitem];
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
                    target[prop] = new WrappedValue(prop, true, messengerInstance);
                }

                return target[prop].value;
            },
            set: (target, prop, value) => {
                if (!target[prop]) {
                    target[prop] = new WrappedValue(prop, true, messengerInstance);
                }

                target[prop].value = value;

                return true;
            }
        });
    }
}

module.exports = PermanentMemory;