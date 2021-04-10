var $ = (function () {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var isData = function isData(value) {
    return value instanceof Data;
  };

  var ensure = function ensure(value) {
    return isData(value) ? value : new Data(value);
  };

  var get = function get(value) {
    return isData(value) ? value.get() : value;
  };

  var getAll = function getAll(datas) {
    return datas.map(function (data) {
      return data.get();
    });
  };

  var ensureAll = function ensureAll(datas) {
    return datas.map(function (data) {
      return ensure(data);
    });
  };

  var calc = function calc(fn, mutate, state) {
    var data = new Data(undefined, mutate);
    sync(function () {
      data[VALUE] = fn();
      notifySyncs(data);
    }, state);
    return data;
  };

  var syncStack = [];

  var notifySyncs = function notifySyncs(data) {
    return _toConsumableArray(data[SYNCS]).forEach(function (sync) {
      return sync();
    });
  };

  var sync = function sync(perform, suppress) {
    var deps = [];

    var clear = function clear() {
      deps.splice(0, deps.length).forEach(function (data) {
        data[SYNCS].splice(data[SYNCS].indexOf(update), 1);
      });
    };

    var update = function update() {
      if (suppress !== null && suppress !== void 0 && suppress()) return;
      clear();
      syncStack.unshift(deps);
      perform();
      syncStack.shift().forEach(function (data) {
        return data[SYNCS].push(update);
      });
    };

    update();
    return {
      cancel: clear
    };
  };

  var CHILDREN = Symbol();
  var VALUE = Symbol();
  var SYNCS = Symbol();
  var CHILD_SUPPRESS = false;

  var CHILD_SUPPRESS_FN = function CHILD_SUPPRESS_FN() {
    return CHILD_SUPPRESS;
  };

  function SET_DATA(value) {
    this[VALUE] = value;
    notifySyncs(this);
  }

  function MODIFY_DATA(modifier) {
    var result = modifier(this[VALUE]);
    this.set(this[VALUE]);
    return result;
  }

  var Data = /*#__PURE__*/function () {
    function Data(value, mutate) {
      _classCallCheck(this, Data);

      this[VALUE] = value;
      this[SYNCS] = [];
      if (!mutate) return;
      this.set = mutate;
      this.modify = MODIFY_DATA;
    }

    _createClass(Data, [{
      key: "get",
      value: function get() {
        var bind = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

        if (bind && syncStack[0] && !syncStack[0].includes(this)) {
          syncStack[0].push(this);
        }

        return this[VALUE];
      }
    }, {
      key: "to",
      value: function to(_to, opt) {
        var _this = this;

        var set = this.set && (opt === null || opt === void 0 ? void 0 : opt.from) && function (value) {
          return _this.set(opt.from(value));
        };

        return calc(function () {
          return _to(_this.get());
        }, set);
      }
    }, {
      key: "child",
      value: function child(prop) {
        var _this2 = this;

        var updateOnPropChange = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        if (isData(prop)) {
          var update = function update() {
            return _this2.child(prop.get(updateOnPropChange)).get();
          };

          var set = this.set && function (value) {
            _this2.child(prop.get(false)).set(value);
          };

          return calc(update, set, CHILD_SUPPRESS_FN);
        }

        if (!this[CHILDREN]) this[CHILDREN] = {};

        if (!this[CHILDREN][prop]) {
          var _update = function _update() {
            var _this2$get;

            return (_this2$get = _this2.get()) === null || _this2$get === void 0 ? void 0 : _this2$get[prop];
          };

          var _set = this.set && function (value) {
            var previous = CHILD_SUPPRESS;
            CHILD_SUPPRESS = true;

            _this2.modify(function (obj) {
              return obj[prop] = value;
            });

            child[VALUE] = value;
            CHILD_SUPPRESS = previous;
            notifySyncs(child);
          };

          var child = calc(_update, _set, CHILD_SUPPRESS_FN);
          this[CHILDREN][prop] = child;
        }

        return this[CHILDREN][prop];
      }
    }, {
      key: "watch",
      value: function watch(fn) {
        var _this3 = this;

        return sync(function () {
          return fn(_this3.get());
        });
      }
    }]);

    return Data;
  }();

  var create = function create(value) {
    var mutatable = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    return new Data(value, mutatable && SET_DATA);
  };

  var hamaca = Object.assign(create, {
    ensure: ensure,
    calc: calc,
    isData: isData,
    sync: sync,
    getAll: getAll,
    ensureAll: ensureAll,
    get: get
  });

  return hamaca;

}());
