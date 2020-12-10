"use strict";
const Messenger = require("./messenger/messenger.js");
const Memory = require("./memory/memory.js");
const GlobalEventHandler = require("./messenger/global-event-handler.js");

// create our instances which we only need one each
const messengerInstance = new Messenger();

// memory requires the messenger interface to function correctly
const memoryInstance = new Memory(messengerInstance);

GlobalEventHandler.instance().messengerInstance = messengerInstance;
GlobalEventHandler.instance().memoryInstance = memoryInstance;

module.exports = {
    messenger: messengerInstance,
    memory: memoryInstance
}