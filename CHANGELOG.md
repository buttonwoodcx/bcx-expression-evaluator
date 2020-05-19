## [1.2.1](https://github.com/buttonwoodcx/bcx-expression-evaluator/compare/v1.2.0...v1.2.1) (2020-05-19)


### Bug Fixes

* babel after ncc to support es5 ([a712944](https://github.com/buttonwoodcx/bcx-expression-evaluator/commit/a712944a3891cf8a79d3b9a86f509868f7127240))



# [1.2.0](https://github.com/buttonwoodcx/bcx-expression-evaluator/compare/v1.1.0...v1.2.0) (2020-05-12)


### Features

* migrate from rollup to ncc ([5c46238](https://github.com/buttonwoodcx/bcx-expression-evaluator/commit/5c4623894c56e856217933234a1af19c724bb96f))



# [1.1.0](https://github.com/buttonwoodcx/bcx-expression-evaluator/compare/v1.0.1...v1.1.0) (2019-10-14)


### Bug Fixes

* restore original JS behaviour on other operators like >= ([ef6d088](https://github.com/buttonwoodcx/bcx-expression-evaluator/commit/ef6d088d70da87f8cb598ac5be99b1f77fef3be2)), closes [#5](https://github.com/buttonwoodcx/bcx-expression-evaluator/issues/5)


### Features

* support bitwise binary operators & | << >> >>> ([a5c303f](https://github.com/buttonwoodcx/bcx-expression-evaluator/commit/a5c303f19be73cebe8dd19435a30ca2d56801e47))



## [1.0.1](https://github.com/buttonwoodcx/bcx-expression-evaluator/compare/v1.0.0...v1.0.1) (2019-07-25)


### Bug Fixes

* fix cache collision for same expression but in two modes ([c98154e](https://github.com/buttonwoodcx/bcx-expression-evaluator/commit/c98154e))
* fix detection of start of string interpolation ([56f0aca](https://github.com/buttonwoodcx/bcx-expression-evaluator/commit/56f0aca)), closes [#4](https://github.com/buttonwoodcx/bcx-expression-evaluator/issues/4)



<a name="1.0.0"></a>
# [1.0.0](https://github.com/buttonwoodcx/bcx-expression-evaluator/compare/v0.4.0...v1.0.0) (2018-10-04)



<a name="0.4.0"></a>
# [0.4.0](https://github.com/buttonwoodcx/bcx-expression-evaluator/compare/v0.3.4...v0.4.0) (2018-08-25)


### Features

* use babel loose mode for faster/smaller code ([e6926de](https://github.com/buttonwoodcx/bcx-expression-evaluator/commit/e6926de))



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
