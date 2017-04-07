import {Parser} from '../src/parser';
import test from 'tape';

let parser = new Parser();

test('Unparser: should unparse', t => {
  let expressions = [
    'foo()',
    'foo(bar,baz)',
    'foo.bar.baz',
    `{'a':b,'c':d,'e':f}`,
    '[a,b,c]',
    'foo',
    // https://github.com/aurelia/binding/issues/586
    'a&&(b||c)',
    'a&&(b=1)',
    '2*(2+3)',
    '!(true?true:true)',
    '`a${b+c}\\``'
  ];
  let i = expressions.length;
  while (i--) {
    let expression = expressions[i];
    t.equal(parser.parse(expression).toString(), expression);
  }
  t.end();
});
