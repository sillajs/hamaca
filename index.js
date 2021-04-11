
const isData = value => value instanceof Data;
const ensure = (value, delegate) => isData(value) ? value : new Data(value, delegate);
const get = value => isData(value) ? value.get() : value;
const getAll =  datas => datas.map(data => data.get());
const ensureAll = datas => datas.map(data => ensure(data));
const calc = (fn, delegate, suppress) => {
  const data = new Data(undefined, delegate);
  sync(() => {
    data[VALUE] = fn();
    notifySyncs(data);
  }, suppress);
  return data;
};

const syncStack = [];
const notifySyncs = data => [...data[SYNCS]].forEach(sync => sync());
const sync = (perform, suppress) => {
  const deps = [];
  const clear = () => {
  const old = deps.splice(0, deps.length);
  old.forEach(data => {
      data[SYNCS].splice(data[SYNCS].indexOf(update), 1);
    });
  };
  const update = () => {
    if (suppress?.()) return;
    clear();
    syncStack.unshift(deps);
    perform();
    syncStack.shift().forEach(data => data[SYNCS].push(update));
  };
  update();
  return({cancel: clear});
};

const VALUE = Symbol();
const SYNCS = Symbol();
const DELEGATE = Symbol();

function SET(value) {
  this[DELEGATE].willSet?.(value, this);
  this[VALUE] = value;
  this[DELEGATE].didSet?.(value, this);
  notifySyncs(this);
}
function MODIFY(modifier) {
  const result = modifier(this[VALUE]);
  this.set(this[VALUE]);
  return result;
}

class Data {
  constructor(value, delegate = {}) {
    this[VALUE] = value;
    this[SYNCS] = [];
    this[DELEGATE] = delegate;
    if (delegate.mutable ?? true) {
      this.set = SET;
      this.modify = MODIFY
    }
    delegate.setup?.(this);
  }
  toJSON() {
    return {value: this[VALUE]};
  }
  get(bind = true) {
    if (bind && syncStack[0] && !syncStack[0].includes(this)) {
      syncStack[0].push(this);
    }
    return this[VALUE];
  }

  to(to, suppress) {
    const delegate = this[DELEGATE].convertedDelegate?.(this);
    const converted = calc(() => to(this.get()), delegate, suppress);
    this[DELEGATE].didConvert?.(this, converted);
    return converted;
  }

  watch(fn) {
    return sync(() => fn(this.get()));
  }
}

const create = (value, delegate) => new Data(value, delegate);
module.exports = Object.assign(create,
    {ensure, calc, isData, sync, getAll, ensureAll, get});