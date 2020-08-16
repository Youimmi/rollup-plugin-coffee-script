import assert from 'assert';
import * as rollup from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import coffeePlugin from '..';
import coffee from 'coffeescript';
import fs from 'fs';

process.chdir(__dirname);

describe('rollup-plugin-coffeescript', function() {
  this.timeout(5000);

  it('runs code through coffeescript', () => {
    const entry = 'sample/basic/main.coffee';
    const source = fs.readFileSync(entry).toString();

    return rollup.rollup({
      input: entry,
      plugins: [coffeePlugin()]
    })
      .then((bundle) => bundle.generate({ format: 'es' }))
      .then((generated) => {
        const code = generated.output[0].code
        const coffeeOutput = coffee.compile(source, { bare: true });
        assert.equal(code.trim(), coffeeOutput.trim());
      });
  });

  it('only runs code with defined extensions through coffee script', () => {
    const entry = 'sample/invalid-coffee.js';

    return rollup.rollup({
      input: entry,
      plugins: [coffeePlugin(), nodeResolve({ extensions: ['.coffee', '.js'] })]
    })
      .then((bundle) => bundle.generate({ format: 'es' }))
      .then((generated) => {
        const code = generated.output[0].code
        assert.ok(code.indexOf('answer = 42') !== -1);
      });
  });

  it('works with requires when used with commonjs plugin', () => {
    const entry = 'sample/import-class/main.coffee';

    return rollup.rollup({
      input: entry,
      plugins: [coffeePlugin(), commonjs({ extensions: ['.coffee']})]
    })
      .then((bundle) => bundle.generate({ format: 'es' }))
      .then((generated) => {
        const code = generated.output[0].code
        assert.ok(code.indexOf('{A} = require("./A")') !== 0);
      });
  });
  it('allows overriding default options', () => {
    const entry = 'sample/litcoffee/example.coffee.md';

    return rollup.rollup({
      input: entry,
      plugins: [coffeePlugin({ extensions: ['.md' ], literate: true })]
    })
      .then((bundle) => bundle.generate({ format: 'es' }))
      .then((generated) => {
        const code = generated.output[0].code
        assert.ok(code.indexOf('answer = 42') !== -1);
      });
  });

  it('compiles .litcoffee', () => {
    const entry = 'sample/litcoffee/main.litcoffee';

    return rollup.rollup({
      input: entry,
      plugins: [coffeePlugin({})]
    })
      .then((bundle) => bundle.generate({ format: 'es' }))
      .then((generated) => {
        const code = generated.output[0].code
        assert.ok(code.indexOf('answer = 42') !== -1);
      });
  });

  it('passes proper source map to rollup', () => {
    const entry = 'sample/import-class/main.coffee';

    return rollup.rollup({
      input: entry,
      plugins: [coffeePlugin(), commonjs({ extensions: ['.coffee']})]
    })
      .then((bundle) => bundle.generate({ sourcemap: true, format: 'es' }))
      .then((generated) => {
        assert.ok(generated.output[0].map.sources.indexOf(entry) === 1);
      });
  });
});
