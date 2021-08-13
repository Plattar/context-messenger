"use strict";
const Messenger = require("./messenger/messenger.js");
const Memory = require("./memory/memory.js");
const GlobalEventHandler = require("./messenger/global-event-handler.js");
const Version = require("./version");

// re-create a new messenger instance if it does not exist
if (!GlobalEventHandler.instance().messengerInstance) {
    // create our instances which we only need one each
    const messengerInstance = new Messenger();

    // memory requires the messenger interface to function correctly
    const memoryInstance = new Memory(messengerInstance);

    GlobalEventHandler.instance().messengerInstance = messengerInstance;
    GlobalEventHandler.instance().memoryInstance = memoryInstance;
}

// re-create a new memory instance if it does not exist
if (!GlobalEventHandler.instance().memoryInstance) {
    // memory requires the messenger interface to function correctly
    const memoryInstance = new Memory(GlobalEventHandler.instance().messengerInstance);

    GlobalEventHandler.instance().memoryInstance = memoryInstance;
}

console.log("using @plattar/context-messenger v" + Version);

module.exports = {
    messenger: GlobalEventHandler.instance().messengerInstance,
    memory: GlobalEventHandler.instance().memoryInstance,
    version: Version
}