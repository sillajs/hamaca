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

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();

    return function _createSuperInternal() {
      var Super = _getPrototypeOf(Derived),
          result;

      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;

        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }

      return _possibleConstructorReturn(this, result);
    };
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

  var calc = function calc(fn) {
    var data = new Data();
    sync(function () {
      data._ = fn();
      notifySyncs(data);
    });
    return data;
  };

  var ensure = function ensure(data) {
    if (data instanceof Data) return data;
    return new Data(data);
  };

  var syncStack = [];

  var sync = function sync(perform, state) {
    var deps = [];

    var update = function update() {
      if (state && !state.active) return;
      deps.splice(0, deps.length).forEach(function (data) {
        data._obs.splice(data._obs.indexOf(update), 1);
      });
      syncStack.unshift(deps);
      perform();
      syncStack.shift().forEach(function (data) {
        return data._obs.push(update);
      });
    };

    update();
  };

  var notifySyncs = function notifySyncs(data) {
    _toConsumableArray(data._obs).forEach(function (sync) {
      return sync();
    });
  };

  var Data = /*#__PURE__*/function () {
    function Data(value) {
      _classCallCheck(this, Data);

      this._ = value;
      this._obs = [];
    }

    _createClass(Data, [{
      key: "get",
      value: function get() {
        var sync = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

        if (sync && syncStack[0] && !syncStack[0].includes(this)) {
          syncStack[0].push(this);
        }

        return this._;
      }
    }, {
      key: "to",
      value: function to(fn) {
        var _this = this;

        return calc(function () {
          return fn(_this.get());
        });
      }
    }, {
      key: "watch",
      value: function watch(fn) {
        var _this2 = this;

        sync(function () {
          fn(_this2.get());
        });
        return this; // Allows for chaining
      }
    }]);

    return Data;
  }();

  var ModifiableData = /*#__PURE__*/function (_Data) {
    _inherits(ModifiableData, _Data);

    var _super = _createSuper(ModifiableData);

    function ModifiableData(data) {
      _classCallCheck(this, ModifiableData);

      return _super.call(this, data);
    }

    _createClass(ModifiableData, [{
      key: "set",
      value: function set(value) {
        this._ = value;
        notifySyncs(this);
      }
    }, {
      key: "modify",
      value: function modify(fn) {
        fn(this._);
        notifySyncs(this);
      }
    }]);

    return ModifiableData;
  }(Data);

  var $d = function $d(data) {
    var freeze = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    return freeze === true ? new Data(data) : new ModifiableData(data);
  };

  Object.assign($d, {
    ensure: ensure,
    calc: calc,
    sync: sync,
    getAll: function getAll(datas) {
      return datas.map(function (data) {
        return data.get();
      });
    },
    ensureAll: function ensureAll(datas) {
      return datas.map(function (data) {
        return ensure(data);
      });
    },
    isData: function isData(v) {
      return v instanceof Data;
    }
  });
  var hamaca = $d;

  return hamaca;

}());
