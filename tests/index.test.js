const $ = require('../index');

const clone = value => {
  if (typeof value !== 'object' || value === null) return value;
  return JSON.parse(JSON.stringify(value));
}
const record = (data, map = v => v) => {
  const values = [];
  data.watch(value => values.push(clone(map(value))));
  return values;
}

describe('get', () => {
  it('returns data', () => {
    expect($().get()).toBe(undefined);
    expect($(true).get()).toBe(true);
    expect($(false).get()).toBe(false);
  });
});

describe('set', () => {
  it('changes data', () => {
    const flag = $(true);
    flag.set(false);
    expect(flag.get()).toBe(false);
  });
});

describe('modify', () => {
  it('modifies data', () => {
    const items = $([1, 2, 3]);
    items.modify(items => items.splice(1, 1, 'two'));
    expect(items.get()).toEqual([1, 'two', 3]);
  });
});

describe('watch', () => {
  it('calls each time value is changed', () => {
    const n = $(1);
    const values = [];
    n.watch(n => values.push(n));
    [2, 3].forEach(v => n.set(v));
    expect(values).toEqual([1, 2, 3]);
  });

  it('cancels a watch', () => {
    const n = $(1);
    const values = [];
    const watch = n.watch(n => values.push(n));
    n.set(2);
    watch.cancel();
    n.set(3);
    expect(values).toEqual([1, 2]);
  });
});

describe('to', () => {
  it('converts data', () => {
    const n = $(2);
    const squared = n.to(n => n * n);
    expect(squared.get()).toBe(4);
    n.set(3);
    expect(squared.get()).toBe(9);
    n.set(4);
    expect(squared.get()).toBe(16);
  });

  it('converts converted data', () => {
    const n = $(2);
    const squaredPlus1 = n.to(n => n * n).to(n => n + 1);
    expect(squaredPlus1.get()).toBe(5);
    n.set(3);
    expect(squaredPlus1.get()).toBe(10);
    n.set(4);
    expect(squaredPlus1.get()).toBe(17);
  });
});

describe('$.ensure', () => {
  it('noop when already data', () => {
    const data = $(true);
    expect($.ensure(data)).toBe(data);
  });
  it('converts regular value to data', () => {
    expect($.ensure(true).get()).toBe(true);
  });
})

describe('$.ensureAll', () => {
  it('ensures each value/data of an array', () => {
    const datas = $.ensureAll([$(1), 2, $(3)]);
    expect(datas.map(data => data.get())).toEqual([1,2,3]);
  });
})

describe('$.getAll', () => {
  it('gets value for each data in an array', () => {
    const datas = $.ensureAll([$(1), 2, $(3)]);
    expect($.getAll(datas)).toEqual([1,2,3]);
  });
});

describe('$.calc', () => {
  it('creates data that updates each time dependent data is changed', () => {
    const [a, b] = [$(2), $(3)];
    const r = $.calc(() => a.get() * b.get());
    expect(r.get()).toBe(6);
    a.set(4);
    expect(r.get()).toBe(12);
    b.set(5);
    expect(r.get()).toBe(20);
  });
});

describe('$.sync', () => {
  it('calls function each time a dependent data changes', () => {
    const [a, b] = [$(2), $(3)];
    const c = $.calc(() => a.get() + b.get());
    const values = [];
    $.sync(() => {
      values.push([a.get(), b.get(), c.get()])
    });
    expect(values.pop()).toEqual([2, 3, 5]);
    a.set(4);
    expect(values.pop()).toEqual([4, 3, 7]);
    b.set(5);
    expect(values.pop()).toEqual([4, 5, 9]);
  });

  it('only notified once when get is called multiple times', () => {
    const n = $(2);
    let calls = 0;
    $.sync(() => {
      calls += 1;
      n.get();
      n.get();
    });
    expect(calls).toBe(1);
    n.set(3);
    expect(calls).toBe(2);
  });
});