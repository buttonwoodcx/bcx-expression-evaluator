import {CallMember, AccessScope} from '../../src/ast';
import {createScope} from '../../src/scope';
import test from 'tape';

test('AST:CallMember: evaluates', t => {
  let expression = new CallMember(new AccessScope('foo', 0), 'bar', []);
  let bindingContext = { foo: { bar: () => 'baz' } };
  let scope = createScope(bindingContext);
  t.equal(expression.evaluate(scope), 'baz');
  t.end();
});

test('AST:CallMember: evaluate handles null/undefined member', t => {
  let expression = new CallMember(new AccessScope('foo', 0), 'bar', []);
  t.equal(expression.evaluate(createScope({ foo: {} })), undefined);
  t.equal(expression.evaluate(createScope({ foo: { bar: undefined } })), undefined);
  t.equal(expression.evaluate(createScope({ foo: { bar: null } })), undefined);
  t.end();
});

test('AST:CallMember: evaluate throws when mustEvaluate and member is null or undefined', t => {
  let expression = new CallMember(new AccessScope('foo', 0), 'bar', []);
  let mustEvaluate = true;
  t.throws(() => expression.evaluate(createScope({}), mustEvaluate));
  t.throws(() => expression.evaluate(createScope({ foo: {} }), mustEvaluate));
  t.throws(() => expression.evaluate(createScope({ foo: { bar: undefined } }), mustEvaluate));
  t.throws(() => expression.evaluate(createScope({ foo: { bar: null } }), mustEvaluate));
  t.end();
});
