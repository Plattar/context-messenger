class TemporaryMemory extends Proxy {
    constructor(memoryInstance) {
        super({}, {
            get: (target, prop, receiver) => {
                // on first access, we create a WrappedValue type
                if (!target[prop]) {
                    target[prop] = new WrappedValue();
                }

                console.log(receiver);

                return target[prop].value;
            },
            set: (target, prop, value) => {
                if (!target[prop]) {
                    target[prop] = new WrappedValue();
                }

                target[prop].value = value;

                return true;
            }
        });

        this._memory = memoryInstance;
    }
}

module.exports = TemporaryMemory;