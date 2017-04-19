import {CallScope, AccessScope} from '../../src/ast';
import {createScope} from '../../src/scope';
import test from 'tape';

let foo = new CallScope('foo', [], 0);
let hello = new CallScope('hello', [new AccessScope('arg', 0)], 0);

test('AST:CallScope: evaluates undefined bindingContext', t => {
  let scope = createScope(undefined);
  t.equal(foo.evaluate(scope), undefined);
  t.equal(hello.evaluate(scope), undefined);
  t.end();
});

test('AST:CallScope: throws when mustEvaluate and evaluating undefined bindingContext', t => {
  let scope = createScope(undefined);
  let mustEvaluate = true;
  t.throws(() => foo.evaluate(scope, mustEvaluate));
  t.throws(() => hello.evaluate(scope, mustEvaluate));
  t.end();
});

test('AST:CallScope: evaluates null bindingContext', t => {
  let scope = createScope(null);
  t.equal(foo.evaluate(scope), undefined);
  t.equal(hello.evaluate(scope), undefined);
  t.end();
});

test('AST:CallScope: throws when mustEvaluate and evaluating null bindingContext', t => {
  let scope = createScope(null);
  let mustEvaluate = true;
  t.throws(() => foo.evaluate(scope, mustEvaluate));
  t.throws(() => hello.evaluate(scope, mustEvaluate));
  t.end();
});

test('AST:CallScope: evaluates defined property on bindingContext', t => {
  let scope = createScope({ foo: () => 'bar', hello: arg => arg, arg: 'world' });
  t.equal(foo.evaluate(scope), 'bar');
  t.equal(hello.evaluate(scope), 'world');
  t.end();
});

test('AST:CallScope: evaluates defined property on overrideContext', t => {
  let scope = createScope({ abc: () => 'xyz' }, {foo: () => 'bar', hello: arg => arg, arg: 'world'});
  t.equal(foo.evaluate(scope), 'bar');
  t.equal(hello.evaluate(scope), 'world');
  t.end();
});

test('AST:CallScope: evaluates defined property on first ancestor bindingContext', t => {
  let scope = createScope({ abc: 'xyz' }, { foo: () => 'bar', hello: arg => arg, arg: 'world' });
  t.equal(foo.evaluate(scope), 'bar');
  t.equal(hello.evaluate(scope), 'world');
  t.end();
});

test('AST:CallScope: evaluates defined property on first ancestor overrideContext', t => {
  let scope = createScope({ abc: 'xyz' }, { def: 'rsw' }, {foo: () => 'bar', hello: arg => arg, arg: 'world'});
  t.equal(foo.evaluate(scope), 'bar');
  t.equal(hello.evaluate(scope), 'world');
  t.end();
});
