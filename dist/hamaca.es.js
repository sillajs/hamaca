var $ = (function () {
  'use strict';

  const isData = value => value instanceof Data;
  const ensure = value => isData(value) ? value : new Data(value);
  const get = value => isData(value) ? value.get() : value;
  const getAll =  datas => datas.map(data => data.get());
  const ensureAll = datas => datas.map(data => ensure(data));
  const calc = (fn, mutate, state) => {
    const data = new Data(undefined, mutate);
    sync(() => {
      data[VALUE] = fn();
      notifySyncs(data);
    }, state);
    return data;
  };

  const syncStack = [];
  const notifySyncs = data => [...data[SYNCS]].forEach(sync => sync());
  const sync = (perform, suppress) => {
    const deps = [];
    const clear = () => {
      deps.splice(0, deps.length).forEach(data => {
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

  const CHILDREN = Symbol();
  const VALUE = Symbol();
  const SYNCS = Symbol();
  let CHILD_SUPPRESS = false;
  const CHILD_SUPPRESS_FN = () => CHILD_SUPPRESS;
  function SET_DATA(value) {
    this[VALUE] = value;
    notifySyncs(this);
  }
  function MODIFY_DATA(modifier) {
    const result = modifier(this[VALUE]);
    this.set(this[VALUE]);
    return result;
  }
  class Data {
    constructor(value, mutate) {
      this[VALUE] = value;
      this[SYNCS] = [];
      if (!mutate) return;
      this.set = mutate;
      this.modify = MODIFY_DATA;
    }
    get(bind = true) {
      if (bind && syncStack[0] && !syncStack[0].includes(this)) {
        syncStack[0].push(this);
      }
      return this[VALUE];
    }
    to(to, opt) {
      const set = this.set && opt?.from && (value => this.set(opt.from(value)));
      return calc(() => to(this.get()), set);
    }
    child(prop, updateOnPropChange = true) {
      if (isData(prop)) {
        const update = () => this.child(prop.get(updateOnPropChange)).get();
        const set = this.set && (value => {
          this.child(prop.get(false)).set(value);
        });
        return calc(update, set, CHILD_SUPPRESS_FN);
      }

      if (!this[CHILDREN]) this[CHILDREN] = {};
      if (!this[CHILDREN][prop]) {
        const update = () => this.get()?.[prop];
        const set = this.set && (value => {
          const previous = CHILD_SUPPRESS;
          CHILD_SUPPRESS = true;
          this.modify(obj => obj[prop] = value);
          child[VALUE] = value;
          CHILD_SUPPRESS = previous;
          notifySyncs(child);
        });
        const child = calc(update, set, CHILD_SUPPRESS_FN);
        this[CHILDREN][prop] = child;
      }
      return this[CHILDREN][prop];
    }
    watch(fn) {
      return sync(() => fn(this.get()));
    }
  }

  const create = (value, mutatable = true) => new Data(value, mutatable && SET_DATA);
  var hamaca = Object.assign(create,
      {ensure, calc, isData, sync, getAll, ensureAll, get});

  return hamaca;

}());
