import {AccessScope} from '../../src/ast';
import {createOverrideContext, createSimpleScope} from '../../src/scope';
import test from 'tape';

let foo = new AccessScope('foo', 0);
let $parentfoo = new AccessScope('foo', 1);


test('evaluates undefined bindingContext', t => {
  let scope = { overrideContext: createOverrideContext(undefined) };
  t.equal(foo.evaluate(scope), undefined);
  t.end();
});

test('assigns undefined bindingContext', t => {
  let scope = { overrideContext: createOverrideContext(undefined) };
  foo.assign(scope, 'baz');
  t.equal(scope.overrideContext.foo, 'baz');
  t.end();
});

test('evaluates null bindingContext', t => {
  let scope = { overrideContext: createOverrideContext(null), bindingContext: null };
  t.equal(foo.evaluate(scope), undefined);
  t.end();
});

test('assigns null bindingContext', t => {
  let scope = { overrideContext: createOverrideContext(null), bindingContext: null };
  foo.assign(scope, 'baz');
  t.equal(scope.overrideContext.foo, 'baz');
  t.end();
});


test('evaluates defined property on bindingContext', t => {
  let scope = createSimpleScope({ foo: 'bar' });
  t.equal(foo.evaluate(scope), 'bar');
  t.end();
});

test('evaluates defined property on overrideContext', t => {
  let scope = createSimpleScope({ abc: 'xyz' });
  scope.overrideContext.foo = 'bar';
  t.equal(foo.evaluate(scope), 'bar');
  t.end();
});

test('assigns defined property on bindingContext', t => {
  let scope = createSimpleScope({ foo: 'bar' });
  foo.assign(scope, 'baz');
  t.equal(scope.bindingContext.foo, 'baz');
  t.end();
});

test('assigns undefined property to bindingContext', t => {
  let scope = createSimpleScope({ abc: 'xyz' });
  foo.assign(scope, 'baz');
  t.equal(scope.bindingContext.foo, 'baz');
  t.end();
});

test('assigns defined property on overrideContext', t => {
  let scope = createSimpleScope({ abc: 'xyz' });
  scope.overrideContext.foo = 'bar';
  foo.assign(scope, 'baz');
  t.equal(scope.overrideContext.foo, 'baz');
  t.end();
});

test('evaluates defined property on first ancestor bindingContext', t => {
  let scope = createSimpleScope({ abc: 'xyz' }, { foo: 'bar' });
  t.equal(foo.evaluate(scope), 'bar');
  t.equal($parentfoo.evaluate(scope), 'bar');
  t.end();
});

test('evaluates defined property on first ancestor overrideContext', t => {
  let scope = createSimpleScope({ abc: 'xyz' }, { def: 'rsw' });
  scope.overrideContext.parentOverrideContext.foo = 'bar';
  t.equal(foo.evaluate(scope), 'bar');
  t.equal($parentfoo.evaluate(scope), 'bar');
  t.end();
});

test('assigns defined property on first ancestor bindingContext', t => {
  let scope = createSimpleScope({ abc: 'xyz' }, { foo: 'bar' });
  foo.assign(scope, 'baz');
  t.equal(scope.overrideContext.parentOverrideContext.bindingContext.foo, 'baz');
  $parentfoo.assign(scope, 'beep');
  t.equal(scope.overrideContext.parentOverrideContext.bindingContext.foo, 'beep');
  t.end();
});

test('assigns defined property on first ancestor overrideContext', t => {
  let scope = createSimpleScope({ abc: 'xyz' }, { def: 'rsw' });
  scope.overrideContext.parentOverrideContext.foo = 'bar';
  foo.assign(scope, 'baz');
  t.equal(scope.overrideContext.parentOverrideContext.foo, 'baz');
  $parentfoo.assign(scope, 'beep');
  t.equal(scope.overrideContext.parentOverrideContext.foo, 'beep');
  t.end();
});
