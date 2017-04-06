import {Parser} from '../src/parser';
import {
  LiteralString,
  LiteralPrimitive,
  LiteralObject,
  AccessScope,
  AccessMember,
  AccessKeyed,
  CallScope,
  CallMember,
  CallFunction,
  AccessThis,
  AccessAncestor,
  Assign
} from '../src/ast';
import test from 'tape';

let parser = new Parser();

test('Parser: parses literal primitives', t => {
  // http://es5.github.io/x7.html#x7.8.4
  let tests = [
    { expression: '\'foo\'', value: 'foo', type: LiteralString },
    { expression: '\'\\\\\'', value: '\\', type: LiteralString },
    { expression: '\'\\\'\'', value: '\'', type: LiteralString },
    { expression: '\'"\'', value: '"', type: LiteralString },
    { expression: '\'\\f\'', value: '\f', type: LiteralString },
    { expression: '\'\\n\'', value: '\n', type: LiteralString },
    { expression: '\'\\r\'', value: '\r', type: LiteralString },
    { expression: '\'\\t\'', value: '\t', type: LiteralString },
    { expression: '\'\\v\'', value: '\v', type: LiteralString },
    { expression: 'true', value: true, type: LiteralPrimitive },
    { expression: 'false', value: false, type: LiteralPrimitive },
    { expression: 'null', value: null, type: LiteralPrimitive },
    { expression: 'undefined', value: undefined, type: LiteralPrimitive },
    { expression: '0', value: 0, type: LiteralPrimitive },
    { expression: '1', value: 1, type: LiteralPrimitive },
    { expression: '2.2', value: 2.2, type: LiteralPrimitive }
  ];

  for (let i = 0; i < tests.length; i++) {
    let test = tests[i];
    let expression = parser.parse(test.expression);
    t.equal(expression instanceof test.type, true);
    t.equal(expression.value, test.value);
  }
  t.end();
});

test('Parser: parses AccessScope', t => {
  let expression = parser.parse('foo');
  t.equal(expression instanceof AccessScope, true);
  t.equal(expression.name, 'foo');
  t.end();
});

test('Parser: parses AccessMember', t => {
  let expression = parser.parse('foo.bar');
  t.equal(expression instanceof AccessMember, true);
  t.equal(expression.name, 'bar');
  t.equal(expression.object instanceof AccessScope, true);
  t.equal(expression.object.name, 'foo');
  t.end();
});

test('Parser: parses Assign', t => {
  let expression = parser.parse('foo = bar');
  t.equal(expression instanceof Assign, true);
  t.equal(expression.target instanceof AccessScope, true);
  t.equal(expression.target.name, 'foo');
  t.equal(expression.value instanceof AccessScope, true);
  t.equal(expression.value.name, 'bar');

  expression = parser.parse('foo = bar = baz');
  t.equal(expression instanceof Assign, true);
  t.equal(expression.target instanceof Assign, true);
  t.equal(expression.target.target instanceof AccessScope, true);
  t.equal(expression.target.target.name, 'foo');
  t.equal(expression.target.value instanceof AccessScope, true);
  t.equal(expression.target.value.name, 'bar');
  t.equal(expression.value instanceof AccessScope, true);
  t.equal(expression.value.name, 'baz');
  t.end();
});

test('Parser: parses CallScope', t => {
  let expression = parser.parse('foo(x)');
  t.equal(expression instanceof CallScope, true);
  t.equal(expression.name, 'foo');
  t.deepEqual(expression.args, [new AccessScope('x', 0)]);
  t.end();
});

test('Parser: parses CallMember', t => {
  let expression = parser.parse('foo.bar(x)');
  t.equal(expression instanceof CallMember, true);
  t.equal(expression.name, 'bar');
  t.deepEqual(expression.args, [new AccessScope('x', 0)]);
  t.equal(expression.object instanceof AccessScope, true);
  t.equal(expression.object.name, 'foo');
  t.end();
});

test('Parser: parses $this', t => {
  let expression = parser.parse('$this');
  t.equal(expression instanceof AccessThis, true);
  t.end();
});

test('Parser: translates $this.member to AccessScope', t => {
  let expression = parser.parse('$this.foo');
  t.equal(expression instanceof AccessScope, true);
  t.equal(expression.name, 'foo');
  t.end();
});

test('Parser: translates $this() to CallFunction', t => {
  let expression = parser.parse('$this()');
  t.equal(expression instanceof CallFunction, true);
  t.equal(expression.func instanceof AccessThis, true);
  t.end();
});

test('Parser: translates $this.member() to CallScope', t => {
  let expression = parser.parse('$this.foo(x)');
  t.equal(expression instanceof CallScope, true);
  t.equal(expression.name, 'foo');
  t.deepEqual(expression.args, [new AccessScope('x', 0)]);
  t.end();
});

test('Parser: parses $parent', t => {
  let s = '$parent';
  for (let i = 1; i < 10; i++) {
    let expression = parser.parse(s);
    t.equal(expression instanceof AccessThis, true);
    t.equal(expression.ancestor, i);
    s += '.$parent';
  }
  t.end();
});

test('Parser: translates $parent.foo to AccessScope', t => {
  let s = '$parent.foo';
  for (let i = 1; i < 10; i++) {
    let expression = parser.parse(s);
    t.equal(expression instanceof AccessScope, true);
    t.equal(expression.name, 'foo');
    t.equal(expression.ancestor, i);
    s = '$parent.' + s;
  }
  t.end();
});

test('Parser: translates $parent.foo() to CallScope', t => {
  let s = '$parent.foo()';
  for (let i = 1; i < 10; i++) {
    let expression = parser.parse(s);
    t.equal(expression instanceof CallScope, true);
    t.equal(expression.name, 'foo');
    t.equal(expression.ancestor, i);
    s = '$parent.' + s;
  }
  t.end();
});

test('Parser: translates $parent() to CallFunction', t => {
  let s = '$parent()';
  for (let i = 1; i < 10; i++) {
    let expression = parser.parse(s);
    t.equal(expression instanceof CallFunction, true);
    t.equal(expression.func instanceof AccessThis, true);
    t.equal(expression.func.ancestor, i);
    s = '$parent.' + s;
  }
  t.end();
});

test('Parser: translates $parent[0] to AccessKeyed', t => {
  let s = '$parent[0]';
  for (let i = 1; i < 10; i++) {
    let expression = parser.parse(s);
    t.equal(expression instanceof AccessKeyed, true);
    t.equal(expression.object instanceof AccessThis, true);
    t.equal(expression.object.ancestor, i);
    t.equal(expression.key instanceof LiteralPrimitive, true);
    t.equal(expression.key.value, 0);
    s = '$parent.' + s;
  }
  t.end();
});

test('Parser: handles $parent inside CallMember', t => {
  let expression = parser.parse('matcher.bind($parent)');
  t.equal(expression instanceof CallMember, true);
  t.equal(expression.name, 'bind');
  t.equal(expression.args.length, 1);
  t.equal(expression.args[0] instanceof AccessThis, true);
  t.equal(expression.args[0].ancestor, 1);
  t.end();
});

test('Parser: parses $parent in LiteralObject', t => {
  let expression = parser.parse('{parent: $parent}');
  t.equal(expression instanceof LiteralObject, true);
  t.equal(expression.keys.length, 1);
  t.deepEqual(expression.keys, ['parent']);
  t.equal(expression.values.length, 1);
  t.equal(expression.values[0] instanceof AccessThis, true);
  t.equal(expression.values[0].ancestor, 1);

  expression = parser.parse('{parent: $parent, foo: bar}');
  t.equal(expression instanceof LiteralObject, true);
  t.equal(expression.keys.length, 2);
  t.deepEqual(expression.keys, ['parent', 'foo']);
  t.equal(expression.values.length, 2);
  t.equal(expression.values[0] instanceof AccessThis, true);
  t.equal(expression.values[0].ancestor, 1);
  t.equal(expression.values[1] instanceof AccessScope, true);
  t.equal(expression.values[1].name, 'bar');
  t.end();
});

test('Parser: parses es6 shorthand LiteralObject', t => {
  let expression = parser.parse('{ foo, bar }');
  t.equal(expression instanceof LiteralObject, true);
  t.equal(expression.keys.length, 2);
  t.equal(expression.values.length, 2);

  t.equal(expression.values[0] instanceof AccessScope, true);
  t.equal(expression.values[0].name, 'foo');
  t.equal(expression.values[1] instanceof AccessScope, true);
  t.equal(expression.values[1].name, 'bar');
  t.end();
});

test('Parser: does not parse invalid shorthand properties', t => {
  let pass = false;
  try {
    parser.parse('{ foo.bar, bar.baz }');
    pass = true;
  } catch (e) { pass = false; }
  t.equal(pass, false);

  try {
    parser.parse('{ "foo.bar" }');
    pass = true;
  } catch (e) { pass = false; }
  t.equal(pass, false);
  t.end();
});

test('Parser: can reject assignment', t => {
  t.throws(() => parser.parse('a=1', {rejectAssignment: true}));
  t.throws(() => parser.parse('b&&(a=1)', {rejectAssignment: true}));
  t.throws(() => parser.parse('b&&(c||(a=1))', {rejectAssignment: true}));
  t.end();
});