import {AccessMember, AccessScope} from '../../src/ast';
import {createSimpleScope} from '../../src/scope';
import test from 'tape';

let expression = new AccessMember(new AccessScope('foo', 0), 'bar');

test('AST:AccessMember: evaluates member on bindingContext', t => {
  let scope = createSimpleScope({ foo: { bar: 'baz' } });
  t.equal(expression.evaluate(scope), 'baz');
  t.end();
});

test('AST:AccessMember: evaluates member on overrideContext', t => {
  let scope = createSimpleScope({});
  scope.overrideContext.foo = { bar: 'baz' };
  t.equal(expression.evaluate(scope), 'baz');
  t.end();
});

test('AST:AccessMember: assigns member on bindingContext', t => {
  let scope = createSimpleScope({ foo: { bar: 'baz' } });
  expression.assign(scope, 'bang');
  t.equal(scope.bindingContext.foo.bar, 'bang');
  t.end();
});

test('AST:AccessMember: assigns member on overrideContext', t => {
  let scope = createSimpleScope({});
  scope.overrideContext.foo = { bar: 'baz' };
  expression.assign(scope, 'bang');
  t.equal(scope.overrideContext.foo.bar, 'bang');
  t.end();
});

test('AST:AccessMember: returns the assigned value', t => {
  let scope = createSimpleScope({ foo: { bar: 'baz' } });
  t.equal(expression.assign(scope, 'bang'), 'bang');
  t.end();
});
