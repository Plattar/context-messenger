/**
 * WrappedValue represents a generic value type with a callback function
 * for when the value has changed
 */
class WrappedValue {
    constructor(varName, isPermanent, messengerInstance) {
        this._value = undefined;
        this._callback = undefined;
        this._isPermanent = isPermanent;
        this._varName = varName;
        this._messenger = messengerInstance;

        if (this._isPermanent) {
            this._value = JSON.parse(localStorage.getItem(this._varName));
        }
    }

    /**
     * Refresh the memory value across all memory instances recursively
     */
    refresh() {
        if (this._isPermanent) {
            // broadcast variable to all children
            this._messenger.broadcast.__memory__set_perm_var(this._varName, this._value);

            // send variable to the parent
            if (this._messenger.parent) {
                this._messenger.parent.__memory__set_perm_var(this._varName, this._value);
            }
        }
        else {
            // broadcast variable to all children
            this._messenger.broadcast.__memory__set_temp_var(this._varName, this._value);

            // send variable to the parent
            if (this._messenger.parent) {
                this._messenger.parent.__memory__set_temp_var(this._varName, this._value);
            }
        }
    }

    /**
     * Refresh this memory for a specific callable interface
     */
    refreshFor(callable) {
        // invalid interface check
        if (!this._messenger[callable]) {
            return;
        }

        if (this._isPermanent) {
            // set the variable for the specific callable
            this._messenger[callable].__memory__set_perm_var(this._varName, this._value);
        }
        else {
            // set the variable for the specific callable
            this._messenger[callable].__memory__set_temp_var(this._varName, this._value);
        }
    }

    get value() {
        if (this._isPermanent && this._value == undefined) {
            this._value = JSON.parse(localStorage.getItem(this._varName));
        }

        return this._value;
    }

    set value(newValue) {
        if (typeof newValue === "function") {
            throw new TypeError("WrappedValue.value cannot be set to a function type");
        }

        const oldValue = this._value;

        this._value = newValue;

        // for permanent variables, set the variable type
        if (this._isPermanent) {
            localStorage.setItem(this._varName, JSON.stringify(this._value));
        }

        // do not fire callback if the old and new values do not match
        if (this._callback && oldValue !== newValue) {
            // recursively update this variable across all memory
            this.refresh();

            // perform the callback that the value has just changed
            this._callback(oldValue, this._value);
        }
    }

    /**
     * Watches for any change in the current variable
     */
    set watch(newValue) {
        if (typeof newValue === "function") {
            if (newValue.length == 2) {
                this._callback = newValue;
            }
            else {
                throw new RangeError("WrappedValue.watch callback must accept exactly 2 variables. Try using WrappedValue.watch = (oldVal, newVal) => {}");
            }
        }
        else {
            throw new TypeError("WrappedValue.watch must be a type of function. Try using WrappedValue.watch = (oldVal, newVal) => {}");
        }
    }
}

module.exports = WrappedValue;