import {Assign, AccessScope} from '../../src/ast';
import {createScope} from '../../src/scope';
import test from 'tape';

test('AST:Assign: can chain assignments', t => {
  const foo = new Assign(new AccessScope('foo'), new AccessScope('bar'));
  const scope = createScope({});
  foo.assign(scope, 1);
  t.equal(scope[0].foo, 1);
  t.equal(scope[0].bar, 1);
  t.end();
});
