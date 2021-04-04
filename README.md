# hamaca.js
A data-reactive library

## Getting Started
### Install
    npm i hamaca

### Usage
    import $_ from 'hamaca';

    const name = $_('hamaca');
    name.map(name => name.toUpperCase()).watch(name => console.log(`Hola, ${name}`));
    name.set('hamaca.js')

### Methods
#### get
Returns the current data's value. If within a syncable function (i.e. `map`, `watch`, `$_.calc`, `$_.sync`), this will cause the function to be called again any time the value changes.

  const flag = $_(true);
  $_.sync(() => console.log(flag.get() ? 'Flag is set' : 'Flag not set'));

#### set
Modifies the data, and triggers updates to any dependent syncable functions.

  const flag = $_(true);
  flag.set(false);

#### modify
Pass a modifying function to modify the data

  const items = $_(['One', 'Two']);
  items.modify(items => items.push('Three'));

#### watch
Calls function each time the value is changed

  const count = $_(0);
  count.watch(n => console.log(`Count: ${n}`));
  for (let n = 1; n < 3; n++) {
    count.set(n);
  }
  // Outputs
  //   Count: 0
  //   Count: 1
  //   Count: 2

#### map
Maps one data to another

  const n = $_(2);
  const squared = n.map(n => n * n);
  squared.watch(nn => console.log(`Square: ${nn}`));
  n.set(3);
  // Outputs
  //   Square: 4
  //   Square: 9

#### mapIf
Maps based on a condition, otherwise returns a the data value of the original

  const sort = $_(false);
  const items = $_(['Omar', 'Daniel', 'Elle']);
  const displayableItems = items
      .mapIf(sort, items => [...items].sort());
  displayableItems.watch(items => console.log(items));
  sort.set(true);
  // Outputs
  //   ["Omar", "Daniel", "Elle"]
  //   ["Daniel", "Elle", "Omar"]

### Functions
These are functions on `$_`

#### $_.ensure
Ensures that a value is a data object

  const squared = n => $_.ensure(n).map(n => n * n);
  const a = squared(2);
  const b = squared(a);
  console.log(a.get(), b.get());  // Output: 4, 16

#### $_.ensureAll
Converts an array of values that may or may not be data objects to an array of data objects

  const sum = (...args) => {
  	const datas = $_.ensureAll(args);
  	return $_.calc(() => datas.reduce((sum, data) => sum + data.get(), 0));
  };
  const a = $_(1);
  const b = sum(a, 2);
  const c = sum(a, b, 3);
  console.log(a.get(), b.get(), c.get());  // Outputs: 1, 3, 7
  a.set(2);
  console.log(a.get(), b.get(), c.get()); // Outputs: 2, 4, 9

#### $_.getAll
Resolves each data item in an array

  const a = $_(2);
  const b = a.map(a => a + 1);
  const c = $_.calc(() => a.get() * b.get());
  console.log($_.getAll([a, b, c]));  // Outputs: [2, 3, 6]

#### $_.calc
Calculates a data object based on other data objects

  const n = $_(2);
  const exp = $_(8);
  const pow = $_.calc(() => Math.pow(n.get(), exp.get()));
  console.log(pow.get());  // Outputs: 256
  n.set(9)
  exp.set(2);
  console.log(pow.get());  // Outputs: 81

#### $_.sync
Calls function any time a used data object changes

  const n = $_(2);
  const exp = $_(8);
  $_.sync(() => {
  	console.log(`${n.get()}^${exp.get()} = ${Math.pow(n.get(), exp.get())}`);
  });
  n.set(9)
  exp.set(2);
  // Outputs:
  //   2^8 = 256
  //   9^8 = 43046721
  //   9^2 = 81