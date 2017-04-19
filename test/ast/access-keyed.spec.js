import {AccessKeyed, AccessScope, LiteralString, LiteralPrimitive} from '../../src/ast';
import {createScope} from '../../src/scope';
import test from 'tape';

let expression = new AccessKeyed(new AccessScope('foo', 0), new LiteralString('bar'));

test('AST:AccessKeyed: evaluates member on bindingContext', t => {
  let scope = createScope({ foo: { bar: 'baz' } });
  t.equal(expression.evaluate(scope), 'baz');
  t.end();
});

test('AST:AccessKeyed: evaluates member on overrideContext', t => {
  let scope = createScope({}, { foo: { bar: 'baz' } });
  t.equal(expression.evaluate(scope), 'baz');
  t.end();
});

test('AST:AccessKeyed: assigns member on bindingContext', t => {
  let scope = createScope({ foo: { bar: 'baz' } });
  expression.assign(scope, 'bang');
  t.equal(scope[0].foo.bar, 'bang');
  t.end();
});

test('AST:AccessKeyed: assigns member on overrideContext', t => {
  let scope = createScope({}, {foo: {bar: 'baz'}});
  expression.assign(scope, 'bang');
  t.equal(scope[1].foo.bar, 'bang');
  t.end();
});

test('AST:AccessKeyed: evaluates null/undefined object', t => {
  let scope = createScope({ foo: null });
  t.equal(expression.evaluate(scope), undefined);
  scope = createScope({ foo: undefined });
  t.equal(expression.evaluate(scope), undefined);
  scope = createScope({});
  t.equal(expression.evaluate(scope), undefined);
  t.end();
});
