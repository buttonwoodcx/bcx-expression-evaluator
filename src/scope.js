// simplified aurelia binding scope
// scope is now a stack of binding context
// [ bindingContext, parentBindingContext, grantParentBindingContext, ...]

function has(obj, name) {
  let result = false;
  try { result = name in obj; } catch (e) {}
  return result;
}

export function getContextFor(name, scope, ancestor = 0) {
  let depth = scope.length;
  let level = ancestor;

  while (level < depth && !has(scope[level], name)) {
    level += 1;
  }

  if (level >= depth) {
    // the name wasn't found.  return the root binding context.
    return scope[0];
  } else {
    return scope[level];
  }
}

export function createScope(...bindingContexts) {
  if (bindingContexts) return bindingContexts;
  return [undefined];
}
