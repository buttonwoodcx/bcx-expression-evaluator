import {Unparser} from './unparser';
import {getContextFor, createScope} from './scope';

export class Expression {
  constructor() {
    this.isAssignable = false;
  }

  evaluate(scope, args) {
    throw new Error(`Binding expression "${this}" cannot be evaluated.`);
  }

  evaluateWith(bindingContext, parentBindingContext, args) {
    return this.evaluate(createScope(bindingContext, parentBindingContext), args);
  }

  assign(scope, value) {
    throw new Error(`Binding expression "${this}" cannot be assigned to.`);
  }

  toString() {
    return typeof FEATURE_NO_UNPARSER === 'undefined' ?
      Unparser.unparse(this) :
      super.toString();
  }
}

export class Assign extends Expression {
  constructor(target, value) {
    super();

    this.target = target;
    this.value = value;
    this.isAssignable = true;
  }

  evaluate(scope) {
    return this.target.assign(scope, this.value.evaluate(scope));
  }

  accept(vistor) {
    vistor.visitAssign(this);
  }

  assign(scope, value) {
    this.value.assign(scope, value);
    this.target.assign(scope, value);
  }
}

export class Conditional extends Expression {
  constructor(condition, yes, no) {
    super();

    this.condition = condition;
    this.yes = yes;
    this.no = no;
  }

  evaluate(scope) {
    return (!!this.condition.evaluate(scope)) ? this.yes.evaluate(scope) : this.no.evaluate(scope);
  }

  accept(visitor) {
    return visitor.visitConditional(this);
  }
}

export class AccessThis extends Expression {
  constructor(ancestor) {
    super();
    this.ancestor = ancestor || 0;
  }

  evaluate(scope) {
    return scope[this.ancestor];
  }

  accept(visitor) {
    return visitor.visitAccessThis(this);
  }
}

export class AccessScope extends Expression {
  constructor(name, ancestor) {
    super();

    this.name = name;
    this.ancestor = ancestor;
    this.isAssignable = true;
  }

  evaluate(scope) {
    let context = getContextFor(this.name, scope, this.ancestor);
    return context ? context[this.name] : undefined;
  }

  assign(scope, value) {
    let context = getContextFor(this.name, scope, this.ancestor);
    return context ? (context[this.name] = value) : undefined;
  }

  accept(visitor) {
    return visitor.visitAccessScope(this);
  }
}

export class AccessMember extends Expression {
  constructor(object, name) {
    super();

    this.object = object;
    this.name = name;
    this.isAssignable = true;
  }

  evaluate(scope) {
    let instance = this.object.evaluate(scope);
    return instance === null || instance === undefined ? instance : instance[this.name];
  }

  assign(scope, value) {
    let instance = this.object.evaluate(scope);

    if (instance === null || instance === undefined) {
      instance = {};
      this.object.assign(scope, instance);
    }

    instance[this.name] = value;
    return value;
  }

  accept(visitor) {
    return visitor.visitAccessMember(this);
  }
}

export class AccessKeyed extends Expression {
  constructor(object, key) {
    super();

    this.object = object;
    this.key = key;
    this.isAssignable = true;
  }

  evaluate(scope) {
    let instance = this.object.evaluate(scope);
    let lookup = this.key.evaluate(scope);
    return getKeyed(instance, lookup);
  }

  assign(scope, value) {
    let instance = this.object.evaluate(scope);
    let lookup = this.key.evaluate(scope);
    return setKeyed(instance, lookup, value);
  }

  accept(visitor) {
    return visitor.visitAccessKeyed(this);
  }
}

export class CallScope extends Expression {
  constructor(name, args, ancestor) {
    super();

    this.name = name;
    this.args = args;
    this.ancestor = ancestor;
  }

  evaluate(scope, mustEvaluate) {
    let args = evalList(scope, this.args);
    let context = getContextFor(this.name, scope, this.ancestor);
    let func = getFunction(context, this.name, mustEvaluate);
    if (func) {
      return func.apply(context, args);
    }
    return undefined;
  }

  accept(visitor) {
    return visitor.visitCallScope(this);
  }
}

export class CallMember extends Expression {
  constructor(object, name, args) {
    super();

    this.object = object;
    this.name = name;
    this.args = args;
  }

  evaluate(scope, mustEvaluate) {
    let instance = this.object.evaluate(scope);
    let args = evalList(scope, this.args);
    let func = getFunction(instance, this.name, mustEvaluate);
    if (func) {
      return func.apply(instance, args);
    }
    return undefined;
  }

  accept(visitor) {
    return visitor.visitCallMember(this);
  }
}

export class CallFunction extends Expression {
  constructor(func, args) {
    super();

    this.func = func;
    this.args = args;
  }

  evaluate(scope, mustEvaluate) {
    let func = this.func.evaluate(scope);
    if (typeof func === 'function') {
      return func.apply(null, evalList(scope, this.args));
    }
    if (!mustEvaluate && (func === null || func === undefined)) {
      return undefined;
    }
    throw new Error(`${this.func} is not a function`);
  }

  accept(visitor) {
    return visitor.visitCallFunction(this);
  }
}

export class Binary extends Expression {
  constructor(operation, left, right) {
    super();

    this.operation = operation;
    this.left = left;
    this.right = right;
  }

  evaluate(scope) {
    let left = this.left.evaluate(scope);

    switch (this.operation) {
    case '&&': return left && this.right.evaluate(scope);
    case '||': return left || this.right.evaluate(scope);
    // no default
    }

    let right = this.right.evaluate(scope);

    switch (this.operation) {
    case '==' : return left == right; // eslint-disable-line eqeqeq
    case '===': return left === right;
    case '!=' : return left != right; // eslint-disable-line eqeqeq
    case '!==': return left !== right;
    // no default
    }

    // Null check for the operations.
    if (left === null || right === null || left === undefined || right === undefined) {
      switch (this.operation) {
      case '+':
        if (left !== null && left !== undefined) return left;
        if (right !== null && right !== undefined) return right;
        return 0;
      case '-':
        if (left !== null && left !== undefined) return left;
        if (right !== null && right !== undefined) return 0 - right;
        return 0;
      // no default
      }

      return null;
    }

    switch (this.operation) {
    case '+'  : return autoConvertAdd(left, right);
    case '-'  : return left - right;
    case '*'  : return left * right;
    case '/'  : return left / right;
    case '%'  : return left % right;
    case '<'  : return left < right;
    case '>'  : return left > right;
    case '<=' : return left <= right;
    case '>=' : return left >= right;
    case '^'  : return left ^ right;
    // no default
    }

    throw new Error(`Internal error [${this.operation}] not handled`);
  }

  accept(visitor) {
    return visitor.visitBinary(this);
  }
}

export class PrefixNot extends Expression {
  constructor(operation, expression) {
    super();

    this.operation = operation;
    this.expression = expression;
  }

  evaluate(scope) {
    return !this.expression.evaluate(scope);
  }

  accept(visitor) {
    return visitor.visitPrefix(this);
  }
}

export class LiteralPrimitive extends Expression {
  constructor(value) {
    super();

    this.value = value;
  }

  evaluate(scope) {
    return this.value;
  }

  accept(visitor) {
    return visitor.visitLiteralPrimitive(this);
  }
}

export class LiteralString extends Expression {
  constructor(value) {
    super();

    this.value = value;
  }

  evaluate(scope) {
    return this.value;
  }

  accept(visitor) {
    return visitor.visitLiteralString(this);
  }
}

export class LiteralArray extends Expression {
  constructor(elements) {
    super();

    this.elements = elements;
  }

  evaluate(scope) {
    let elements = this.elements;
    let result = [];

    for (let i = 0, length = elements.length; i < length; ++i) {
      result[i] = elements[i].evaluate(scope);
    }

    return result;
  }

  accept(visitor) {
    return visitor.visitLiteralArray(this);
  }
}

export class LiteralObject extends Expression {
  constructor(keys, values) {
    super();

    this.keys = keys;
    this.values = values;
  }

  evaluate(scope) {
    let instance = {};
    let keys = this.keys;
    let values = this.values;

    for (let i = 0, length = keys.length; i < length; ++i) {
      instance[keys[i]] = values[i].evaluate(scope);
    }

    return instance;
  }

  accept(visitor) {
    return visitor.visitLiteralObject(this);
  }
}

export class StringInterpolation extends Expression {
  constructor(parts) {
    super();

    this.parts = parts;
  }

  evaluate(scope) {
    let parts = this.parts;
    let result = '';

    for (let i = 0, length = parts.length; i < length; ++i) {
      result += parts[i].evaluate(scope);
    }

    return result;
  }

  accept(visitor) {
    return visitor.visitStringInterpolation(this);
  }
}

/// Evaluate the [list] in context of the [scope].
function evalList(scope, list) {
  const length = list.length;
  const result = [];
  for (let i = 0; i < length; i++) {
    result[i] = list[i].evaluate(scope);
  }
  return result;
}

/// Add the two arguments with automatic type conversion.
function autoConvertAdd(a, b) {
  if (a !== null && b !== null) {
    // TODO(deboer): Support others.
    if (typeof a === 'string' && typeof b !== 'string') {
      return a + b.toString();
    }

    if (typeof a !== 'string' && typeof b === 'string') {
      return a.toString() + b;
    }

    return a + b;
  }

  if (a !== null) {
    return a;
  }

  if (b !== null) {
    return b;
  }

  return 0;
}

function getFunction(obj, name, mustExist) {
  let func = obj === null || obj === undefined ? null : obj[name];
  if (typeof func === 'function') {
    return func;
  }
  if (!mustExist && (func === null || func === undefined)) {
    return null;
  }
  throw new Error(`${name} is not a function`);
}

function getKeyed(obj, key) {
  if (Array.isArray(obj)) {
    return obj[parseInt(key, 10)];
  } else if (obj) {
    return obj[key];
  } else if (obj === null || obj === undefined) {
    return undefined;
  }

  return obj[key];
}

function setKeyed(obj, key, value) {
  if (Array.isArray(obj)) {
    let index = parseInt(key, 10);

    if (obj.length <= index) {
      obj.length = index + 1;
    }

    obj[index] = value;
  } else {
    obj[key] = value;
  }

  return value;
}
