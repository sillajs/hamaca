const calc = fn => {
  const data = new Data();
  sync(() => {
    data._ = fn();
    notifySyncs(data);
  });
  return data;
};
const ensure = data => {
  if (data instanceof Data) return data;
  return new Data(data);
}

const syncStack = [];

const sync = (perform, state) => {
  const deps = [];
  const update = () => {
    if (state && !state.active) return;
    deps.splice(0, deps.length).forEach(data => {
      data._obs.splice(data._obs.indexOf(update), 1);
    });
    syncStack.unshift(deps);
    perform();
    syncStack.shift().forEach(data => data._obs.push(update));
  };
  update();
};

const notifySyncs = data => {
  [...data._obs].forEach(sync => sync());
};


class Data {
  constructor(value) {
    this._ = value;
    this._obs = [];
  }
  get(sync = true) {
    if (sync && syncStack[0] && !syncStack[0].includes(this)) {
      syncStack[0].push(this);
    }
    return this._;
  }
  to(fn) {
    return calc(() => fn(this.get()));
  }
  watch(fn) {
    sync(() => {
      fn(this.get());
    });
  }
}

class ModifiableData extends Data {
  constructor(value) {
    super(value)
  }
  set(value) {
    this._ = value;
    notifySyncs(this);
  }
  modify(fn) {
    fn(this._);
    notifySyncs(this);
  }
}

const $ = (data, freeze = false) =>
    freeze === true ? new Data(data) : new ModifiableData(data);

Object.assign($, {
  ensure, calc, sync,
  getAll: datas => datas.map(data => data.get()),
  ensureAll: datas => datas.map(data => ensure(data)),
  isData: v => v instanceof Data
});

module.exports = $;