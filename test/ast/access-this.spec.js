import {AccessThis} from '../../src/ast';
import {createScope} from '../../src/scope';
import test from 'tape';

let $parent = new AccessThis(1);
let $parent$parent = new AccessThis(2);
let $parent$parent$parent = new AccessThis(3);

test('AST:AccessThis: evaluates undefined bindingContext', t => {
  let scope = createScope();
  t.equal($parent.evaluate(scope), undefined);
  t.equal($parent$parent.evaluate(scope), undefined);
  t.equal($parent$parent$parent.evaluate(scope), undefined);

  scope = createScope(undefined, undefined, undefined);
  t.equal($parent.evaluate(scope), undefined);
  t.equal($parent$parent.evaluate(scope), undefined);
  t.equal($parent$parent$parent.evaluate(scope), undefined);

  scope = createScope(undefined, undefined, undefined, undefined);
  t.equal($parent.evaluate(scope), undefined);
  t.equal($parent$parent.evaluate(scope), undefined);
  t.equal($parent$parent$parent.evaluate(scope), undefined);

  scope = createScope(undefined, undefined, undefined, undefined, undefined);
  t.equal($parent.evaluate(scope), undefined);
  t.equal($parent$parent.evaluate(scope), undefined);
  t.equal($parent$parent$parent.evaluate(scope), undefined);
  t.end();
});

test('AST:AccessThis: evaluates null bindingContext', t => {
  let scope = createScope(null);
  t.equal($parent.evaluate(scope), undefined);
  t.equal($parent$parent.evaluate(scope), undefined);
  t.equal($parent$parent$parent.evaluate(scope), undefined);

  scope = createScope(null, null);
  t.equal($parent.evaluate(scope), null);
  t.equal($parent$parent.evaluate(scope), undefined);
  t.equal($parent$parent$parent.evaluate(scope), undefined);

  scope = createScope(null, null, null);
  t.equal($parent.evaluate(scope), null);
  t.equal($parent$parent.evaluate(scope), null);
  t.equal($parent$parent$parent.evaluate(scope), undefined);

  scope = createScope(null, null, null, null);
  t.equal($parent.evaluate(scope), null);
  t.equal($parent$parent.evaluate(scope), null);
  t.equal($parent$parent$parent.evaluate(scope), null);
  t.end();
});

test('AST:AccessThis: evaluates defined bindingContext', t => {
  let a = { a: 'a' };
  let b = { b: 'b' };
  let c = { c: 'c' };
  let d = { d: 'd' };
  let scope = createScope(a);
  t.equal($parent.evaluate(scope), undefined);
  t.equal($parent$parent.evaluate(scope), undefined);
  t.equal($parent$parent$parent.evaluate(scope), undefined);

  scope = createScope(a, b);
  t.equal($parent.evaluate(scope), b);
  t.equal($parent$parent.evaluate(scope), undefined);
  t.equal($parent$parent$parent.evaluate(scope), undefined);

  scope = createScope(a, b, c);
  t.equal($parent.evaluate(scope), b);
  t.equal($parent$parent.evaluate(scope), c);
  t.equal($parent$parent$parent.evaluate(scope), undefined);

  scope = createScope(a, b, c, d);
  t.equal($parent.evaluate(scope), b);
  t.equal($parent$parent.evaluate(scope), c);
  t.equal($parent$parent$parent.evaluate(scope), d);
  t.end();
});
