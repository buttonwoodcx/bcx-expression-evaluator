import {CallMember, AccessScope} from '../../src/ast';
import {createSimpleScope} from '../../src/scope';
import test from 'tape';

test('AST:CallMember: evaluates', t => {
  let expression = new CallMember(new AccessScope('foo', 0), 'bar', []);
  let bindingContext = { foo: { bar: () => 'baz' } };
  let scope = createSimpleScope(bindingContext);
  t.equal(expression.evaluate(scope), 'baz');
  t.end();
});

test('AST:CallMember: evaluate handles null/undefined member', t => {
  let expression = new CallMember(new AccessScope('foo', 0), 'bar', []);
  t.equal(expression.evaluate(createSimpleScope({ foo: {} })), undefined);
  t.equal(expression.evaluate(createSimpleScope({ foo: { bar: undefined } })), undefined);
  t.equal(expression.evaluate(createSimpleScope({ foo: { bar: null } })), undefined);
  t.end();
});

test('AST:CallMember: evaluate throws when mustEvaluate and member is null or undefined', t => {
  let expression = new CallMember(new AccessScope('foo', 0), 'bar', []);
  let mustEvaluate = true;
  t.throws(() => expression.evaluate(createSimpleScope({}), mustEvaluate));
  t.throws(() => expression.evaluate(createSimpleScope({ foo: {} }), mustEvaluate));
  t.throws(() => expression.evaluate(createSimpleScope({ foo: { bar: undefined } }), mustEvaluate));
  t.throws(() => expression.evaluate(createSimpleScope({ foo: { bar: null } }), mustEvaluate));
  t.end();
});
