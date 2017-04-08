import {Parser} from './parser';
import {createOverrideContext, createSimpleScope} from './scope';

const sharedParser = new Parser();
function evaluate(expression, context, helper, opts) {
  const exp = sharedParser.parse(expression, opts);
  return exp.evaluateWith(context, helper);
}

function evaluateStringInterpolation(expression, context, helper, opts = {}) {
  return evaluate(expression, context, helper, {...opts, stringInterpolationMode: true});
};

export {Parser, createOverrideContext, createSimpleScope, evaluate, evaluateStringInterpolation};
