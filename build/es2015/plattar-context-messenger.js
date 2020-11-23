"use strict";

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

      var messenger = require("./messenger/messenger.js");

      var memory = require("./memory/memory.js");

      module.exports = {
        messenger: messenger,
        memory: memory
      };
    }, {
      "./memory/memory.js": 2,
      "./messenger/messenger.js": 8
    }],
    2: [function (require, module, exports) {
      var PermanentMemory = require("./permanent-memory");

      var TemporaryMemory = require("./temporary-memory");
      /**
       * Memory is a singleton that allows setting variables from multiple
       * iframe contexts
       */


      var Memory = /*#__PURE__*/function () {
        function Memory() {
          _classCallCheck(this, Memory);

          this._tempMemory = new TemporaryMemory();
          this._permMemory = new PermanentMemory();
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

      module.exports = new Memory();
    }, {
      "./permanent-memory": 3,
      "./temporary-memory": 4
    }],
    3: [function (require, module, exports) {
      var WrappedValue = require("./wrapped-value");

      var PermanentMemory = function PermanentMemory() {
        _classCallCheck(this, PermanentMemory);

        return new Proxy({}, {
          get: function get(target, prop, receiver) {
            // sets the watcher callback
            if (prop === "watch") {
              return function (variable, callback) {
                if (!target[variable]) {
                  target[variable] = new WrappedValue(variable, true);
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
                    var _prop = _step2.value;
                    delete target[_prop];
                  }
                } catch (err) {
                  _iterator2.e(err);
                } finally {
                  _iterator2.f();
                }
              };
            } // on first access, we create a WrappedValue type


            if (!target[prop]) {
              target[prop] = new WrappedValue(prop, true);
            }

            return target[prop].value;
          },
          set: function set(target, prop, value) {
            if (!target[prop]) {
              target[prop] = new WrappedValue(prop, true);
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

      var TemporaryMemory = function TemporaryMemory() {
        _classCallCheck(this, TemporaryMemory);

        return new Proxy({}, {
          get: function get(target, prop, receiver) {
            // sets the watcher callback
            if (prop === "watch") {
              return function (variable, callback) {
                if (!target[variable]) {
                  target[variable] = new WrappedValue(variable, false);
                }

                target[variable].watch = callback;
              };
            } // clears everything
            // purge is the same thing for all temporary variables


            if (prop === "clear" || prop === "purge") {
              return function () {
                var _iterator3 = _createForOfIteratorHelper(Object.getOwnPropertyNames(target)),
                    _step3;

                try {
                  for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                    var _prop2 = _step3.value;
                    delete target[_prop2];
                  }
                } catch (err) {
                  _iterator3.e(err);
                } finally {
                  _iterator3.f();
                }
              };
            } // on first access, we create a WrappedValue type


            if (!target[prop]) {
              target[prop] = new WrappedValue(prop, false);
            }

            return target[prop].value;
          },
          set: function set(target, prop, value) {
            if (!target[prop]) {
              target[prop] = new WrappedValue(prop, false);
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
        function WrappedValue(varName, isPermanent) {
          _classCallCheck(this, WrappedValue);

          this._value = undefined;
          this._callback = undefined;
          this._isPermanent = isPermanent;
          this._varName = varName;

          if (this._isPermanent) {
            this._value = JSON.parse(localStorage.getItem(this._varName));
          }
        }

        _createClass(WrappedValue, [{
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
              // perform the callback that the value has just changed
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
      var WrappedFunction = require("./wrapped-local-function");

      var CurrentFunctionList = function CurrentFunctionList() {
        _classCallCheck(this, CurrentFunctionList);

        return new Proxy({}, {
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
                var _iterator4 = _createForOfIteratorHelper(Object.getOwnPropertyNames(target)),
                    _step4;

                try {
                  for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                    var pitem = _step4.value;
                    delete target[pitem];
                  }
                } catch (err) {
                  _iterator4.e(err);
                } finally {
                  _iterator4.f();
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
      "./wrapped-local-function": 7
    }],
    7: [function (require, module, exports) {
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
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
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
            var _this = this;

            for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
              args[_key2] = arguments[_key2];
            }

            return new Promise(function (accept, reject) {
              if (!_this._value) {
                return reject(new Error("WrappedLocalFunction.exec() function with name " + _this._funcName + "() is not defined"));
              }

              try {
                // otherwise execute the function
                return accept(_this._execute.apply(_this, args));
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
    }, {}],
    8: [function (require, module, exports) {
      var CurrentFunctionList = require("./current/current-function-list");

      var RemoteFunctionList = require("./remote/remote-function-list");
      /**
       * Messenger is a singleton that allows calling functions in multiple
       * contexts
       */


      var Messenger = /*#__PURE__*/function () {
        function Messenger() {
          _classCallCheck(this, Messenger);

          this._parentStack = window.parent ? window.parent : undefined; // allow adding local functions immedietly

          this._currentFunctionList = new CurrentFunctionList(); // we still need to confirm if a parent exists and has the messenger
          // framework added.. see _setup() function

          this._parentFunctionList = undefined;

          this._setup();
        }
        /**
         * Internal function call to initialise the messenger framework
         */


        _createClass(Messenger, [{
          key: "_setup",
          value: function _setup() {
            var _this2 = this;

            // if this message is recieved, then let the messenger know to
            // initialise the child object
            window.addEventListener("message", function (evt) {
              var data = evt.data;

              if (data === "__messenger__parent_init") {
                evt.source.postMessage("__messenger__child_init", evt.origin || "*");
              } else if (data === "__messenger__child_init") {
                _this2._parentFunctionList = new RemoteFunctionList(_this2._parentStack);
              }
            }); // if a parent exists, send a message calling for an initialisation

            if (this._parentStack) {
              this._parentStack.postMessage("__messenger__parent_init", "*");
            }
          }
          /**
           * Allows calling functions on the parent stack. Use this if you
           * are inside the iframe and want to call functions on the parent page.
           */

        }, {
          key: "parent",
          get: function get() {
            return this._parentFunctionList;
          }
          /**
           * The current stack is the current context. This is primarily used to
           * define functions that exist on the current stack.
           */

        }, {
          key: "self",
          get: function get() {
            return this._currentFunctionList;
          }
        }]);

        return Messenger;
      }();

      module.exports = new Messenger();
    }, {
      "./current/current-function-list": 6,
      "./remote/remote-function-list": 9
    }],
    9: [function (require, module, exports) {
      var WrappedFunction = require("./wrapped-remote-function");

      var RemoteFunctionList = function RemoteFunctionList() {
        _classCallCheck(this, RemoteFunctionList);

        return new Proxy({}, {
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
            } // on first access, we create a WrappedValue type


            if (!target[prop]) {
              target[prop] = new WrappedFunction(prop);
            } // return an anonymous function that executes for this variable


            return function () {
              var _target$prop2;

              return (_target$prop2 = target[prop]).exec.apply(_target$prop2, arguments);
            };
          },
          set: function set(target, prop, value) {
            throw new Error("RemoteFunctionList.set cannot add a remote function from current context. Use Plattar.messenger.self instead");
          }
        });
      };

      module.exports = RemoteFunctionList;
    }, {
      "./wrapped-remote-function": 10
    }],
    10: [function (require, module, exports) {
      /**
       * WrappedRemoteFunction represents a container that holds and maintains a specific function
       * that can be called by any context. This particular container executes and handles remote 
       * function calls.
       */
      var WrappedRemoteFunction = function WrappedRemoteFunction() {
        _classCallCheck(this, WrappedRemoteFunction);
      };

      module.exports = WrappedRemoteFunction;
    }, {}]
  }, {}, [1])(1);
});

