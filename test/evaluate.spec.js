import {evaluate, evaluateStringInterpolation} from '../src/index';
import test from 'tape';
import _ from 'lodash';

function cube(v) {
  return v*v*v;
}

test('evaluate: evaluates', t => {
  t.throws(() => evaluate(''));
  t.equal(evaluate('a', {a:2}), 2);
  t.equal(evaluate('a+b', {a:2,b:3}), 5);
  t.end();
});


test('evaluate: evaluates with primitive value as model', t => {
  t.equal(evaluate('$this === "test"', 'test'), true);
  t.equal(evaluate('$this > 1', 2), true);
  t.equal(evaluate('_.isString(name)', 'test', {_}), false);
  t.equal(evaluate('_.isString(name)', {name: 'a'}, {_}), true);
  t.end();
});

test('evaluate: evaluates special context variable $this', t => {
  t.deepEqual(evaluate('$this', {a:2}), {a:2});
  t.equal(evaluate('$this', 3), 3);
  t.equal(evaluate('$this.a', {a:2}), 2);
  t.end();
});

test('evaluate: evaluates special context variable $parent', t => {
  t.deepEqual(evaluate('$parent', {a:2}, {a:3}), {a:3});
  t.equal(evaluate('a', {a:2}, {a:3}), 2);
  t.equal(evaluate('$parent.a', {a:2}, {a:3}), 3);

  // implicit $parent
  t.equal(evaluate('b', {a:2}, {a:3,b:4}), 4);
  t.end();
});

test('evaluate: does not complain with invalid field', t => {
  t.equal(evaluate('a.c', {a:2}), undefined);
  t.equal(evaluate('a+b.c+c', {a:2,b:3}), 2);
  t.equal(evaluate('a+unknown(b)', {a:2,b:3}), 2);
  t.equal(evaluate('unknown(b)+a', {a:2,b:3}), 2);
  t.end();
});

test('evaluate: evaluates with helper', t => {
  t.equal(evaluate('cube(a)', {a:2}, {cube}), 8);
  t.equal(evaluate('a+cube(b)', {a:7,b:3}, {cube}), 34);
  t.end();
});

test('evaluate: has no access to global javascript variables', t => {
  t.equal(evaluate('parseInt(a, 10)', {a:"7"}), undefined);
  t.equal(evaluate('parseInt(a, 10)', {a:"7"}, {parseInt}), 7);

  t.equal(evaluate('parseInt(a, 10)', {a:"7"}, {
    parseInt: (...args) => parseInt(...args) * 10
  }), 70);

  t.end();
});

test('evaluate: can reject assignment', t => {
  t.throws(() => evaluate('a=1', {a:0}, null, {rejectAssignment: true}));
  t.throws(() => evaluate('b&&(a=1)', {a:0}, null, {rejectAssignment: true}));
  t.throws(() => evaluate('b&&(c||(a=1))', {a:0}, null, {rejectAssignment: true}));
  t.end();
});

test('evaluate: can evaluate string interpolation with or without back-tick', t => {
  t.equal(evaluate('`${a+1}`', {a:1}), '2');
  t.equal(evaluate('${a+1}', {a:1}, null, {stringInterpolationMode: true}), '2');
  t.equal(evaluateStringInterpolation('${a+1}', {a:1}), '2');
  t.end();
});

test('evaluate: handles false string interpolation without back-tick', t => {
  // The same expression in two mode. This also makes sure they use different cache.
  t.equal(evaluate('"${a+1}"', {a:1}), '${a+1}');
  t.equal(evaluateStringInterpolation('"${a+1}"', {a:1}), '"2"');
  t.end();
});

test('evaluate: cannot access __proto__', t => {
  const obj = {a: {}};
  t.throws(() => evaluate('__proto__', obj), /Accessing __proto__ is disallowed for security reasons/);
  t.throws(() => evaluate('__proto__.polluted', obj), /Accessing __proto__ is disallowed for security reasons/);
  t.throws(() => evaluate('__proto__.constructor', obj), /Accessing __proto__ is disallowed for security reasons/);
  t.throws(() => evaluate('__proto__.prototype', obj), /Accessing __proto__ is disallowed for security reasons/);
  t.throws(() => evaluate('a.__proto__', obj), /Accessing __proto__ is disallowed for security reasons/);
  t.throws(() => evaluate('a.__proto__.polluted', obj), /Accessing __proto__ is disallowed for security reasons/);
  t.throws(() => evaluate('a.__proto__.constructor', obj), /Accessing __proto__ is disallowed for security reasons/);
  t.end();
});

test('evaluate: cannot populate __proto__', t => {
  const obj = {a: {}};
  t.throws(() => evaluate('__proto__ = {polluted: true}', obj), /Accessing __proto__ is disallowed for security reasons/);
  t.throws(() => evaluate('__proto__.polluted = true', obj), /Accessing __proto__ is disallowed for security reasons/);
  t.throws(() => evaluate('a.__proto__.polluted = true', obj), /Accessing __proto__ is disallowed for security reasons/);
  t.equal(obj.__proto__.polluted, undefined);
  t.end();
});

test('evaluate: cannot access constructor', t => {
  const obj = {a: {}};
  t.throws(() => evaluate('constructor', obj), /Accessing constructor is disallowed for security reasons/);
  t.throws(() => evaluate('constructor.prototype', obj), /Accessing constructor is disallowed for security reasons/);
  t.throws(() => evaluate('a.constructor.prototype', obj), /Accessing constructor is disallowed for security reasons/);
  t.end();
});

test('evaluate: cannot populate constructor', t => {
  const obj = {};
  t.throws(() => evaluate('constructor = {polluted: true}', obj), /Accessing constructor is disallowed for security reasons/);
  t.equal(obj.polluted, undefined);
  t.equal(Object.prototype.polluted, undefined);

  t.throws(() =>evaluate('constructor.prototype.polluted = true', obj), /Accessing constructor is disallowed for security reasons/);
  t.equal(obj.constructor.prototype.polluted, undefined);
  t.equal(Object.prototype.polluted, undefined);
  t.end();
});

test('evaluate: cannot access prototype', t => {
  const obj = function () {};
  t.throws(() => evaluate('prototype', obj), /Accessing prototype is disallowed for security reasons/);
  t.throws(() => evaluate('prototype.constructor', obj), /Accessing prototype is disallowed for security reasons/);
  t.throws(() => evaluate('prototype.prototype', obj), /Accessing prototype is disallowed for security reasons/);
  t.throws(() => evaluate('a.b.prototype.constructor', obj), /Accessing prototype is disallowed for security reasons/);
  t.end();
});

test('evaluate: cannot populate prototype', t => {
  const obj = function () {};
  t.throws(() => evaluate('prototype = {polluted: true}', obj), /Accessing prototype is disallowed for security reasons/);
  let instance = new obj();
  t.equal(instance.polluted, undefined);
  t.equal(instance.__proto__.polluted, undefined);

  t.throws(() => evaluate('prototype.polluted = true', obj), /Accessing prototype is disallowed for security reasons/);
  instance = new obj();
  t.equal(instance.polluted, undefined);
  t.equal(instance.__proto__.polluted, undefined);
  t.end();
});
