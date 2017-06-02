// interface OverrideContext {
//   parentOverrideContext: OverrideContext;
//   bindingContext: any;
// }

// // view instances implement this interface
// interface Scope {
//   bindingContext: any;
//   overrideContext: OverrideContext;
// }

function has(obj, name) {
  const type = typeof obj;
  return (type === 'object' || type === 'function') && (name in obj);
}

export function createOverrideContext(bindingContext, parentOverrideContext) {
  return {
    bindingContext: bindingContext,
    parentOverrideContext: parentOverrideContext || null
  };
}

export function getContextFor(name, scope, ancestor) {
  let oc = scope.overrideContext;

  if (ancestor) {
    // jump up the required number of ancestor contexts (eg $parent.$parent requires two jumps)
    while (ancestor && oc) {
      ancestor--;
      oc = oc.parentOverrideContext;
    }
    if (ancestor || !oc) {
      return undefined;
    }
    return has(oc, name) ? oc : oc.bindingContext;
  }

  // traverse the context and it's ancestors, searching for a context that has the name.
  while (oc && !(has(oc, name)) && !(oc.bindingContext && has(oc.bindingContext, name))) {
    oc = oc.parentOverrideContext;
  }
  if (oc) {
    // we located a context with the property.  return it.
    return has(oc, name) ? oc : oc.bindingContext;
  }
  // the name wasn't found.  return the root binding context.
  return scope.bindingContext || scope.overrideContext;
}

export function createSimpleScope(bindingContext, parentBindingContext) {
  if (parentBindingContext) {
    return {
      bindingContext,
      overrideContext: createOverrideContext(bindingContext, createOverrideContext(parentBindingContext))
    };
  }
  return {
    bindingContext,
    overrideContext: createOverrideContext(bindingContext)
  };
}
