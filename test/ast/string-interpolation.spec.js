import {StringInterpolation, LiteralString, LiteralPrimitive} from '../../src/ast';
import test from 'tape';

test('AST:StringInterpolation: evaluate string', t => {
  let expression = new StringInterpolation([new LiteralString('a')]);
  t.equal(expression.evaluate(), 'a');
  t.end();
});


test('AST:StringInterpolation: evaluate expression', t => {
  let expression = new StringInterpolation([new LiteralPrimitive(null)]);
  t.equal(expression.evaluate(), 'null');
  t.end();
});


test('AST:StringInterpolation: evaluate string and expression', t => {
  let expression = new StringInterpolation([
    new LiteralString('a'),
    new LiteralPrimitive(null)
  ]);
  t.equal(expression.evaluate(), 'anull');

  expression = new StringInterpolation([
    new LiteralString('a'),
    new LiteralPrimitive(null),
    new LiteralString('a')
  ]);
  t.equal(expression.evaluate(), 'anulla');

  expression = new StringInterpolation([
    new LiteralPrimitive(null),
    new LiteralString('a'),
    new LiteralPrimitive(null)
  ]);
  t.equal(expression.evaluate(), 'nullanull');

  expression = new StringInterpolation([
    new LiteralPrimitive(null),
    new LiteralPrimitive(null),
    new LiteralString('a')
  ]);
  t.equal(expression.evaluate(), 'nullnulla');

  t.end();
});

