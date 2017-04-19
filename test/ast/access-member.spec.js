import {AccessMember, AccessScope} from '../../src/ast';
import {createScope} from '../../src/scope';
import test from 'tape';

let expression = new AccessMember(new AccessScope('foo', 0), 'bar');

test('AST:AccessMember: evaluates member on bindingContext', t => {
  let scope = createScope({ foo: { bar: 'baz' } });
  t.equal(expression.evaluate(scope), 'baz');
  t.end();
});

test('AST:AccessMember: evaluates member on overrideContext', t => {
  let scope = createScope({}, {foo: {bar: 'baz'}});
  t.equal(expression.evaluate(scope), 'baz');
  t.end();
});

test('AST:AccessMember: assigns member on bindingContext', t => {
  let scope = createScope({ foo: { bar: 'baz' } });
  expression.assign(scope, 'bang');
  t.equal(scope[0].foo.bar, 'bang');
  t.end();
});

test('AST:AccessMember: assigns member on overrideContext', t => {
  let scope = createScope({}, {foo: {bar: 'baz'}});
  expression.assign(scope, 'bang');
  t.equal(scope[1].foo.bar, 'bang');
  t.end();
});

test('AST:AccessMember: returns the assigned value', t => {
  let scope = createScope({ foo: { bar: 'baz' } });
  t.equal(expression.assign(scope, 'bang'), 'bang');
  t.end();
});
