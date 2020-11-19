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

      var Memory = require("./memory/memory.js");

      module.exports = {
        Memory: Memory
      };
    }, {
      "./memory/memory.js": 2
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

          this._callback = function (oldVal, newVal) {};

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
    }, {}]
  }, {}, [1])(1);
});

