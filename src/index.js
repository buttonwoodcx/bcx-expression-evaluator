import {Parser} from './parser';
import {createOverrideContext, createSimpleScope} from './scope';

const sharedParser = new Parser();
function evaluateExpression(expression, context, helper, opts) {
  const exp = sharedParser.parse(expression, opts);
  return exp.evaluateWith(context, helper);
}

export {Parser, createOverrideContext, createSimpleScope, evaluateExpression};
