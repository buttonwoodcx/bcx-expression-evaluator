import {Parser} from './parser';
import {createOverrideContext, createSimpleScope} from './scope';

const sharedParser = new Parser();
function evaluateExpression(expression, model, helper, opts) {
  const exp = sharedParser.parse(expression, opts);
  return exp.evaluateWith(model, helper);
}

export {Parser, createOverrideContext, createSimpleScope, evaluateExpression};
