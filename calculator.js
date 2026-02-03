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

window.addEventListener('keydown', (event) => {
  const key = event.key;
  function deleteLastCharacter(){
    display.value = display.value.slice(0, -1);
  }

  if (/^[0-9]$/.test(key) || ['+', '-', '*', '/', '.', '(', ')'].includes(key)) {
    display.value += key;
  }
  else if (key === 'Backspace') {
    deleteLastCharacter(); 
  }
  else if (key === 'Enter' || key === '=') {
    calculate();
  }
  else if (key === 'c' || key === '!') {
    clearDisplay();
  }
});
/*
window.addEventListener('keydown', (event) => {
  const key = event.key;

  // 数字キー (0-9) の場合
  if (/[0-9]/.test(key)) {
    appendNumber(key); 
  }
  // 演算子 (+, -, *, /) の場合
  else if (['+', '-', '*', '/'].includes(key)) {
    setOperator(key);
  }
  // 計算実行 (Enter または =) の場合
  else if (key === 'Enter' || key === '=') {
    calculate();
  }
  // 消去 (Escape または Backspace) の場合
  else if (key === 'Escape') {
    clearDisplay();
  }
});
*/
function append(value) {
  display.value += value;
}
/* ~get input */

/* token class */
const TokenType = {
  PLUS:   'PLUS',   // 加算（+）
  MINUS:  'MINUS',  // 減算（-）
  MUL:    'MUL',    // 乗算（*）
  DIV:    'DIV',    // 除算（/）
  NUMBER: 'NUMBER', // 数値（123など）
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  EOF:    'EOF'
};

class Token {
  constructor(type, value = null, pos = null) {
    this.type = type;   
    this.value = value; // type = Number のときだけ使う
    this.pos = pos;
  }
}

/* lexer */
/* lexer */

class Tokenizer {
  constructor(input) {
    this.input = input;
    this.index = 0;
    this.tokens = [];
  }
  peek() {
    return this.input[this.index];
  }
  advance() {
    return this.input[this.index++];
  }

  tokenize() {
    while (this.index < this.input.length) {
      const c = this.advance();


      if (
        // ".3"のような表記を許容 
        isDigit(c) || 
        (c === '.' && isDigit(this.peek()))) {
        let lexeme = c;
        let sawDot = c === '.';
        while (isDigit(this.peek()) || (this.peek() === '.' && !sawDot)) {
          if (this.peek() === '.') sawDot = true;
          lexeme += this.advance();
        }
        this.tokens.push(
          new Token(TokenType.NUMBER, lexeme, this.index)
        );

      } else if (c === '+') {
        this.tokens.push(new Token(TokenType.PLUS, null, this.index));
        //this.advance();

      } else if (c === '-') {
        this.tokens.push(new Token(TokenType.MINUS, null, this.index));
        //this.advance();

      } else if (c === '*') {
        this.tokens.push(new Token(TokenType.MUL, null, this.index));
        //this.advance();

      } else if (c === '/') {
        this.tokens.push(new Token(TokenType.DIV, null, this.index));
        //this.advance();

      } else if (c === '(') {
        this.tokens.push(new Token(TokenType.LPAREN, null, this.index));
        //this.advance();

      } else if (c === ')') {
        this.tokens.push(new Token(TokenType.RPAREN, null, this.index));
        //this.advance();

      } else if (c === ' ') {
        //this.advance();

      } else {
        throw new Error("[calc]invalid input");
      }
    }
    this.tokens.push(new Token(TokenType.EOF, null, this.index));
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
      throw new Error("[calc]Expr is abstract");
    }
  }

  eval(){
    throw new Error("[calc]eval not implemented");
  }
  toString(){
    throw new Error("[calc]toString not implemented");
  }
}

class NumberExpr extends Expr{
  constructor(num) {
    super();
    this.num = num;
  }
  eval(){
    return this.num
  }
}

class UnaryExpr extends Expr{
  constructor(operator, expr) {
    super();
    this.operator = operator;
    this.expr = expr;
  }
  eval() {
    const v = this.expr.eval();
    switch (this.operator) {
      case TokenType.MINUS:
        return -v;
      default:
        throw new Error("unknown operator");
    }
  }
}


class BinaryExpr extends Expr{
  constructor(operator, left, right) {
    super();
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
  eval() {
    const l = this.left.eval();
    const r = this.right.eval();
    switch (this.operator) {
      case TokenType.PLUS:
        return l + r;
      case TokenType.MINUS:
        return l - r;
      case TokenType.MUL:
        return l * r;
      case TokenType.DIV:
        return l / r;
      default:
        throw new Error("unknown operator");
    }
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

      if (token.type === TokenType.PLUS || token.type === TokenType.MINUS) {
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
      if (token.type === TokenType.MUL || token.type === TokenType.DIV) {
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

    if (token.type == TokenType.MINUS) {
      this.advance();
      const expr = this.parseFactor();
      return new UnaryExpr(TokenType.MINUS, expr);
    }

    if (token.type == TokenType.NUMBER) {
      this.advance();
      return new NumberExpr(Number(token.value));
    }

    if (token.type === TokenType.LPAREN) {
      this.advance();                 // '(' を食う
      const expr = this.parseExpression();
      if (this.current().type !== TokenType.RPAREN) {
        throw new Error("[calc]expected ')'");
      }
      this.advance();                 // ')' を食う
      return expr;
    }

    throw new Error("[calc]expected factor");
  }
}
/* ~parsers */

/*evaluator*/
function go(str){
  const t = new Tokenizer(str);
  const a = new Parser(t.tokenize());
  const ast  = a.parseExpression();
  const ans = ast.eval()
  console.log(ast)
  return Number(ans.toPrecision(10));
}

/* ~evaluator*/

function clearDisplay() {
  console.log('display cleared')
  display.value = '';
}
function calculate(){
  const tok = new Tokenizer(display.value);
  const a = new Parser(tok.tokenize());
  const ast  = a.parseExpression();
  const ans = ast.eval()
  console.log(ast)

  const f = Number(ans.toPrecision(10));
  console.log(f)
  display.value = f;
  return Number(ans.toPrecision(10));
}

