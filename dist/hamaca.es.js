var $ = (function () {
  'use strict';

  const isData = value => value instanceof Data;
  const ensure = value => isData(value) ? value : new Data(value);
  const getAll =  datas => datas.map(data => data.get());
  const ensureAll = datas => datas.map(data => ensure(data));
  const calc = fn => {
    const data = new Data();
    sync(() => {
      data._ = fn();
      notifySyncs(data);
    });
    return data;
  };

  const syncStack = [];
  const notifySyncs = data => [...data._obs].forEach(sync => sync());
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
      sync(() => fn(this.get()));
    }
  }

  class ModifiableData extends Data {
    constructor(value) {
      super(value);
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

  const create = (value, freeze = false) =>
      freeze === true ? new Data(value) : new ModifiableData(value);
  var hamaca = Object.assign(create,
      {ensure, calc, isData, sync, getAll, ensureAll});

  return hamaca;

}());
