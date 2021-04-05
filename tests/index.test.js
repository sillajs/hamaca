const $_ = require('../index');

describe('get', () => {
  it('returns data', () => {
    expect($_().get()).toBe(undefined);
    expect($_(true).get()).toBe(true);
    expect($_(false).get()).toBe(false);
  });
});

describe('set', () => {
  it('changes data', () => {
    const flag = $_(true);
    flag.set(false);
    expect(flag.get()).toBe(false);
  });
});

describe('modify', () => {
  it('modifies data', () => {
    const items = $_([1, 2, 3]);
    items.modify(items => items.splice(1, 1, 'two'));
    expect(items.get()).toEqual([1, 'two', 3]);
  });
});

describe('watch', () => {
  it('calls each time value is changed', () => {
    const n = $_(1);
    const values = [];
    n.watch(n => values.push(n));
    [2, 3].forEach(v => n.set(v));
    expect(values).toEqual([1, 2, 3]);
  });

  it('returns self', () => {
    const n = $_(1);
    expect(n.watch(()=>{})).toBe(n);
  });
});

describe('map', () => {
  it('maps data', () => {
    const n = $_(2);
    const squared = n.map(n => n * n);
    expect(squared.get()).toBe(4);
    n.set(3);
    expect(squared.get()).toBe(9);
    n.set(4);
    expect(squared.get()).toBe(16);
  });

  it('maps mapped data', () => {
    const n = $_(2);
    const squaredPlus1 = n.map(n => n * n).map(n => n + 1);
    expect(squaredPlus1.get()).toBe(5);
    n.set(3);
    expect(squaredPlus1.get()).toBe(10);
    n.set(4);
    expect(squaredPlus1.get()).toBe(17);
  });
});

describe('mapIf', () => {
  it('maps based on condition', () => {
    const items = $_([1,2,3,4,5]);
    const flag = $_(false);
    const filtered = items.mapIf(flag, items => items.filter(n => n % 2));
    expect(filtered.get()).toEqual([1,2,3,4,5]);
    flag.set(true);
    expect(filtered.get()).toEqual([1,3,5]);
    flag.set(false);
    expect(filtered.get()).toEqual([1,2,3,4,5]);
  });
})

describe('$_.ensure', () => {
  it('noop when already data', () => {
    const data = $_(true);
    expect($_.ensure(data)).toBe(data);
  });
  it('converts regular value to data', () => {
    expect($_.ensure(true).get()).toBe(true);
  });
})

describe('$_.ensureAll', () => {
  it('ensures each value/data of an array', () => {
    const datas = $_.ensureAll([$_(1), 2, $_(3)]);
    expect(datas.map(data => data.get())).toEqual([1,2,3]);
  });
})

describe('$_.getAll', () => {
  it('gets value for each data in an array', () => {
    const datas = $_.ensureAll([$_(1), 2, $_(3)]);
    expect($_.getAll(datas)).toEqual([1,2,3]);
  });
});

describe('$_.calc', () => {
  it('creates data that updates each time dependent data is changed', () => {
    const [a, b] = [$_(2), $_(3)];
    const r = $_.calc(() => a.get() * b.get());
    expect(r.get()).toBe(6);
    a.set(4);
    expect(r.get()).toBe(12);
    b.set(5);
    expect(r.get()).toBe(20);
  });
});

describe('$_.sync', () => {
  it('calls function each time a dependent data changes', () => {
    const [a, b] = [$_(2), $_(3)];
    const c = $_.calc(() => a.get() + b.get());
    const values = [];
    $_.sync(() => {
      values.push([a.get(), b.get(), c.get()])
    });
    expect(values.pop()).toEqual([2, 3, 5]);
    a.set(4);
    expect(values.pop()).toEqual([4, 3, 7]);
    b.set(5);
    expect(values.pop()).toEqual([4, 5, 9]);
  });

  it('only notified once when get is called multiple times', () => {
    const n = $_(2);
    let calls = 0;
    $_.sync(() => {
      calls += 1;
      n.get();
      n.get();
    });
    expect(calls).toBe(1);
    n.set(3);
    expect(calls).toBe(2);
  });
});