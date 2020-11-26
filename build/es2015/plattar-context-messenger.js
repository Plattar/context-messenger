"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function (f) {
  if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (typeof define === "function" && define.amd) {
    define([], f);
  } else {
    var g;

    if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }

    g.Plattar = f();
  }
})(function () {
  var define, module, exports;
  return function () {
    function r(e, n, t) {
      function o(i, f) {
        if (!n[i]) {
          if (!e[i]) {
            var c = "function" == typeof require && require;
            if (!f && c) return c(i, !0);
            if (u) return u(i, !0);
            var a = new Error("Cannot find module '" + i + "'");
            throw a.code = "MODULE_NOT_FOUND", a;
          }

          var p = n[i] = {
            exports: {}
          };
          e[i][0].call(p.exports, function (r) {
            var n = e[i][1][r];
            return o(n || r);
          }, p, p.exports, r, e, n, t);
        }

        return n[i].exports;
      }

      for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) {
        o(t[i]);
      }

      return o;
    }

    return r;
  }()({
    1: [function (require, module, exports) {
      "use strict";

      var Messenger = require("./messenger/messenger.js");

      var Memory = require("./memory/memory.js"); // create our instances which we only need one each


      var messengerInstance = new Messenger(); // memory requires the messenger interface to function correctly

      var memoryInstance = new Memory(messengerInstance);
      module.exports = {
        messenger: messengerInstance,
        memory: memoryInstance
      };
    }, {
      "./memory/memory.js": 2,
      "./messenger/messenger.js": 10
    }],
    2: [function (require, module, exports) {
      var PermanentMemory = require("./permanent-memory");

      var TemporaryMemory = require("./temporary-memory");
      /**
       * Memory is a singleton that allows setting variables from multiple
       * iframe contexts
       */


      var Memory = /*#__PURE__*/function () {
        function Memory(messengerInstance) {
          var _this = this;

          _classCallCheck(this, Memory);

          this._messenger = messengerInstance;
          this._tempMemory = new TemporaryMemory(messengerInstance);
          this._permMemory = new PermanentMemory(messengerInstance);

          this._messenger.self.__memory__set_temp_var = function (name, data) {
            _this._tempMemory[name] = data;
          };

          this._messenger.self.__memory__set_perm_var = function (name, data) {
            _this._permMemory[name] = data;
          };
        }

        _createClass(Memory, [{
          key: "temp",
          get: function get() {
            return this._tempMemory;
          }
        }, {
          key: "perm",
          get: function get() {
            return this._permMemory;
          }
        }]);

        return Memory;
      }();

      module.exports = Memory;
    }, {
      "./permanent-memory": 3,
      "./temporary-memory": 4
    }],
    3: [function (require, module, exports) {
      var WrappedValue = require("./wrapped-value");

      var PermanentMemory = function PermanentMemory(messengerInstance) {
        _classCallCheck(this, PermanentMemory);

        return new Proxy(this, {
          get: function get(target, prop, receiver) {
            // sets the watcher callback
            if (prop === "watch") {
              return function (variable, callback) {
                if (!target[variable]) {
                  target[variable] = new WrappedValue(variable, true, messengerInstance);
                }

                target[variable].watch = callback;
              };
            } // clears everything, including specific items


            if (prop === "clear") {
              return function () {
                var _iterator = _createForOfIteratorHelper(Object.getOwnPropertyNames(target)),
                    _step;

                try {
                  for (_iterator.s(); !(_step = _iterator.n()).done;) {
                    var pitem = _step.value;
                    delete target[pitem];
                    localStorage.removeItem(pitem);
                  }
                } catch (err) {
                  _iterator.e(err);
                } finally {
                  _iterator.f();
                }
              };
            } // clears everything, including from storage


            if (prop === "purge") {
              return function () {
                localStorage.clear();

                var _iterator2 = _createForOfIteratorHelper(Object.getOwnPropertyNames(target)),
                    _step2;

                try {
                  for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                    var pitem = _step2.value;
                    delete target[pitem];
                  }
                } catch (err) {
                  _iterator2.e(err);
                } finally {
                  _iterator2.f();
                }
              };
            }

            if (prop === "refresh") {
              return function () {
                var _iterator3 = _createForOfIteratorHelper(Object.getOwnPropertyNames(target)),
                    _step3;

                try {
                  for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                    var val = _step3.value;
                    target[val].refresh();
                  }
                } catch (err) {
                  _iterator3.e(err);
                } finally {
                  _iterator3.f();
                }
              };
            } // on first access, we create a WrappedValue type


            if (!target[prop]) {
              target[prop] = new WrappedValue(prop, true, messengerInstance);
            }

            return target[prop].value;
          },
          set: function set(target, prop, value) {
            if (!target[prop]) {
              target[prop] = new WrappedValue(prop, true, messengerInstance);
            }

            target[prop].value = value;
            return true;
          }
        });
      };

      module.exports = PermanentMemory;
    }, {
      "./wrapped-value": 5
    }],
    4: [function (require, module, exports) {
      var WrappedValue = require("./wrapped-value");

      var TemporaryMemory = function TemporaryMemory(messengerInstance) {
        _classCallCheck(this, TemporaryMemory);

        return new Proxy(this, {
          get: function get(target, prop, receiver) {
            // sets the watcher callback
            if (prop === "watch") {
              return function (variable, callback) {
                if (!target[variable]) {
                  target[variable] = new WrappedValue(variable, false, messengerInstance);
                }

                target[variable].watch = callback;
              };
            } // clears everything
            // purge is the same thing for all temporary variables


            if (prop === "clear" || prop === "purge") {
              return function () {
                var _iterator4 = _createForOfIteratorHelper(Object.getOwnPropertyNames(target)),
                    _step4;

                try {
                  for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                    var val = _step4.value;
                    delete target[val];
                  }
                } catch (err) {
                  _iterator4.e(err);
                } finally {
                  _iterator4.f();
                }
              };
            }

            if (prop === "refresh") {
              return function () {
                var _iterator5 = _createForOfIteratorHelper(Object.getOwnPropertyNames(target)),
                    _step5;

                try {
                  for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                    var val = _step5.value;
                    target[val].refresh();
                  }
                } catch (err) {
                  _iterator5.e(err);
                } finally {
                  _iterator5.f();
                }
              };
            } // on first access, we create a WrappedValue type


            if (!target[prop]) {
              target[prop] = new WrappedValue(prop, false, messengerInstance);
            }

            return target[prop].value;
          },
          set: function set(target, prop, value) {
            if (!target[prop]) {
              target[prop] = new WrappedValue(prop, false, messengerInstance);
            }

            target[prop].value = value;
            return true;
          }
        });
      };

      module.exports = TemporaryMemory;
    }, {
      "./wrapped-value": 5
    }],
    5: [function (require, module, exports) {
      /**
       * WrappedValue represents a generic value type with a callback function
       * for when the value has changed
       */
      var WrappedValue = /*#__PURE__*/function () {
        function WrappedValue(varName, isPermanent, messengerInstance) {
          _classCallCheck(this, WrappedValue);

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


        _createClass(WrappedValue, [{
          key: "refresh",
          value: function refresh() {
            if (this._isPermanent) {
              // broadcast variable to all children
              this._messenger.broadcast.__memory__set_perm_var(this._varName, this._value); // send variable to the parent


              if (this._messenger.parent) {
                this._messenger.parent.__memory__set_perm_var(this._varName, this._value);
              }
            } else {
              // broadcast variable to all children
              this._messenger.broadcast.__memory__set_temp_var(this._varName, this._value); // send variable to the parent


              if (this._messenger.parent) {
                this._messenger.parent.__memory__set_temp_var(this._varName, this._value);
              }
            }
          }
          /**
           * Refresh this memory for a specific callable interface
           */

        }, {
          key: "refreshFor",
          value: function refreshFor(callable) {
            // invalid interface check
            if (!this._messenger[callable]) {
              return;
            }

            if (this._isPermanent) {
              // set the variable for the specific callable
              this._messenger[callable].__memory__set_perm_var(this._varName, this._value);
            } else {
              // set the variable for the specific callable
              this._messenger[callable].__memory__set_temp_var(this._varName, this._value);
            }
          }
        }, {
          key: "value",
          get: function get() {
            if (this._isPermanent && this._value == undefined) {
              this._value = JSON.parse(localStorage.getItem(this._varName));
            }

            return this._value;
          },
          set: function set(newValue) {
            if (typeof newValue === "function") {
              throw new TypeError("WrappedValue.value cannot be set to a function type");
            }

            var oldValue = this._value;
            this._value = newValue; // for permanent variables, set the variable type

            if (this._isPermanent) {
              localStorage.setItem(this._varName, JSON.stringify(this._value));
            } // do not fire callback if the old and new values do not match


            if (this._callback && oldValue !== newValue) {
              // recursively update this variable across all memory
              this.refresh(); // perform the callback that the value has just changed

              this._callback(oldValue, this._value);
            }
          }
          /**
           * Watches for any change in the current variable
           */

        }, {
          key: "watch",
          set: function set(newValue) {
            if (typeof newValue === "function") {
              if (newValue.length == 2) {
                this._callback = newValue;
              } else {
                throw new RangeError("WrappedValue.watch callback must accept exactly 2 variables. Try using WrappedValue.watch = (oldVal, newVal) => {}");
              }
            } else {
              throw new TypeError("WrappedValue.watch must be a type of function. Try using WrappedValue.watch = (oldVal, newVal) => {}");
            }
          }
        }]);

        return WrappedValue;
      }();

      module.exports = WrappedValue;
    }, {}],
    6: [function (require, module, exports) {
      /**
       * Broadcaster is used to call functions in multiple contexts at the
       * same time. This can be useful without having to handle complex logic
       * in the application side.
       * 
       * See Plattar.messenger.broadcast
       */
      var Broadcaster = /*#__PURE__*/function () {
        function Broadcaster(messengerInstance) {
          _classCallCheck(this, Broadcaster);

          this._messengerInstance = messengerInstance;
          this._interfaces = [];
          return new Proxy(this, {
            get: function get(target, prop, receiver) {
              switch (prop) {
                case "_push":
                case "_interfaces":
                  return target[prop];

                default:
                  break;
              } // execute the desired function on all available stacks


              return function () {
                for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                  args[_key] = arguments[_key];
                }

                var interfaces = target._interfaces;
                var promises = [];
                interfaces.forEach(function (callable) {
                  var _target$_messengerIns;

                  promises.push((_target$_messengerIns = target._messengerInstance[callable])[prop].apply(_target$_messengerIns, args));
                });
                return Promise.allSettled(promises);
              };
            }
          });
        }
        /**
         * Adds a new callable interface ID to the list of callables
         */


        _createClass(Broadcaster, [{
          key: "_push",
          value: function _push(interfaceID) {
            this._interfaces.push(interfaceID);
          }
        }]);

        return Broadcaster;
      }();

      module.exports = Broadcaster;
    }, {}],
    7: [function (require, module, exports) {
      var WrappedFunction = require("./wrapped-local-function");

      var CurrentFunctionList = function CurrentFunctionList() {
        _classCallCheck(this, CurrentFunctionList);

        return new Proxy(this, {
          get: function get(target, prop, receiver) {
            // sets the watcher callback
            if (prop === "watch") {
              return function (variable, callback) {
                if (!target[variable]) {
                  target[variable] = new WrappedFunction(variable);
                }

                target[variable].watch = callback;
              };
            } // clears everything, including specific items


            if (prop === "clear" || prop === "purge") {
              return function () {
                var _iterator6 = _createForOfIteratorHelper(Object.getOwnPropertyNames(target)),
                    _step6;

                try {
                  for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
                    var pitem = _step6.value;
                    delete target[pitem];
                  }
                } catch (err) {
                  _iterator6.e(err);
                } finally {
                  _iterator6.f();
                }
              };
            } // on first access, we create a WrappedValue type


            if (!target[prop]) {
              target[prop] = new WrappedFunction(prop);
            } // return an anonymous function that executes for this variable


            return function () {
              var _target$prop;

              return (_target$prop = target[prop]).exec.apply(_target$prop, arguments);
            };
          },
          set: function set(target, prop, value) {
            if (!target[prop]) {
              target[prop] = new WrappedFunction(prop);
            }

            target[prop].value = value;
            return true;
          }
        });
      };

      module.exports = CurrentFunctionList;
    }, {
      "./wrapped-local-function": 8
    }],
    8: [function (require, module, exports) {
      var Util = require("../util/util.js");
      /**
       * WrappedLocalFunction represents a container that holds and maintains a specific function
       * that was defined in the current web context. It can also be executed by other web contexts
       * using the Messenger framework.
       */


      var WrappedLocalFunction = /*#__PURE__*/function () {
        function WrappedLocalFunction(funcName) {
          _classCallCheck(this, WrappedLocalFunction);

          this._value = undefined;
          this._callback = undefined;
          this._funcName = funcName;
        }
        /**
         * executes the internally stored function with the provided arguments
         */


        _createClass(WrappedLocalFunction, [{
          key: "_execute",
          value: function _execute() {
            for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
              args[_key2] = arguments[_key2];
            }

            var rData = this._value.apply(this, args);

            if (this._callback) {
              this._callback.apply(this, [rData].concat(args));
            }

            return rData;
          }
          /**
           * Executes the internal function in a Promise chain. Results of the execution
           * will be evaluated in the promise chain itself
           */

        }, {
          key: "exec",
          value: function exec() {
            var _this2 = this;

            for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
              args[_key3] = arguments[_key3];
            }

            return new Promise(function (accept, reject) {
              if (!_this2._value) {
                return reject(new Error("WrappedLocalFunction.exec() function with name " + _this2._funcName + "() is not defined"));
              }

              try {
                // otherwise execute the function
                var rObject = _this2._execute.apply(_this2, args); // we need to check if the returned object is a Promise, if so, handle it
                // differently. This can happen if the function wants to execute asyn


                if (Util.isPromise(rObject)) {
                  rObject.then(function (res) {
                    return accept(res);
                  })["catch"](function (err) {
                    return reject(err);
                  });
                } else {
                  // otherwise, its a non async object so just execute and return the results
                  return accept(rObject);
                }
              } catch (e) {
                return reject(e);
              }
            });
          }
          /**
           * Stores a function for later execution
           */

        }, {
          key: "value",
          set: function set(newValue) {
            if (typeof newValue !== "function") {
              throw new TypeError("WrappedLocalFunction.value must be a function. To store values use Plattar.memory");
            }

            this._value = newValue;
          }
          /**
           * Watches for when this function is executed by some context
           */

        }, {
          key: "watch",
          set: function set(newValue) {
            if (typeof newValue === "function") {
              this._callback = newValue;
            } else {
              throw new TypeError("WrappedLocalFunction.watch must be a type of function. Try using WrappedLocalFunction.watch = (rData, ...args) => {}");
            }
          }
        }]);

        return WrappedLocalFunction;
      }();

      module.exports = WrappedLocalFunction;
    }, {
      "../util/util.js": 14
    }],
    9: [function (require, module, exports) {
      var RemoteInterface = require("./remote-interface.js");
      /**
       * This is a singleton class that handles events on a global basis. Allows
       * registering local event listeners etc..
       */


      var GlobalEventHandler = /*#__PURE__*/function () {
        function GlobalEventHandler() {
          var _this3 = this;

          _classCallCheck(this, GlobalEventHandler);

          this._eventListeners = {}; // global handler that forwards events to their respectful places
          // throughout the framework

          window.addEventListener("message", function (evt) {
            var data = evt.data;
            var jsonData = undefined;

            try {
              jsonData = JSON.parse(data);
            } catch (e) {
              // catch does nothing
              // this event might not be what we are looking for
              jsonData = undefined;
            } // make sure the event is properly formatted


            if (jsonData && jsonData.event && jsonData.data) {
              // see if there are any listeners for this
              if (_this3._eventListeners[jsonData.event]) {
                var remoteInterface = new RemoteInterface(evt.source, evt.origin); // loop through and call all the event handlers

                _this3._eventListeners[jsonData.event].forEach(function (callback) {
                  try {
                    callback(remoteInterface, jsonData.data);
                  } catch (e) {
                    console.error("GlobalEventHandler.message() error occured during callback ");
                    console.error(e);
                  }
                });
              }
            }
          });
        }

        _createClass(GlobalEventHandler, [{
          key: "listen",
          value: function listen(event, callback) {
            if (typeof callback !== "function") {
              throw new TypeError("GlobalEventHandler.listen(event, callback) callback must be a type of function.");
            }

            if (!this._eventListeners[event]) {
              this._eventListeners[event] = [];
            }

            this._eventListeners[event].push(callback);
          }
        }]);

        return GlobalEventHandler;
      }();

      GlobalEventHandler.instance = function () {
        if (!GlobalEventHandler._default) {
          GlobalEventHandler._default = new GlobalEventHandler();
        }

        return GlobalEventHandler._default;
      };

      module.exports = GlobalEventHandler;
    }, {
      "./remote-interface.js": 11
    }],
    10: [function (require, module, exports) {
      var CurrentFunctionList = require("./current/current-function-list");

      var RemoteInterface = require("./remote-interface");

      var RemoteFunctionList = require("./remote/remote-function-list");

      var Util = require("./util/util.js");

      var GlobalEventHandler = require("./global-event-handler.js");

      var Broadcaster = require("./broadcaster.js");
      /**
       * Messenger is a singleton that allows calling functions in multiple
       * contexts
       */


      var Messenger = /*#__PURE__*/function () {
        function Messenger() {
          _classCallCheck(this, Messenger);

          // generate a unique id for this instance of the messenger
          this._id = Util.id(); // ensure the parent stack does not target itself

          this._parentStack = RemoteInterface["default"](); // allow adding local functions immedietly

          this._currentFunctionList = new CurrentFunctionList(); // allows calling functions on everything

          this._broadcaster = new Broadcaster(this); // we still need to confirm if a parent exists and has the messenger
          // framework added.. see _setup() function

          this._parentFunctionList = undefined; // these are the pre-registered available child objects

          this._callableList = [];

          this._setup();

          return new Proxy(this, {
            get: function get(target, prop, receiver) {
              // sets the watcher callback
              if (prop === "onload") {
                return function (variable, callback) {
                  if (variable === "self" || variable === "id") {
                    return callback();
                  }

                  if (!target[variable]) {
                    target[variable] = new RemoteFunctionList(variable);
                  }

                  target[variable].onload(callback);
                };
              }

              switch (prop) {
                case "id":
                  return target._id;

                case "self":
                  return target._currentFunctionList;

                case "broadcast":
                  return target._broadcaster;

                case "_setup":
                case "_registerListeners":
                case "_id":
                case "_broadcaster":
                case "_parentStack":
                  return target[prop];

                default:
                  break;
              }

              var targetVar = target[prop]; // return undefined if target variable doesn't exist
              // or it has not been verified yet

              if (!targetVar || !targetVar.isValid()) {
                return undefined;
              }

              return target[prop];
            }
          });
        }
        /**
         * Internal function call to initialise the messenger framework
         */


        _createClass(Messenger, [{
          key: "_setup",
          value: function _setup() {
            this._registerListeners(); // if a parent exists, send a message calling for an initialisation


            if (this._parentStack) {
              this._parentStack.send("__messenger__child_init");
            } else {
              console.warn("Messenger[" + this._id + "] does not have a parent. Plattar.messenger.parent will be undefined");
            }
          }
          /**
           * Register all critical listener interfaces so the framework can function correctly
           */

        }, {
          key: "_registerListeners",
          value: function _registerListeners() {
            var _this4 = this;

            GlobalEventHandler.instance().listen("__messenger__child_init", function (src, data) {
              var iframeID = src.id; // check reserved key list

              switch (iframeID) {
                case undefined:
                  throw new Error("Messenger[" + _this4._id + "].setup() Component ID cannot be undefined");

                case "self":
                  throw new Error("Messenger[" + _this4._id + "].setup() Component ID of \"self\" cannot be used as the keyword is reserved");

                case "parent":
                  throw new Error("Messenger[" + _this4._id + "].setup() Component ID of \"parent\" cannot be used as the keyword is reserved");

                case "id":
                  throw new Error("Messenger[" + _this4._id + "].setup() Component ID of \"id\" cannot be used as the keyword is reserved");

                case "onload":
                  throw new Error("Messenger[" + _this4._id + "].setup() Component ID of \"onload\" cannot be used as the keyword is reserved");

                default:
                  break;
              } // initialise the child iframe as a messenger pipe


              if (!_this4[iframeID]) {
                _this4[iframeID] = new RemoteFunctionList(iframeID);
              }

              _this4[iframeID].setup(new RemoteInterface(src.source, src.origin)); // add the interface to the broadcaster


              _this4._broadcaster._push(iframeID);

              src.send("__messenger__parent_init");
            });
            GlobalEventHandler.instance().listen("__messenger__parent_init", function (src, data) {
              if (!_this4["parent"]) {
                _this4["parent"] = new RemoteFunctionList("parent");
              }

              _this4["parent"].setup(new RemoteInterface(src.source, src.origin));
            }); // this listener will fire remotely to execute a function in the current
            // context

            GlobalEventHandler.instance().listen("__messenger__exec_fnc", function (src, data) {
              var _Plattar$messenger$se;

              var instanceID = data.instance_id;
              var args = data.function_args;
              var fname = data.function_name; // using JS reflection, execute the local function

              (_Plattar$messenger$se = Plattar.messenger.self)[fname].apply(_Plattar$messenger$se, _toConsumableArray(args)).then(function (res) {
                src.send("__messenger__exec_fnc_result", {
                  function_status: "success",
                  function_name: fname,
                  function_args: res,
                  instance_id: instanceID
                });
              })["catch"](function (err) {
                src.send("__messenger__exec_fnc_result", {
                  function_status: "error",
                  function_name: fname,
                  function_args: err.message,
                  instance_id: instanceID
                });
              });
            });
          }
        }]);

        return Messenger;
      }();

      module.exports = Messenger;
    }, {
      "./broadcaster.js": 6,
      "./current/current-function-list": 7,
      "./global-event-handler.js": 9,
      "./remote-interface": 11,
      "./remote/remote-function-list": 12,
      "./util/util.js": 14
    }],
    11: [function (require, module, exports) {
      /**
       * Provides a single useful interface for performing remote function calls
       */
      var RemoteInterface = /*#__PURE__*/function () {
        function RemoteInterface(source, origin) {
          _classCallCheck(this, RemoteInterface);

          this._source = source;
          this._origin = origin;

          if (typeof this._source.postMessage !== 'function') {
            throw new Error("RemoteInterface() provided source is invalid");
          }
        }

        _createClass(RemoteInterface, [{
          key: "send",

          /**
           * Use the registered source to send data upstream/downstream
           */
          value: function send(event, data) {
            var sendData = {
              event: event,
              data: data || {}
            };
            this.source.postMessage(JSON.stringify(sendData), this.origin);
          }
          /**
           * Creates and returns a default RemoteInterface for the parent stack
           */

        }, {
          key: "source",
          get: function get() {
            return this._source;
          }
        }, {
          key: "origin",
          get: function get() {
            return this._origin;
          }
          /**
           * Returns the frameElement ID, or undefined if no frameElement exists in the source
           */

        }, {
          key: "id",
          get: function get() {
            return this.source.frameElement ? this.source.frameElement.id : undefined;
          }
        }], [{
          key: "default",
          value: function _default() {
            var parentStack = window.parent ? window.frameElement && window.frameElement.nodeName == "IFRAME" ? window.parent : undefined : undefined;

            if (parentStack) {
              return new RemoteInterface(parentStack, "*");
            }

            return undefined;
          }
        }]);

        return RemoteInterface;
      }();

      module.exports = RemoteInterface;
    }, {}],
    12: [function (require, module, exports) {
      var WrappedFunction = require("./wrapped-remote-function");

      var RemoteFunctionList = /*#__PURE__*/function () {
        function RemoteFunctionList(remoteName) {
          _classCallCheck(this, RemoteFunctionList);

          this._remoteInterface = undefined;
          this._callback = undefined;
          this._remoteName = remoteName;
          return new Proxy(this, {
            get: function get(target, prop, receiver) {
              // sets the watcher callback
              if (prop === "watch") {
                throw new Error("RemoteFunctionList.watch cannot watch execution of remote functions from current context. Did you mean to use Plattar.messenger.self instead?");
              } // clears everything, including specific items


              if (prop === "clear") {
                throw new Error("RemoteFunctionList.clear cannot clear/remove remote functions from current context. Did you mean to use Plattar.messenger.self.clear() instead?");
              } // clears everything, including specific items


              if (prop === "purge") {
                throw new Error("RemoteFunctionList.purge cannot clear/remove remote functions from current context. Did you mean to use Plattar.messenger.self.purge() instead?");
              } // pre-defined functions for this object. Don't block access to these.


              switch (prop) {
                case "setup":
                case "isValid":
                case "onload":
                case "_remoteInterface":
                case "_callback":
                case "name":
                case "_remoteName":
                  return target[prop];

                default:
                  break;
              } // on first access, we create a WrappedValue type


              if (!target[prop]) {
                target[prop] = new WrappedFunction(prop, target._remoteInterface);
              } // return an anonymous function that executes for this variable


              return function () {
                var _target$prop2;

                return (_target$prop2 = target[prop]).exec.apply(_target$prop2, arguments);
              };
            },
            set: function set(target, prop, value) {
              if (prop === "_remoteInterface" || prop === "_callback") {
                target[prop] = value;
                return true;
              }

              throw new Error("RemoteFunctionList.set cannot add a remote function from current context. Use Plattar.messenger.self instead");
            }
          });
        }

        _createClass(RemoteFunctionList, [{
          key: "setup",
          value: function setup(remoteInterface) {
            if (typeof remoteInterface.send !== 'function') {
              throw new Error("RemoteFunctionList.setup() provided invalid interface");
            }

            this._remoteInterface = remoteInterface;

            if (this._callback) {
              this._callback();
            }
          }
        }, {
          key: "isValid",
          value: function isValid() {
            return this._remoteInterface != undefined;
          }
        }, {
          key: "onload",
          value: function onload(callback) {
            this._callback = callback;

            if (this.isValid()) {
              this._callback();
            }
          }
        }, {
          key: "name",
          get: function get() {
            return this._remoteName;
          }
        }]);

        return RemoteFunctionList;
      }();

      module.exports = RemoteFunctionList;
    }, {
      "./wrapped-remote-function": 13
    }],
    13: [function (require, module, exports) {
      var Util = require("../util/util.js");

      var GlobalEventHandler = require("../global-event-handler.js");
      /**
       * WrappedRemoteFunction represents a container that holds and maintains a specific function
       * that can be called by any context. This particular container executes and handles remote 
       * function calls.
       */


      var WrappedRemoteFunction = /*#__PURE__*/function () {
        function WrappedRemoteFunction(funcName, remoteInterface) {
          var _this5 = this;

          _classCallCheck(this, WrappedRemoteFunction);

          this._funcName = funcName;
          this._remoteInterface = remoteInterface;
          this._callInstances = {}; // listen for function execution results

          GlobalEventHandler.instance().listen("__messenger__exec_fnc_result", function (src, data) {
            var instanceID = data.instance_id; // the function name must match

            if (data.function_name !== _this5._funcName) {
              return;
            } // the instance ID must be found, otherwise this is a rogue execution
            // that can be ignored (should not happen)


            if (!_this5._callInstances[instanceID]) {
              return;
            }

            var promise = _this5._callInstances[instanceID]; // remove the old instance

            delete _this5._callInstances[instanceID]; // perform the promise callbacks

            if (data.function_status === "success") {
              promise.accept(data.function_args);
            } else {
              promise.reject(new Error(data.function_args));
            }
          });
        }
        /**
         * Executes a remote function that lays outside of the current context
         */


        _createClass(WrappedRemoteFunction, [{
          key: "exec",
          value: function exec() {
            var _this6 = this;

            for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
              args[_key4] = arguments[_key4];
            }

            var instanceID = Util.id(); // ensure this instance ID has not been added previously
            // NOTE: This should not ever be executed as all instance ID's are unique
            // If this executes then the PRNG scheme needs to be swapped

            if (this._callInstances[instanceID]) {
              return new Promise(function (accept, reject) {
                return reject(new Error("WrappedRemoteFunction.exec() cannot execute function. System generated duplicate Instance ID. PRNG needs checking"));
              });
            } // add this call as a unique instance and save the Promise
            // to be executed later


            return new Promise(function (accept, reject) {
              // save this promise to be executed later
              _this6._callInstances[instanceID] = {
                accept: accept,
                reject: reject
              }; // execute this event in another context

              _this6._remoteInterface.send("__messenger__exec_fnc", {
                instance_id: instanceID,
                function_name: _this6._funcName,
                function_args: args
              });
            });
          }
        }]);

        return WrappedRemoteFunction;
      }();

      module.exports = WrappedRemoteFunction;
    }, {
      "../global-event-handler.js": 9,
      "../util/util.js": 14
    }],
    14: [function (require, module, exports) {
      var Util = /*#__PURE__*/function () {
        function Util() {
          _classCallCheck(this, Util);
        }

        _createClass(Util, null, [{
          key: "id",

          /**
           * generate a quick, random ID thats useful for message digests and class checks
           */
          value: function id() {
            return Math.abs(Math.floor(Math.random() * 10000000000000));
          }
          /**
           * checks if the provided object is a type of Promise object
           */

        }, {
          key: "isPromise",
          value: function isPromise(obj) {
            return !!obj && (_typeof(obj) === "object" || typeof obj === "function") && typeof obj.then === "function";
          }
        }]);

        return Util;
      }();

      module.exports = Util;
    }, {}]
  }, {}, [1])(1);
});

