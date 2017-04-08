#bcx-expression-evaluator

Safely evaluate an Javascript like expression in given context.

In Buttonwood, we heavily use meta-data (JSON format) to deliver business logic from backend to front-end. We don't want to design a meta-data format too complex to maintain, this tool allows us to define some light logic in pure string, way more flexible than rigid meta-data, much safer and more maintainable than passing js function as string (we did that) from backend to front-end.

This tool was mainly extracted, modified and extended from the expression parser of [aurelia-binding](https://github.com/aurelia/binding).

## Install

    npm install bcx-expression-evaluator

## Document

`function evaluate(expression, context, helper, opts)`

  * `expression`: the expression string to be evaluated
  * `context`: the input model object
  * `helper`: optional helper object
  * `opts`: optional hashmap, current only support `rejectAssignment` and `stringInterpolationMode`

## Usage (in es6 syntax)

    import {evaluate, evaluateStringInterpolation} from 'bcx-expression-evaluator';

    const context = {
      a: 1,
      b: 2,
      c: {
        one: 'one',
        two: 'two'
      },
      avg: function() { return (this.a + this.b) / 2; }
    };

    var expression = 'avg() > a ? c.one : c.two';
    evaluate(expression, context);  // => 'one';


### use some helper

    const helper = {
      limit: 5,
      sum: (v1, v2) => v1 + v2
    };

    expression = 'sum(a, b) > limit'
    evaluate(expression, context, helper);  // => false;

### access context object itself with special `$this` variable

    evaluate('$this', context); // => the context object
    evaluate('$this.a', context); // => 1

### explicitly access helper object with special `$parent` variable

    evaluate('a', {a:1}, {a:2}); // => 1
    evaluate('$this.a', {a:1}, {a:2}); // => 1
    evaluate('$parent.a', {a:1}, {a:2}); // => 2

### support es6 string interpolation

    evaluate('`${a+1}`', {a:1}); // => '2'

You can evaluate a string interpolation without backtick "`"

    evaluate('${a+1}', {a:1}, null, {stringInterpolationMode: true}); // => '2'
    evaluateStringInterpolation('${a+1}', {a:1}); // => '2'

### safe. it is not an eval in Javascript, doesn't have access to global javascript objects

    evaluate('parseInt(a, 10)', {a:"7"}) // => undefined

    // only have access to context and helper
    evaluate('parseInt(a, 10)', {a:"7"}, {parseInt: parseInt}) // => 7

### silent most of the time

    evaluate('a.b', {}) // => undefined, no error throwed
    evaluate('a.b || c', {c: 'lorem'}) // => 'lorem', no error throwed

### you can use assignment to mutate context object (or even helper object)

    const obj = {a: 1, b: 2};
    evaluate('a = 3', obj); // obj is now {a: 3, b: 2}
    evaluate('b > 3 ? (a = true) : (a = false)', obj); // obj is now {a: false, b: 2}

### disable assignment if you don't need it
This doesn't eliminate side effect, it would not prevent any function you called in the expression to mutate something.

    evaluate('a=1', {a:0}, null, {rejectAssignment: true}); // throws error

[BUTTONWOODCX™ PTY LTD](http://www.buttonwood.com.au).
