class TemporaryMemory extends Proxy {
    constructor(memoryInstance) {
        super({}, {
            get: (target, prop, receiver) => {
                return Reflect.get(...arguments);
            },
            set: (obj, prop, value) => {
                obj[prop] = value;

                return true;
            }
        });

        this._memory = memoryInstance;
    }
}

module.exports = TemporaryMemory;