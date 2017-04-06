import {AccessThis} from '../../src/ast';
import {createOverrideContext, createSimpleScope} from '../../src/scope';
import test from 'tape';

let $parent = new AccessThis(1);
let $parent$parent = new AccessThis(2);
let $parent$parent$parent = new AccessThis(3);

test('AST:AccessThis: evaluates undefined bindingContext', t => {
  let coc = createOverrideContext;

  let scope = { overrideContext: coc(undefined) };
  t.equal($parent.evaluate(scope), undefined);
  t.equal($parent$parent.evaluate(scope), undefined);
  t.equal($parent$parent$parent.evaluate(scope), undefined);

  scope = { overrideContext: coc(undefined, coc(undefined)) };
  t.equal($parent.evaluate(scope), undefined);
  t.equal($parent$parent.evaluate(scope), undefined);
  t.equal($parent$parent$parent.evaluate(scope), undefined);

  scope = { overrideContext: coc(undefined, coc(undefined, coc(undefined))) };
  t.equal($parent.evaluate(scope), undefined);
  t.equal($parent$parent.evaluate(scope), undefined);
  t.equal($parent$parent$parent.evaluate(scope), undefined);

  scope = { overrideContext: coc(undefined, coc(undefined, coc(undefined, coc(undefined)))) };
  t.equal($parent.evaluate(scope), undefined);
  t.equal($parent$parent.evaluate(scope), undefined);
  t.equal($parent$parent$parent.evaluate(scope), undefined);
  t.end();
});

test('AST:AccessThis: evaluates null bindingContext', t => {
  let coc = createOverrideContext;

  let scope = { overrideContext: coc(null) };
  t.equal($parent.evaluate(scope), undefined);
  t.equal($parent$parent.evaluate(scope), undefined);
  t.equal($parent$parent$parent.evaluate(scope), undefined);

  scope = { overrideContext: coc(null, coc(null)) };
  t.equal($parent.evaluate(scope), null);
  t.equal($parent$parent.evaluate(scope), undefined);
  t.equal($parent$parent$parent.evaluate(scope), undefined);

  scope = { overrideContext: coc(null, coc(null, coc(null))) };
  t.equal($parent.evaluate(scope), null);
  t.equal($parent$parent.evaluate(scope), null);
  t.equal($parent$parent$parent.evaluate(scope), undefined);

  scope = { overrideContext: coc(null, coc(null, coc(null, coc(null)))) };
  t.equal($parent.evaluate(scope), null);
  t.equal($parent$parent.evaluate(scope), null);
  t.equal($parent$parent$parent.evaluate(scope), null);
  t.end();
});

test('AST:AccessThis: evaluates defined bindingContext', t => {
  let coc = createOverrideContext;
  let a = { a: 'a' };
  let b = { b: 'b' };
  let c = { c: 'c' };
  let d = { d: 'd' };
  let scope = { overrideContext: coc(a) };
  t.equal($parent.evaluate(scope), undefined);
  t.equal($parent$parent.evaluate(scope), undefined);
  t.equal($parent$parent$parent.evaluate(scope), undefined);

  scope = { overrideContext: coc(a, coc(b)) };
  t.equal($parent.evaluate(scope), b);
  t.equal($parent$parent.evaluate(scope), undefined);
  t.equal($parent$parent$parent.evaluate(scope), undefined);

  scope = { overrideContext: coc(a, coc(b, coc(c))) };
  t.equal($parent.evaluate(scope), b);
  t.equal($parent$parent.evaluate(scope), c);
  t.equal($parent$parent$parent.evaluate(scope), undefined);

  scope = { overrideContext: coc(a, coc(b, coc(c, coc(d)))) };
  t.equal($parent.evaluate(scope), b);
  t.equal($parent$parent.evaluate(scope), c);
  t.equal($parent$parent$parent.evaluate(scope), d);
  t.end();
});
