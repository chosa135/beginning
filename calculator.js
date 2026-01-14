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

/* lexer */
class Token {
  constructor(type, value = null, pos = null) {
    this.type = type;   
    this.value = value; // type = Number のときだけ使う
    this.pos = pos;
  }
}

function tokenize(input){
  let tokens = [];
  let index = 0;
  while (index < input.length) {
    const c = input[index];

    /*number */
    if (isDigit(c)) {
      let nums = c;
      index++;
      while (index < input.length && isDigit(input[index])) {
        nums += input[index];
        index++;
      }
      tokens.push(new Token("Numbers", nums, index));

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
      tokens.push(new Token("LParen", null, index));
      index++;
    } else if (c === ')') {
      tokens.push(new Token("RParen", null, index));
      index++;
    } else if (c === ' ') {
      index++;
    } else {
      tokens = [(new Token("InvalidChar", null, index))];
      return tokens;
    } 
  }
  tokens.push(new Token("EOF", null, index));
  return tokens;
}

function isDigit(c) {
  return c >= '0' && c <= '9';
}
/* ~lexer */


/* parsers */
function parse_expr(ts){
  /* Expr -> Term (('+' | '-') Term)* */

}
function parse_term(ts){
  /*Term -> Factor (('*' | '/') Factor)*/

}
function parse_factor(ts){
  /*Factor -> Number
        | '(' Expr ')'
        | '-' Factor
  */
}
/* ~parsers */

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
