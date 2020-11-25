const PermanentMemory = require("./permanent-memory");
const TemporaryMemory = require("./temporary-memory");

/**
 * Memory is a singleton that allows setting variables from multiple
 * iframe contexts
 */
class Memory {
    constructor(messengerInstance) {
        this._tempMemory = new TemporaryMemory();
        this._permMemory = new PermanentMemory();
    }

    get temp() {
        return this._tempMemory;
    }

    get perm() {
        return this._permMemory;
    }
}

module.exports = Memory;