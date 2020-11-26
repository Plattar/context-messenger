/**
 * Provides a single useful interface for performing remote function calls
 */
class RemoteInterface {
    constructor(source, origin) {
        this._source = source;
        this._origin = origin;

        if (typeof this._source.postMessage !== 'function') {
            throw new Error("RemoteInterface() provided source is invalid");
        }
    }

    get source() {
        return this._source;
    }

    get origin() {
        return this._origin;
    }

    /**
     * Returns the frameElement ID, or undefined if no frameElement exists in the source
     */
    get id() {
        return this.source.frameElement ? this.source.frameElement.id : undefined;
    }

    /**
     * Use the registered source to send data upstream/downstream
     */
    send(event, data) {
        const sendData = {
            event: event,
            data: (data || {})
        };

        this.source.postMessage(JSON.stringify(sendData), this.origin);
    }

    /**
     * Creates and returns a default RemoteInterface for the parent stack
     */
    static default() {
        const parentStack = window.parent ? ((window.frameElement && window.frameElement.nodeName == "IFRAME") ? window.parent : undefined) : undefined;

        if (parentStack) {
            return new RemoteInterface(parentStack, "*");
        }

        return undefined;
    }
}

module.exports = RemoteInterface;