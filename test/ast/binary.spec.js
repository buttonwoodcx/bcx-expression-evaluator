import {Binary, LiteralString, LiteralPrimitive} from '../../src/ast';
import {createSimpleScope} from '../../src/scope';
import test from 'tape';

test('concats strings', t => {
  let expression = new Binary('+', new LiteralString('a'), new LiteralString('b'));
  let scope = createSimpleScope({});
  t.equal(expression.evaluate(scope), 'ab');

  expression = new Binary('+', new LiteralString('a'), new LiteralPrimitive(null));
  scope = createSimpleScope({});
  t.equal(expression.evaluate(scope), 'a');

  expression = new Binary('+', new LiteralPrimitive(null), new LiteralString('b'));
  scope = createSimpleScope({});
  t.equal(expression.evaluate(scope), 'b');

  expression = new Binary('+', new LiteralString('a'), new LiteralPrimitive(undefined));
  scope = createSimpleScope({});
  t.equal(expression.evaluate(scope), 'a');

  expression = new Binary('+', new LiteralPrimitive(undefined), new LiteralString('b'));
  scope = createSimpleScope({});
  t.equal(expression.evaluate(scope), 'b');
  t.end();
});

test('adds numbers', t => {
  let expression = new Binary('+', new LiteralPrimitive(1), new LiteralPrimitive(2));
  let scope = createSimpleScope({});
  t.equal(expression.evaluate(scope), 3);

  expression = new Binary('+', new LiteralPrimitive(1), new LiteralPrimitive(null));
  scope = createSimpleScope({});
  t.equal(expression.evaluate(scope), 1);

  expression = new Binary('+', new LiteralPrimitive(null), new LiteralPrimitive(2));
  scope = createSimpleScope({});
  t.equal(expression.evaluate(scope), 2);

  expression = new Binary('+', new LiteralPrimitive(1), new LiteralPrimitive(undefined));
  scope = createSimpleScope({});
  t.equal(expression.evaluate(scope), 1);

  expression = new Binary('+', new LiteralPrimitive(undefined), new LiteralPrimitive(2));
  scope = createSimpleScope({});
  t.equal(expression.evaluate(scope), 2);
  t.end();
});
