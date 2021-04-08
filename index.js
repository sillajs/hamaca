const sync = fn => new Sync(fn).update();
const calc = fn => {
  const data = new Data(undefined);
  sync(() => data._set(fn()));
  return data;
};
const ensure = data => {
  if (data instanceof Data) return data;
  return new Data(data);
}

class Sync {
  constructor(fn) {
    this.fn = fn;
    this.deps = [];
  }
  update() {
    this.deps.splice(0, this.deps.length).forEach(data => {
      data._syncs.splice(data._syncs.indexOf(this), 1);
    });
    Sync.stack.unshift(this.deps);
    this.fn();
    Sync.stack.shift().forEach(data => data._syncs.push(this));
  }
}
Sync.stack = [];

class Data {
  constructor(data) {
    this._data = data;
    this._syncs = [];
  }
  get(sync = true) {
    if (sync && Sync.stack[0] && !Sync.stack[0].includes(this)) {
      Sync.stack[0].push(this);
    }
    return this._data;
  }
  map(fn) {
    return calc(() => fn(this.get()));
  }
  mapIf(test, fn) {
    test = ensure(test);
    return calc(() => {
      const data = this.get();
      return test.get() ? fn(data) : data;
    });
  }
  watch(fn) {
    sync(() => {
      fn(this.get());
    });
    return this;  // Allows for chaining
  }
  _set(data) {
    this._data = data;
    this._modified();
  }
  _modified() {
    [...this._syncs].forEach(sync => sync.update());
  }
}

class ModifiableData extends Data {
  constructor(data) {
    super(data)
  }
  set(data) {
    this._set(data);
  }
  modify(fn) {
    fn(this._data);
    this._modified();
  }
}

const $d = (data, freeze = false) =>
    freeze === true ? new Data(data) : new ModifiableData(data);

Object.assign($d, {
  ensure, calc, sync,
  getAll: datas => datas.map(data => data.get()),
  ensureAll: datas => datas.map(data => ensure(data)),
  isData: v => v instanceof Data
});

module.exports = $d;