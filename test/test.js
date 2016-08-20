import assert from 'assert';
import * as rollup from 'rollup';
import commonjs from 'rollup-plugin-commonjs';
import coffeePlugin from '..';
import coffee from 'coffee-script';
import fs from 'fs';

process.chdir(__dirname);

describe('rollup-plugin-coffeescript', function() {
  this.timeout(5000);

  it('runs code through coffeescript', () => {
    const entry = 'sample/basic/main.coffee';
    const source = fs.readFileSync(entry).toString();

    return rollup.rollup({
      entry: entry,
      plugins: [coffeePlugin()]
    }).then(function(bundle) {
      const generated = bundle.generate();
      const coffeeOutput = coffee.compile(source, { bare: true });
      assert.equal(generated.code.trim(), coffeeOutput.trim());
    });
  });

  it('only runs code with defined extensions through coffee script', () => {
    const entry = 'sample/invalid-coffee.js';

    return rollup.rollup({
      entry: entry,
      plugins: [coffeePlugin()]
    }).then(function(bundle) {
      const generated = bundle.generate();
      assert.ok(generated.code.indexOf('answer = 42') !== -1);
    });
  });

  it('works with requires when used with commonjs plugin', () => {
    const entry = 'sample/import-class/main.coffee';

    return rollup.rollup({
      entry: entry,
      plugins: [coffeePlugin(), commonjs({ extensions: ['.coffee']})]
    }).then(function(bundle) {
      const generated = bundle.generate();
      const code = generated.code;
      assert.ok(code.indexOf('var A = createCommonjsModule(') !== -1);
    });
  });

  it('allows overriding default options', () => {
    const entry = 'sample/litcoffee/example.coffee.md';

    return rollup.rollup({
      entry: entry,
      plugins: [coffeePlugin({ extensions: ['.md' ], literate: true })]
    }).then(function(bundle) {
      const generated = bundle.generate();
      const code = generated.code;
      assert.ok(generated.code.indexOf('answer = 42') !== -1);
    });
  });

  it('compiles .litcoffee', () => {
    const entry = 'sample/litcoffee/main.litcoffee';

    return rollup.rollup({
      entry: entry,
      plugins: [coffeePlugin({})]
    }).then(function(bundle) {
      const generated = bundle.generate();
      const code = generated.code;
      assert.ok(generated.code.indexOf('answer = 42') !== -1);
    });
  });

  it('passes proper source map to rollup', () => {
    const entry = 'sample/import-class/main.coffee';

    return rollup.rollup({
      entry: entry,
      plugins: [coffeePlugin(), commonjs({ extensions: ['.coffee']})]
    }).then(function(bundle) {
      const generated = bundle.generate({ sourceMap: true });
      assert.ok(generated.map.sources.indexOf(entry) === -1);
    });
  });
});
