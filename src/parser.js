import {Lexer, Token} from './lexer';
import {
  Assign, Conditional,
  AccessThis, AccessScope, AccessMember, AccessKeyed,
  CallScope, CallFunction, CallMember,
  PrefixNot, Binary,
  LiteralPrimitive, LiteralArray, LiteralObject, LiteralString,
  StringInterpolation
} from './ast';

let EOF = new Token(-1, null);

export class Parser {
  constructor() {
    this.cache = {};
    this.lexer = new Lexer();
  }

  parse(input, opts = {}) {
    input = input || '';

    const hashKey = input + ':' + JSON.stringify(opts);

    if (!this.cache[hashKey]) {
      const parserImp = new ParserImplementation(this.lexer, input, opts);
      this.cache[hashKey] = parserImp.parseExpression();

      let exp = '';
      for (let i = 0, length = parserImp.tokens.length; i < length; ++i) {
        exp += parserImp.tokens[i].text;
      }

      this.cache[hashKey].toString = function() {
        return exp;
      };
    }

    return this.cache[hashKey];
  }
}

export class ParserImplementation {
  constructor(lexer, input, opts = {}) {
    this.rejectAssignment = opts.rejectAssignment || false;
    this.stringInterpolationMode = opts.stringInterpolationMode || false;
    this.index = 0;
    this.input = input;
    this.tokens = lexer.lex(input, {stringInterpolationMode: this.stringInterpolationMode});
  }

  get peek() {
    return (this.index < this.tokens.length) ? this.tokens[this.index] : EOF;
  }

  parseExpression() {
    if (this.index === 0 && this.stringInterpolationMode) {
      return this.parseStringInterpolation(true);
    }

    let start = this.peek.index;
    let result = this.parseConditional();

    while (this.peek.text === '=') {
      if (this.rejectAssignment) {
        this.error('assignment is not allowed');
      }

      if (!result.isAssignable) {
        let end = (this.index < this.tokens.length) ? this.peek.index : this.input.length;
        let expression = this.input.substring(start, end);

        this.error(`Expression ${expression} is not assignable`);
      }

      this.expect('=');
      result = new Assign(result, this.parseConditional());
    }

    return result;
  }

  parseConditional() {
    let start = this.peek.index;
    let result = this.parseLogicalOr();

    if (this.optional('?')) {
      let yes = this.parseExpression();

      if (!this.optional(':')) {
        let end = (this.index < this.tokens.length) ? this.peek.index : this.input.length;
        let expression = this.input.substring(start, end);

        this.error(`Conditional expression ${expression} requires all 3 expressions`);
      }

      let no = this.parseExpression();
      result = new Conditional(result, yes, no);
    }

    return result;
  }

  parseLogicalOr() {
    let result = this.parseLogicalAnd();

    while (this.optional('||')) {
      result = new Binary('||', result, this.parseLogicalAnd());
    }

    return result;
  }

  parseLogicalAnd() {
    let result = this.parseEquality();

    while (this.optional('&&')) {
      result = new Binary('&&', result, this.parseEquality());
    }

    return result;
  }

  parseEquality() {
    let result = this.parseRelational();

    while (true) { // eslint-disable-line no-constant-condition
      if (this.optional('==')) {
        result = new Binary('==', result, this.parseRelational());
      } else if (this.optional('!=')) {
        result = new Binary('!=', result, this.parseRelational());
      } else if (this.optional('===')) {
        result = new Binary('===', result, this.parseRelational());
      } else if (this.optional('!==')) {
        result = new Binary('!==', result, this.parseRelational());
      } else {
        return result;
      }
    }
  }

  parseRelational() {
    let result = this.parseAdditive();

    while (true) { // eslint-disable-line no-constant-condition
      if (this.optional('<')) {
        result = new Binary('<', result, this.parseAdditive());
      } else if (this.optional('>')) {
        result = new Binary('>', result, this.parseAdditive());
      } else if (this.optional('<=')) {
        result = new Binary('<=', result, this.parseAdditive());
      } else if (this.optional('>=')) {
        result = new Binary('>=', result, this.parseAdditive());
      } else {
        return result;
      }
    }
  }

  parseAdditive() {
    let result = this.parseMultiplicative();

    while (true) { // eslint-disable-line no-constant-condition
      if (this.optional('+')) {
        result = new Binary('+', result, this.parseMultiplicative());
      } else if (this.optional('-')) {
        result = new Binary('-', result, this.parseMultiplicative());
      } else {
        return result;
      }
    }
  }

  parseMultiplicative() {
    let result = this.parsePrefix();

    while (true) { // eslint-disable-line no-constant-condition
      if (this.optional('*')) {
        result = new Binary('*', result, this.parsePrefix());
      } else if (this.optional('%')) {
        result = new Binary('%', result, this.parsePrefix());
      } else if (this.optional('/')) {
        result = new Binary('/', result, this.parsePrefix());
      } else {
        return result;
      }
    }
  }

  parsePrefix() {
    if (this.optional('+')) {
      return this.parsePrefix(); // TODO(kasperl): This is different than the original parser.
    } else if (this.optional('-')) {
      return new Binary('-', new LiteralPrimitive(0), this.parsePrefix());
    } else if (this.optional('!')) {
      return new PrefixNot('!', this.parsePrefix());
    }

    return this.parseAccessOrCallMember();
  }

  parseAccessOrCallMember() {
    let result = this.parsePrimary();

    while (true) { // eslint-disable-line no-constant-condition
      if (this.optional('.')) {
        let name = this.peek.text; // TODO(kasperl): Check that this is an identifier. Are keywords okay?

        this.advance();

        if (this.optional('(')) {
          let args = this.parseExpressionList(')');
          this.expect(')');
          if (result instanceof AccessThis) {
            result = new CallScope(name, args, result.ancestor);
          } else {
            result = new CallMember(result, name, args);
          }
        } else {
          if (result instanceof AccessThis) {
            result = new AccessScope(name, result.ancestor);
          } else {
            result = new AccessMember(result, name);
          }
        }
      } else if (this.optional('[')) {
        let key = this.parseExpression();
        this.expect(']');
        result = new AccessKeyed(result, key);
      } else if (this.optional('(')) {
        let args = this.parseExpressionList(')');
        this.expect(')');
        result = new CallFunction(result, args);
      } else {
        return result;
      }
    }
  }

  parseStringInterpolation(rootLevel) {
    let parts = [];

    // in stringInterpolationMode, root level ends at EOF,
    // nested level ends at backtick "`"
    while (rootLevel ? (this.peek !== EOF) : (this.peek !== EOF && this.peek.text !== '`')) {
      if (this.optional('${')) {
        let part = this.parseExpression();
        this.expect('}');
        parts.push(part);
      } else if (typeof this.peek.value === 'string') {
        let value = this.peek.value;
         this.advance();
        parts.push(new LiteralString(value));
      }
    }

    return new StringInterpolation(parts);
  }

  parsePrimary() {
    if (this.optional('(')) {
      let result = this.parseExpression();
      this.expect(')');
      return result;
    } else if (this.optional('`')) {
      let result = this.parseStringInterpolation();
      this.expect('`');
      return result;
    } else if (this.optional('null')) {
      return new LiteralPrimitive(null);
    } else if (this.optional('undefined')) {
      return new LiteralPrimitive(undefined);
    } else if (this.optional('true')) {
      return new LiteralPrimitive(true);
    } else if (this.optional('false')) {
      return new LiteralPrimitive(false);
    } else if (this.optional('[')) {
      let elements = this.parseExpressionList(']');
      this.expect(']');
      return new LiteralArray(elements);
    } else if (this.peek.text === '{') {
      return this.parseObject();
    } else if (this.peek.key !== null && this.peek.key !== undefined) {
      return this.parseAccessOrCallScope();
    } else if (this.peek.value !== null && this.peek.value !== undefined) {
      let value = this.peek.value;
      this.advance();
      return value instanceof String || typeof value === 'string' ? new LiteralString(value) : new LiteralPrimitive(value);
    } else if (this.index >= this.tokens.length) {
      throw new Error(`Unexpected end of expression: ${this.input}`);
    } else {
      this.error(`Unexpected token ${this.peek.text}`);
    }
  }

  parseAccessOrCallScope()  {
    let name = this.peek.key;

    this.advance();

    if (name === '$this') {
      return new AccessThis(0);
    }

    let ancestor = 0;
    while (name === '$parent') {
      ancestor++;
      if (this.optional('.')) {
        name = this.peek.key;
        this.advance();
      } else if (this.peek === EOF
        || this.peek.text === '('
        || this.peek.text === ')'
        || this.peek.text === '['
        || this.peek.text === '}'
        || this.peek.text === ','
      ) {
        return new AccessThis(ancestor);
      } else {
        this.error(`Unexpected token ${this.peek.text}`);
      }
    }

    if (this.optional('(')) {
      let args = this.parseExpressionList(')');
      this.expect(')');
      return new CallScope(name, args, ancestor);
    }

    return new AccessScope(name, ancestor);
  }

  parseObject() {
    let keys = [];
    let values = [];

    this.expect('{');

    if (this.peek.text !== '}') {
      do {
        // TODO(kasperl): Stricter checking. Only allow identifiers
        // and strings as keys. Maybe also keywords?
        let peek = this.peek;
        let value = peek.value;
        keys.push(typeof value === 'string' ? value : peek.text);

        this.advance();
        if (peek.key && (this.peek.text === ',' || this.peek.text === '}')) {
          --this.index;
          values.push(this.parseAccessOrCallScope());
        } else {
          this.expect(':');
          values.push(this.parseExpression());
        }
      } while (this.optional(','));
    }

    this.expect('}');

    return new LiteralObject(keys, values);
  }

  parseExpressionList(terminator) {
    let result = [];

    if (this.peek.text !== terminator) {
      do {
        result.push(this.parseExpression());
      } while (this.optional(','));
    }

    return result;
  }

  optional(text) {
    if (this.peek.text === text) {
      this.advance();
      return true;
    }

    return false;
  }

  expect(text) {
    if (this.peek.text === text) {
      this.advance();
    } else {
      this.error(`Missing expected ${text}`);
    }
  }

  advance() {
    this.index++;
  }

  error(message) {
    let location = (this.index < this.tokens.length)
        ? `at column ${this.tokens[this.index].index + 1} in`
        : 'at the end of the expression';

    throw new Error(`Parser Error: ${message} ${location} [${this.input}]`);
  }
}
