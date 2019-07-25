export class Token {
  constructor(index, text) {
    this.index = index;
    this.text = text;
  }

  withOp(op) {
    this.opKey = op;
    return this;
  }

  withGetterSetter(key) {
    this.key = key;
    return this;
  }

  withValue(value) {
    this.value = value;
    return this;
  }

  toString() {
    return `Token(${this.text})`;
  }
}

export class Lexer {
  lex(text, opts) {
    let scanner = new Scanner(text, opts);
    let tokens = [];
    let token = scanner.scanToken();

    while (token) {
      tokens.push(token);
      token = scanner.scanToken();
    }

    return tokens;
  }
}

const CONTEXT_NIL = 0; // out side of any context
const CONTEXT_OBJECT = 1; // between { and } for object
const CONTEXT_TEXT_PART_OF_STRING_INTERPOLATION = 2; // between ` and ` but out of ${ and }
const CONTEXT_INTERPOLATION_PART_OF_STRING_INTERPOLATION = 3; // between ${ and } in ``
// currently CONTEXT_NIL, CONTEXT_OBJECT, CONTEXT_INTERPOLATION_PART_OF_STRING_INTERPOLATION
// are treated same

export class Scanner {
  constructor(input, opts = {}) {
    this.input = input;
    this.length = input.length;
    this.peek = 0;
    this.index = -1;
    this.stringInterpolationMode = opts.stringInterpolationMode || false;

    const initialContext = this.stringInterpolationMode ?
                           CONTEXT_TEXT_PART_OF_STRING_INTERPOLATION :
                           CONTEXT_NIL;
    this.contextStack = [initialContext];

    this.advance();
  }

  get context() {
    return this.contextStack[this.contextStack.length - 1];
  }

  get isRootLevelOfStringInterpolationMode() {
    return this.stringInterpolationMode && this.contextStack.length === 1;
  }

  scanToken() {
    let start = this.index;

    if (this.context !== CONTEXT_TEXT_PART_OF_STRING_INTERPOLATION) {
      // normal mode, at least not in string part of interpolation

      // Skip whitespace.
      while (this.peek <= $SPACE) {
        if (++this.index >= this.length) {
          this.peek = $EOF;
          return null;
        }

        this.peek = this.input.charCodeAt(this.index);
      }

      // Handle identifiers and numbers.
      if (isIdentifierStart(this.peek)) {
        return this.scanIdentifier();
      }

      if (isDigit(this.peek)) {
        return this.scanNumber(this.index);
      }

      switch (this.peek) {
      case $PERIOD:
        this.advance();
        return isDigit(this.peek) ? this.scanNumber(start) : new Token(start, '.');

      case $LBRACE:
        this.contextStack.push(CONTEXT_OBJECT);
        return this.scanCharacter(start, String.fromCharCode(this.peek));
      case $RBRACE:
        // '}' has two meanings,
        // in CONTEXT_OBJECT, means close of object,
        // in CONTEXT_INTERPOLATION_PART_OF_STRING_INTERPOLATION, means close of interpolation
        this.contextStack.pop();
        return this.scanCharacter(start, String.fromCharCode(this.peek));
      case $LPAREN:
      case $RPAREN:
      case $LBRACKET:
      case $RBRACKET:
      case $COMMA:
      case $COLON:
      case $SEMICOLON:
        return this.scanCharacter(start, String.fromCharCode(this.peek));
      case $SQ:
      case $DQ:
        return this.scanString();
      case $PLUS:
      case $MINUS:
      case $STAR:
      case $SLASH:
      case $PERCENT:
      case $CARET:
      case $QUESTION:
        return this.scanOperator(start, String.fromCharCode(this.peek));
      case $LT:
      case $GT:
      case $BANG:
      case $EQ:
        return this.scanComplexOperator(start, $EQ, String.fromCharCode(this.peek), '=');
      case $AMPERSAND:
        return this.scanComplexOperator(start, $AMPERSAND, '&', '&');
      case $BAR:
        return this.scanComplexOperator(start, $BAR, '|', '|');
      case $BACKTICK:
        this.contextStack.push(CONTEXT_TEXT_PART_OF_STRING_INTERPOLATION);
        return this.scanCharacter(start, String.fromCharCode(this.peek));
      case $NBSP:
        while (isWhitespace(this.peek)) {
          this.advance();
        }

        return this.scanToken();
        // no default
      }

      let character = String.fromCharCode(this.peek);
      this.error(`Unexpected character [${character}]`);
      return null;
    } else {
      // in string interpolation's text part
      if (this.peek === $BACKTICK) {
        // in stringInterpolationMode, root level doesn't close at backtick
        if (this.isRootLevelOfStringInterpolationMode) {
          // backtick is part of root level string
          return this.scanString();
        } else {
          this.contextStack.pop();
          return this.scanCharacter(start, String.fromCharCode(this.peek));
        }
      } else if (this.isStartOfInterpolation()) {
        const token = this.scanStartOfInterpolation();
        this.contextStack.push(CONTEXT_INTERPOLATION_PART_OF_STRING_INTERPOLATION);
        return token;
      } else if (this.peek) {
        return this.scanString();
      }
    }
  }

  scanCharacter(start, text) {
    assert(this.peek === text.charCodeAt(0));
    this.advance();
    return new Token(start, text);
  }

  scanOperator(start, text) {
    assert(this.peek === text.charCodeAt(0));
    assert(OPERATORS.indexOf(text) !== -1);
    this.advance();
    return new Token(start, text).withOp(text);
  }

  scanComplexOperator(start, code, one, two) {
    assert(this.peek === one.charCodeAt(0));
    this.advance();

    let text = one;

    if (this.peek === code) {
      this.advance();
      text += two;
    }

    if (this.peek === code) {
      this.advance();
      text += two;
    }

    assert(OPERATORS.indexOf(text) !== -1);

    return new Token(start, text).withOp(text);
  }

  scanIdentifier() {
    assert(isIdentifierStart(this.peek));
    let start = this.index;

    this.advance();

    while (isIdentifierPart(this.peek)) {
      this.advance();
    }

    let text = this.input.substring(start, this.index);
    let result = new Token(start, text);

    // TODO(kasperl): Deal with null, undefined, true, and false in
    // a cleaner and faster way.
    if (OPERATORS.indexOf(text) !== -1) {
      result.withOp(text);
    } else {
      result.withGetterSetter(text);
    }

    return result;
  }

  scanNumber(start) {
    assert(isDigit(this.peek));
    let simple = (this.index === start);
    this.advance();  // Skip initial digit.

    while (true) { // eslint-disable-line no-constant-condition
      if (!isDigit(this.peek)) {
        if (this.peek === $PERIOD) {
          simple = false;
        } else if (isExponentStart(this.peek)) {
          this.advance();

          if (isExponentSign(this.peek)) {
            this.advance();
          }

          if (!isDigit(this.peek)) {
            this.error('Invalid exponent', -1);
          }

          simple = false;
        } else {
          break;
        }
      }

      this.advance();
    }

    let text = this.input.substring(start, this.index);
    let value = simple ? parseInt(text, 10) : parseFloat(text);
    return new Token(start, text).withValue(value);
  }

  scanString() {
    if (this.context !== CONTEXT_TEXT_PART_OF_STRING_INTERPOLATION) {
      assert(this.peek === $SQ || this.peek === $DQ);
    }

    let start = this.index;
    let quote;

    if (this.context !== CONTEXT_TEXT_PART_OF_STRING_INTERPOLATION) {
      quote = this.peek;
      this.advance();  // Skip initial quote.
    } else {
      // in pure string interpolation mode
      // no backtick to close it for root level stringInterpolationMode
      quote = this.isRootLevelOfStringInterpolationMode ? $EOF : $BACKTICK;
    }

    let buffer;
    let marker = this.index;

    while (this.peek !== quote && !this.isStartOfInterpolation()) {
      if (this.peek === $BACKSLASH) {
        if (!buffer) {
          buffer = [];
        }

        buffer.push(this.input.substring(marker, this.index));
        this.advance();

        let unescaped;

        if (this.peek === $u) {
          // TODO(kasperl): Check bounds? Make sure we have test
          // coverage for this.
          let hex = this.input.substring(this.index + 1, this.index + 5);

          if (!/[A-Z0-9]{4}/.test(hex)) {
            this.error(`Invalid unicode escape [\\u${hex}]`);
          }

          unescaped = parseInt(hex, 16);

          for (let i = 0; i < 5; ++i) {
            this.advance();
          }
        } else {
          unescaped = unescape(this.peek);
          this.advance();
        }

        buffer.push(String.fromCharCode(unescaped));
        marker = this.index;
      } else if (quote !== $EOF && this.peek === $EOF) {
        this.error('Unterminated quote');
      } else {
        this.advance();
      }
    }

    let last = this.input.substring(marker, this.index);

    if (this.context !== CONTEXT_TEXT_PART_OF_STRING_INTERPOLATION) {
      this.advance();  // Skip terminating quote.
    }

    let text = this.input.substring(start, this.index);

    // Compute the unescaped string value.
    let unescaped = last;

    if (buffer !== null && buffer !== undefined) {
      buffer.push(last);
      unescaped = buffer.join('');
    }

    return new Token(start, text).withValue(unescaped);
  }

  scanStartOfInterpolation() {
    assert(this.isStartOfInterpolation());
    let start = this.index;
    this.advance();
    this.advance();
    return new Token(start, '${');
  }

  advance() {
    if (++this.index >= this.length) {
      this.peek = $EOF;
    } else {
      this.peek = this.input.charCodeAt(this.index);
    }
  }

  error(message, offset = 0) {
    // TODO(kasperl): Try to get rid of the offset. It is only used to match
    // the error expectations in the lexer tests for numbers with exponents.
    let position = this.index + offset;
    throw new Error(`Lexer Error: ${message} at column ${position} in expression [${this.input}]`);
  }

  isStartOfInterpolation() {
    if (this.context === CONTEXT_TEXT_PART_OF_STRING_INTERPOLATION) {
      return this.peek === $$ && this.input.charCodeAt(this.index + 1) === $LBRACE;
    }
  }
}

const OPERATORS = [
  'undefined',
  'null',
  'true',
  'false',
  '+',
  '-',
  '*',
  '/',
  '%',
  '^',
  '=',
  '==',
  '===',
  '!=',
  '!==',
  '<',
  '>',
  '<=',
  '>=',
  '&&',
  '||',
  '&',
  '|',
  '!',
  '?'
];

const $EOF = 0;
const $TAB = 9;
const $LF = 10;
const $VTAB = 11;
const $FF = 12;
const $CR = 13;
const $SPACE = 32;
const $BANG = 33;
const $DQ = 34;
const $$ = 36;
const $PERCENT = 37;
const $AMPERSAND = 38;
const $SQ = 39;
const $LPAREN = 40;
const $RPAREN = 41;
const $STAR = 42;
const $PLUS = 43;
const $COMMA = 44;
const $MINUS = 45;
const $PERIOD = 46;
const $SLASH = 47;
const $COLON = 58;
const $SEMICOLON = 59;
const $LT = 60;
const $EQ = 61;
const $GT = 62;
const $QUESTION = 63;

const $0 = 48;
const $9 = 57;

const $A = 65;
const $E = 69;
const $Z = 90;

const $LBRACKET = 91;
const $BACKSLASH = 92;
const $RBRACKET = 93;
const $CARET = 94;
const $_ = 95;
const $BACKTICK = 96;

const $a = 97;
const $e = 101;
const $f = 102;
const $n = 110;
const $r = 114;
const $t = 116;
const $u = 117;
const $v = 118;
const $z = 122;

const $LBRACE = 123;
const $BAR = 124;
const $RBRACE = 125;
const $NBSP = 160;

function isWhitespace(code) {
  return (code >= $TAB && code <= $SPACE) || (code === $NBSP);
}

function isIdentifierStart(code) {
  return ($a <= code && code <= $z)
      || ($A <= code && code <= $Z)
      || (code === $_)
      || (code === $$);
}

function isIdentifierPart(code) {
  return ($a <= code && code <= $z)
      || ($A <= code && code <= $Z)
      || ($0 <= code && code <= $9)
      || (code === $_)
      || (code === $$);
}

function isDigit(code) {
  return ($0 <= code && code <= $9);
}

function isExponentStart(code) {
  return (code === $e || code === $E);
}

function isExponentSign(code) {
  return (code === $MINUS || code === $PLUS);
}

function unescape(code) {
  switch (code) {
  case $n: return $LF;
  case $f: return $FF;
  case $r: return $CR;
  case $t: return $TAB;
  case $v: return $VTAB;
  default: return code;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw message || 'Assertion failed';
  }
}
