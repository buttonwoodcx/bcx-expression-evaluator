import {AccessScope} from '../../src/ast';
import {createScope} from '../../src/scope';
import test from 'tape';

let foo = new AccessScope('foo', 0);
let $parentfoo = new AccessScope('foo', 1);


test('AST:AccessScope: evaluates undefined bindingContext', t => {
  let scope = createScope(undefined);
  t.equal(foo.evaluate(scope), undefined);
  t.end();
});

test('AST:AccessScope: assigns undefined bindingContext', t => {
  let scope = createScope(undefined);
  foo.assign(scope, 'baz');
  t.deepEqual(scope, [undefined]);
  t.end();
});

test('AST:AccessScope: evaluates null bindingContext', t => {
  let scope = createScope(null);
  t.equal(foo.evaluate(scope), undefined);
  t.end();
});

test('AST:AccessScope: assigns null bindingContext', t => {
  let scope = createScope(null);
  foo.assign(scope, 'baz');
  t.deepEqual(scope, [null]);
  t.end();
});


test('AST:AccessScope: evaluates defined property on bindingContext', t => {
  let scope = createScope({ foo: 'bar' });
  t.equal(foo.evaluate(scope), 'bar');
  t.end();
});

test('AST:AccessScope: evaluates defined property on overrideContext', t => {
  let scope = createScope({ abc: 'xyz' }, {foo: 'bar'});
  t.equal(foo.evaluate(scope), 'bar');
  t.end();
});

test('AST:AccessScope: assigns defined property on bindingContext', t => {
  let scope = createScope({ foo: 'bar' });
  foo.assign(scope, 'baz');
  t.equal(scope[0].foo, 'baz');
  t.end();
});

test('AST:AccessScope: assigns undefined property to bindingContext', t => {
  let scope = createScope({ abc: 'xyz' });
  foo.assign(scope, 'baz');
  t.equal(scope[0].foo, 'baz');
  t.end();
});

test('AST:AccessScope: assigns defined property on overrideContext', t => {
  let scope = createScope({ abc: 'xyz' }, {foo: 'bar'});
  foo.assign(scope, 'baz');
  t.equal(scope[1].foo, 'baz');
  t.end();
});

test('AST:AccessScope: evaluates defined property on first ancestor bindingContext', t => {
  let scope = createScope({ abc: 'xyz' }, { foo: 'bar' });
  t.equal(foo.evaluate(scope), 'bar');
  t.equal($parentfoo.evaluate(scope), 'bar');
  t.end();
});

test('AST:AccessScope: evaluates defined property on first ancestor overrideContext', t => {
  let scope = createScope({ abc: 'xyz' }, { def: 'rsw' }, {foo: 'bar'});
  t.equal(foo.evaluate(scope), 'bar');
  t.equal($parentfoo.evaluate(scope), 'bar');
  t.end();
});

test('AST:AccessScope: assigns defined property on first ancestor bindingContext', t => {
  let scope = createScope({ abc: 'xyz' }, { foo: 'bar' });
  foo.assign(scope, 'baz');
  t.equal(scope[1].foo, 'baz');
  $parentfoo.assign(scope, 'beep');
  t.equal(scope[1].foo, 'beep');
  t.end();
});

test('AST:AccessScope: assigns defined property on first ancestor overrideContext', t => {
  let scope = createScope({ abc: 'xyz' }, { def: 'rsw' }, {foo: 'bar'});
  foo.assign(scope, 'baz');
  t.equal(scope[2].foo, 'baz');
  $parentfoo.assign(scope, 'beep');
  t.equal(scope[2].foo, 'beep');
  t.end();
});
