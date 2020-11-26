"use strict";
const Messenger = require("./messenger/messenger.js");
const Memory = require("./memory/memory.js");

// create our instances which we only need one each
const messengerInstance = new Messenger();

// memory requires the messenger interface to function correctly
const memoryInstance = new Memory(messengerInstance);

module.exports = {
    messenger: messengerInstance,
    memory: memoryInstance
}