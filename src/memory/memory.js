const PermanentMemory = require("./permanent-memory");
const TemporaryMemory = require("./temporary-memory");

/**
 * Memory is a singleton that allows setting variables from multiple
 * iframe contexts
 */
class Memory {
    constructor(messengerInstance) {
        this._messenger = messengerInstance;

        this._tempMemory = new TemporaryMemory(messengerInstance);
        this._permMemory = new PermanentMemory(messengerInstance);

        this._messenger.self.__memory__set_temp_var = (name, data) => {
            this._tempMemory[name] = data;
        };

        this._messenger.self.__memory__set_perm_var = (name, data) => {
            this._permMemory[name] = data;
        };
    }

    get temp() {
        return this._tempMemory;
    }

    get perm() {
        return this._permMemory;
    }
}

module.exports = Memory;