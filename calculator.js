const display = document.getElementById('display');
const buttons = document.querySelectorAll('.buttons button');

/* get input */
buttons.forEach(button => {
  button.addEventListener('click', () => {
    const value = button.dataset.value;
    const action = button.dataset.action;

    if (value !== undefined) {
      append(value);
    } else if (action === 'clear') {
      clearDisplay();
    } else if (action === 'calculate') {
      calculate();
    }
  });
});

function append(value) {
  display.value += value;
}
/* ~get input */

/* token class */
class Token {
  constructor(type, value = null, pos = null) {
    this.type = type;   
    this.value = value; // type = Number のときだけ使う
    this.pos = pos;
  }
}

/* lexer */
/*
function tokenize(input){
  let tokens = [];
  let index = 0;
  while (index < input.length) {
    const c = input[index];

    if (isDigit(c)) {
      let num_str = c;
      index++;
      while (index < input.length && isDigit(input[index])) {
        num_str += input[index];
        index++;
      }
      tokens.push(new Token("NUMBER", num_str, index));

    } else if (c === '+') {
      tokens.push(new Token("Plus", null, index));
      index++;
    } else if (c === '-') {
      tokens.push(new Token("Minus", null, index));
      index++;
    } else if (c === '*') {
      tokens.push(new Token("Star", null, index));
      index++;
    } else if (c === '/') {
      tokens.push(new Token("Slash", null, index));
      index++;
    } else if (c === '(') {
      tokens.push(new Token("LPAREN", null, index));
      index++;
    } else if (c === ')') {
      tokens.push(new Token("RPAREN", null, index));
      index++;
    } else if (c === ' ') {
      index++;
    } else {
      tokens = [(new Token("INVALID", null, index))];
      return tokens;
    } 
  }
  tokens.push(new Token("EOF", null, index));
  return tokens;
}
*/

class Tokenizer {
  constructor(input) {
    this.input = input;
    this.index = 0;
    this.tokens = [];
  }

  tokenize() {
    while (this.index < this.input.length) {
      const c = this.input[this.index];

      /* number */
      if (isDigit(c)) {
        let num_str = c;
        this.index++;
        while (
          this.index < this.input.length &&
          isDigit(this.input[this.index])
        ) {
          num_str += this.input[this.index];
          this.index++;
        }
        this.tokens.push(
          new Token("NUMBER", num_str, this.index)
        );

      } else if (c === '+') {
        this.tokens.push(new Token("PLUS", null, this.index));
        this.index++;

      } else if (c === '-') {
        this.tokens.push(new Token("MINUS", null, this.index));
        this.index++;

      } else if (c === '*') {
        this.tokens.push(new Token("STAR", null, this.index));
        this.index++;

      } else if (c === '/') {
        this.tokens.push(new Token("SLASH", null, this.index));
        this.index++;

      } else if (c === '(') {
        this.tokens.push(new Token("LPAREN", null, this.index));
        this.index++;

      } else if (c === ')') {
        this.tokens.push(new Token("RPAREN", null, this.index));
        this.index++;

      } else if (c === ' ') {
        this.index++;

      } else {
        return [new Token("INVALID", null, this.index)];
      }
    }

    this.tokens.push(new Token("EOF", null, this.index));
    return this.tokens;
  }
}

function isDigit(c) {
  return c >= '0' && c <= '9';
}
/* ~lexer */


/* ast class */
class Expr {
  constructor() {
    if (new.target === Expr) {
      throw new Error("calc: Expr is abstract");
    }
  }

  toString(){
    throw new Error("calc: toString not implemented");
  }
}

class NumberExpr extends Expr{
  constructor(num) {
    super();
    this.num = num;
  }
}
class BinaryExpr extends Expr{
  constructor(op, left, right) {
    super();
    this.op = op;
    this.left = left;
    this.right = right;
  }
}


/* parsers */

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }

  current() {
    return this.tokens[this.pos];
  }

  advance() {
    return this.tokens[this.pos++];
  }

  parseExpression() {
    let expr = this.parseTerm();

    while (true) {
      const token = this.current();

      if (token.type === 'PLUS' || token.type === 'MINUS') {
        this.advance();
        const right = this.parseTerm();
        expr = new BinaryExpr(token.type, expr, right);
      } else {
        break;
      }
    }
    return expr;
  }

  parseTerm() {
    let expr = this.parseFactor();
    while (true) {
      const token = this.current();
      if (token.type === 'STAR' || token.type === 'SLASH') {
        this.advance();
        const right = this.parseFactor();
        expr = new BinaryExpr(token.type, expr, right);
      } else {
        break;
      }
    }
    return expr;
  }

  parseFactor() {
    const token = this.current();
    
    if (token.type == 'NUMBER') {
      this.advance();
      return new NumberExpr(Number(token.value));
    }

    if (token.type === 'LPAREN') {
      this.advance();                 // '(' を食う
      const expr = this.parseExpression();
      if (this.current().type !== 'RPAREN') {
        throw new Error("calc: expected ')'");
      }
      this.advance();                 // ')' を食う
      return expr;
    }

    throw new Error("calc: expected factor");
  }
}

/* ~parsers */

function go(input){
  const t = new Tokenizer(input);
  const a = new Parser(t.tokenize());
  return a.parseExpression(); 
}

function clearDisplay() {
  display.value = '';
}

function calculate() {
  return 0;
  /*
  try {
    display.value = eval(display.value);
  } catch (e) {
    display.value = 'エラー';
  }
    */
}
