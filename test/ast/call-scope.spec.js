import {CallScope, AccessScope} from '../../src/ast';
import {createOverrideContext, createSimpleScope} from '../../src/scope';
import test from 'tape';

let foo = new CallScope('foo', [], 0);
let hello = new CallScope('hello', [new AccessScope('arg', 0)], 0);

test('AST:CallScope: evaluates undefined bindingContext', t => {
  let scope = { overrideContext: createOverrideContext(undefined) };
  t.equal(foo.evaluate(scope), undefined);
  t.equal(hello.evaluate(scope), undefined);
  t.end();
});

test('AST:CallScope: throws when mustEvaluate and evaluating undefined bindingContext', t => {
  let scope = { overrideContext: createOverrideContext(undefined) };
  let mustEvaluate = true;
  t.throws(() => foo.evaluate(scope, mustEvaluate));
  t.throws(() => hello.evaluate(scope, mustEvaluate));
  t.end();
});

test('AST:CallScope: evaluates null bindingContext', t => {
  let scope = { overrideContext: createOverrideContext(null), bindingContext: null };
  t.equal(foo.evaluate(scope), undefined);
  t.equal(hello.evaluate(scope), undefined);
  t.end();
});

test('AST:CallScope: throws when mustEvaluate and evaluating null bindingContext', t => {
  let scope = { overrideContext: createOverrideContext(null), bindingContext: null };
  let mustEvaluate = true;
  t.throws(() => foo.evaluate(scope, mustEvaluate));
  t.throws(() => hello.evaluate(scope, mustEvaluate));
  t.end();
});

test('AST:CallScope: evaluates defined property on bindingContext', t => {
  let scope = createSimpleScope({ foo: () => 'bar', hello: arg => arg, arg: 'world' });
  t.equal(foo.evaluate(scope), 'bar');
  t.equal(hello.evaluate(scope), 'world');
  t.end();
});

test('AST:CallScope: evaluates defined property on overrideContext', t => {
  let scope = createSimpleScope({ abc: () => 'xyz' });
  scope.overrideContext.foo = () => 'bar';
  scope.overrideContext.hello = arg => arg;
  scope.overrideContext.arg = 'world';
  t.equal(foo.evaluate(scope), 'bar');
  t.equal(hello.evaluate(scope), 'world');
  t.end();
});

test('AST:CallScope: evaluates defined property on first ancestor bindingContext', t => {
  let scope = createSimpleScope({ abc: 'xyz' }, { foo: () => 'bar', hello: arg => arg, arg: 'world' });
  t.equal(foo.evaluate(scope), 'bar');
  t.equal(hello.evaluate(scope), 'world');
  t.end();
});

test('AST:CallScope: evaluates defined property on first ancestor overrideContext', t => {
  let scope = createSimpleScope({ abc: 'xyz' }, { def: 'rsw' });
  scope.overrideContext.parentOverrideContext.foo = () => 'bar';
  scope.overrideContext.parentOverrideContext.hello = arg => arg;
  scope.overrideContext.parentOverrideContext.arg = 'world';
  t.equal(foo.evaluate(scope), 'bar');
  t.equal(hello.evaluate(scope), 'world');
  t.end();
});
