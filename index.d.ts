interface OverrideContext {
  parentOverrideContext: OverrideContext;
  bindingContext: any;
}

interface Scope {
  bindingContext: any;
  overrideContext: OverrideContext;
}

export declare const createOverrideContext: (bindingContext: any, parentOverrideContext: any) => OverrideContext;
export declare const createSimpleScope: (bindingContext: any, parentBindingContext: any) => Scope;

interface parserOptions {
  stringInterpolationMode?: boolean;
  rejectAssignment?: boolean;
}

interface Expression {
  evaluate(scope: Scope, args?: any): any;
  evaludateWith(bindingContext: any, parentBindingContext?: any, args?: any): any;
}

export declare class Parser {
  parse(input: string, opts?: parserOptions): Expression;
}

export declare const evaluate: (expression: string, context?: any, helper?: any, opts?: parserOptions) => any;
export declare const evaluateStringInterpolation: (expression: string, context?: any, helper?: any, opts?: parserOptions) => any;
