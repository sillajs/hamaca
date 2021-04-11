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

  var ensure = function ensure(value, delegate) {
    return isData(value) ? value : new Data(value, delegate);
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

  var calc = function calc(fn, delegate, suppress) {
    var data = new Data(undefined, delegate);
    sync(function () {
      data[VALUE] = fn();
      notifySyncs(data);
    }, suppress);
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
      var old = deps.splice(0, deps.length);
      old.forEach(function (data) {
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

  var VALUE = Symbol();
  var SYNCS = Symbol();
  var DELEGATE = Symbol();

  function SET(value) {
    var _this$DELEGATE$willSe, _this$DELEGATE, _this$DELEGATE$didSet, _this$DELEGATE2;

    (_this$DELEGATE$willSe = (_this$DELEGATE = this[DELEGATE]).willSet) === null || _this$DELEGATE$willSe === void 0 ? void 0 : _this$DELEGATE$willSe.call(_this$DELEGATE, value, this);
    this[VALUE] = value;
    (_this$DELEGATE$didSet = (_this$DELEGATE2 = this[DELEGATE]).didSet) === null || _this$DELEGATE$didSet === void 0 ? void 0 : _this$DELEGATE$didSet.call(_this$DELEGATE2, value, this);
    notifySyncs(this);
  }

  function MODIFY(modifier) {
    var result = modifier(this[VALUE]);
    this.set(this[VALUE]);
    return result;
  }

  var Data = /*#__PURE__*/function () {
    function Data(value) {
      var _delegate$mutable, _delegate$setup;

      var delegate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, Data);

      this[VALUE] = value;
      this[SYNCS] = [];
      this[DELEGATE] = delegate;

      if ((_delegate$mutable = delegate.mutable) !== null && _delegate$mutable !== void 0 ? _delegate$mutable : true) {
        this.set = SET;
        this.modify = MODIFY;
      }

      (_delegate$setup = delegate.setup) === null || _delegate$setup === void 0 ? void 0 : _delegate$setup.call(delegate, this);
    }

    _createClass(Data, [{
      key: "toJSON",
      value: function toJSON() {
        return {
          value: this[VALUE]
        };
      }
    }, {
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
      value: function to(_to, suppress) {
        var _this$DELEGATE$conver,
            _this$DELEGATE3,
            _this = this,
            _this$DELEGATE$didCon,
            _this$DELEGATE4;

        var delegate = (_this$DELEGATE$conver = (_this$DELEGATE3 = this[DELEGATE]).convertedDelegate) === null || _this$DELEGATE$conver === void 0 ? void 0 : _this$DELEGATE$conver.call(_this$DELEGATE3, this);
        var converted = calc(function () {
          return _to(_this.get());
        }, delegate, suppress);
        (_this$DELEGATE$didCon = (_this$DELEGATE4 = this[DELEGATE]).didConvert) === null || _this$DELEGATE$didCon === void 0 ? void 0 : _this$DELEGATE$didCon.call(_this$DELEGATE4, this, converted);
        return converted;
      }
    }, {
      key: "watch",
      value: function watch(fn) {
        var _this2 = this;

        return sync(function () {
          return fn(_this2.get());
        });
      }
    }]);

    return Data;
  }();

  var create = function create(value, delegate) {
    return new Data(value, delegate);
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
