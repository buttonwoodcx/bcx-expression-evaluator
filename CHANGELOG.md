<a name="0.3.4"></a>
## [0.3.4](https://github.com/buttonwoodcx/bcx-expression-evaluator/compare/v0.3.3...v0.3.4) (2018-03-08)


### Bug Fixes

* fix BABEL_ENV to development to fix npm installation directly from git. ([66949e3](https://github.com/buttonwoodcx/bcx-expression-evaluator/commit/66949e3))



<a name="0.3.3"></a>
## [0.3.3](https://github.com/buttonwoodcx/bcx-expression-evaluator/compare/v0.3.2...v0.3.3) (2017-08-16)



## 0.3.3 - 16/Aug/2017

  * add basic TypeScript support.

## 0.3.2 - 02/Jun/2017

  * use "in" operator again. hasOwnProperty does not work for getter in babel compiled code, but "in" operator works.

## 0.3.1 - 01/Jun/2017

  * remove try/catch for better performance.

## 0.3.0 - 21/Apr/2017

  * revert work on simplifying scope. Find some usecase of complex aurelia-binding scope in bcx-validator.

## 0.2.0 - 20/Apr/2017

  * simplify scope. Scope now is just a stack of objects.

## 0.1.2 - 13/Apr/2017

  * fixed exception when use "in" operator on pure string bindingContext.

## 0.1.1 - 12/Apr/2017

  * add url in package.json

## 0.1.0 - 10/Apr/2017

  * initial release.
  * add string interpolation support to parser. To be backported to aurelia-binding.
