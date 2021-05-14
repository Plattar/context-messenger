/**
 * Broadcaster is used to call functions in multiple contexts at the
 * same time. This can be useful without having to handle complex logic
 * in the application side.
 * 
 * See Plattar.messenger.broadcast
 */
class Broadcaster {
    constructor(messengerInstance) {
        this._messengerInstance = messengerInstance;
        this._interfaces = [];

        return new Proxy(this, {
            get: (target, prop, receiver) => {
                switch (prop) {
                    case "_push":
                    case "_interfaces": return target[prop];
                    default:
                        break;
                }

                // execute the desired function on all available stacks
                return (...args) => {
                    const interfaces = target._interfaces;
                    const promises = [];

                    interfaces.forEach((callable) => {
                        promises.push(target._messengerInstance[callable][prop](...args));
                    });

                    return Promise.allSettled(promises);
                };
            }
        });
    }

    /**
     * Adds a new callable interface ID to the list of callables
     */
    _push(interfaceID) {
        // remove existing in case of double-up
        const index = this._interfaces.indexOf(interfaceID);

        if (index > -1) {
            this._interfaces.splice(index, 1);
        }

        this._interfaces.push(interfaceID);
    }
}

module.exports = Broadcaster;