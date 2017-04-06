import {evaluateExpression} from '../src/index';
import test from 'tape';

function cube(v) {
  return v*v*v;
}

test('evaluateExpression: evaluates', t => {
  t.throws(() => evaluateExpression(''));
  t.equal(evaluateExpression('a', {a:2}), 2);
  t.equal(evaluateExpression('a+b', {a:2,b:3}), 5);
  t.end();
});

test('evaluateExpression: evaluates special context variable $this', t => {
  t.deepEqual(evaluateExpression('$this', {a:2}), {a:2});
  t.equal(evaluateExpression('$this', 3), 3);
  t.end();
});

test('evaluateExpression: evaluates special context variable $parent', t => {
  t.deepEqual(evaluateExpression('$parent', {a:2}, {a:3}), {a:3});
  t.equal(evaluateExpression('a', {a:2}, {a:3}), 2);
  t.equal(evaluateExpression('$parent.a', {a:2}, {a:3}), 3);

  // implicit $parent
  t.equal(evaluateExpression('b', {a:2}, {a:3,b:4}), 4);
  t.end();
});

test('evaluateExpression: does not complain with invalid field', t => {
  t.equal(evaluateExpression('a.c', {a:2}), undefined);
  t.equal(evaluateExpression('a+b.c+c', {a:2,b:3}), 2);
  t.equal(evaluateExpression('a+unknown(b)', {a:2,b:3}), 2);
  t.equal(evaluateExpression('unknown(b)+a', {a:2,b:3}), 2);
  t.end();
});

test('evaluateExpression: evaluates with helper', t => {
  t.equal(evaluateExpression('cube(a)', {a:2}, {cube}), 8);
  t.equal(evaluateExpression('a+cube(b)', {a:7,b:3}, {cube}), 34);
  t.end();
});

test('evaluateExpression: has no access to global javascript variables', t => {
  t.equal(evaluateExpression('parseInt(a, 10)', {a:"7"}), undefined);
  t.equal(evaluateExpression('parseInt(a, 10)', {a:"7"}, {parseInt}), 7);

  t.equal(evaluateExpression('parseInt(a, 10)', {a:"7"}, {
    parseInt: (...args) => parseInt(...args) * 10
  }), 70);

  t.end();
});

test('evaluateExpression: can reject assignment', t => {
  t.throws(() => evaluateExpression('a=1', {a:0}, null, {rejectAssignment: true}));
  t.throws(() => evaluateExpression('b&&(a=1)', {a:0}, null, {rejectAssignment: true}));
  t.throws(() => evaluateExpression('b&&(c||(a=1))', {a:0}, null, {rejectAssignment: true}));
  t.end();
});
