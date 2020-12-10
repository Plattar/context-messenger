const RemoteInterface = require("./remote-interface.js");

/**
 * This is a singleton class that handles events on a global basis. Allows
 * registering local event listeners etc..
 */
class GlobalEventHandler {
    constructor() {
        this._eventListeners = {};

        // global handler that forwards events to their respectful places
        // throughout the framework
        window.addEventListener("message", (evt) => {
            const data = evt.data;
            let jsonData = undefined;

            try {
                jsonData = JSON.parse(data);
            }
            catch (e) {
                // catch does nothing
                // this event might not be what we are looking for
                jsonData = undefined;
            }

            // make sure the event is properly formatted
            if (jsonData && jsonData.event && jsonData.data) {
                // see if there are any listeners for this
                if (this._eventListeners[jsonData.event]) {
                    const remoteInterface = new RemoteInterface(evt.source, evt.origin);

                    // loop through and call all the event handlers
                    this._eventListeners[jsonData.event].forEach((callback) => {
                        try {
                            callback(remoteInterface, jsonData.data);
                        }
                        catch (e) {
                            console.error("GlobalEventHandler.message() error occured during callback ");
                            console.error(e);
                        }
                    });
                }
            }
        });
    }

    set messengerInstance(value) {
        this._messenger = value;
    }

    set memoryInstance(value) {
        this._memory = value;
    }

    get messengerInstance() {
        return this._messenger;
    }

    get memoryInstance() {
        return this._memory;
    }

    listen(event, callback) {
        if (typeof callback !== "function") {
            throw new TypeError("GlobalEventHandler.listen(event, callback) callback must be a type of function.");
        }

        if (!this._eventListeners[event]) {
            this._eventListeners[event] = [];
        }

        this._eventListeners[event].push(callback);
    }
}

GlobalEventHandler.instance = () => {
    if (!GlobalEventHandler._default) {
        GlobalEventHandler._default = new GlobalEventHandler();
    }

    return GlobalEventHandler._default;
};

module.exports = GlobalEventHandler;