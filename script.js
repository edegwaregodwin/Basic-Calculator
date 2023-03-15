document.getElementById('zero').onclick = function() {number(0)};
document.getElementById('one').onclick = function() {number(1)};
document.getElementById('two').onclick = function() {number(2)};
document.getElementById('three').onclick = function() {number(3)};
document.getElementById('four').onclick = function() {number(4)};
document.getElementById('five').onclick = function() {number(5)};
document.getElementById('six').onclick = function() {number(6)};
document.getElementById('seven').onclick = function() {number(7)};
document.getElementById('eight').onclick = function() {number(8)};
document.getElementById('nine').onclick = function() {number(9)};
document.getElementById('add').onclick = function() {operator('+')};
document.getElementById('subtract').onclick = function() {operator('-')};
document.getElementById('divide').onclick = function() {operator('/')};
document.getElementById('multiply').onclick = function() {operator('*')};
document.getElementById('clear').onclick = function() {clear()};
document.getElementById('equals').onclick = function() {trigger()};
document.getElementById('decimal').onclick = function() {number('.')};
document.getElementById('delete').onclick = function() {backspace()};


let holder = [];
let value = '';
let displaying = '';
let prevIsOperator = false;
let beforePrevIsOperator = false;
let prevIsTrigger = true;
let valueTimer;
let timerIsDone = true;


// display section
function formulaDisplay(arg) {
  displaying += arg;
  document.getElementById('formula-display').textContent = displaying;
}
function resultDisplay(arg) {
  timerIsDone = true;
  document.getElementById('display').textContent = arg;
}
function number(num) {
  if (value.length == 14) {
    // setting maximum single digit count to 14
    function digitLimit() {
      setTimeout(resultDisplay, 0, 'DIGIT LIMIT MET');
      valueTimer = setTimeout(resultDisplay, 1300, value);
    }
    if (timerIsDone == true) {
      digitLimit();
      timerIsDone = false;
    }
    return;
  }
  if (/\./.test(value) && num == '.') {
    // to prevent multiple decimal points
    return
  }
  if (value[0] == undefined && num == '.') {
    // to begin with 0 if a decimal point is inputed before a number
    value += '0';
    formulaDisplay('0');
  }
  if (prevIsTrigger == true) {
    // to restart calculations if a number is pressed after computations
    clear();
    if (num == '.') {
      value += '0';
      formulaDisplay('0');
    }
  }
  if (/^\+|^\*|\//.test(holder[0])) {
    // to prevent starting with an operator such as '/ 4'
    displaying = '';
    holder.pop();
  }
  if (value[0] == 0 && value[1] != '.' && num != '.') {
    // to prevent starting with 0 unless there is a decimal point
    value = '';
    displaying = displaying.slice(0, -1);
  }
  formulaDisplay(num);
  value += num;
  resultDisplay(value);
  prevIsOperator = false;
  beforePrevIsOperator = false;
  prevIsTrigger = false;
}
function operator(sign) {
  clearTimeout(valueTimer);
  resultDisplay(sign);
  // to allow computation with previous answer
  if (prevIsTrigger == true && holder[0] != undefined) {
    formulaDisplay(holder[0]);
  }
  if ((prevIsOperator == true && sign == '-') || (holder[0] == undefined && sign == '-' && prevIsTrigger == true)) {
    if (/^[\+\*\/]/.test(holder[0])) {
      // to prevent '* - 6' at the beginning but allow starting with negative sign such as '- 2 + 6'
      displaying = '';
      holder.pop();
    }
    // to allow the likes of '- -' or '+ -' but not '- - -' or '+ - -'
    if (beforePrevIsOperator == true) {
      displaying = displaying.slice(0, -3);
      value = '';
    }
    prevIsOperator = true;
    beforePrevIsOperator = true;
    prevIsTrigger = false;
    formulaDisplay(' ' + sign + ' ');
    value += sign;
    return
  } // to prevent double operations such as '+ *' so changes to '*'
    else if (prevIsOperator == true && sign != '-') {
    holder.pop();
    displaying = holder.join(' ');
    value = '';
    beforePrevIsOperator = false;
  }
  if (value != '') {
    holder.push(Number(value));
  }
  formulaDisplay(' ' + sign + ' ');
  holder.push(sign);
  value = '';
  prevIsOperator = true;
  prevIsTrigger = false;
}
function clear() {
  clearTimeout(valueTimer);
  displaying = '';
  resultDisplay(0);
  formulaDisplay('');
  holder = [];
  value = '';
  prevIsOperator = false;
  beforePrevIsOperator = false;
}


// computation section
function backspace() {
  if (holder[0] == undefined && value == '' || prevIsTrigger == true) {
    return
  } else if (value != '') {
    value = value.slice(0, -1);
    displaying = displaying.slice(0, -1);
    formulaDisplay('');
    if (value == '-') {
      // to reset the booleans so '- - +' isn't possible
      prevIsOperator = true;
      beforePrevIsOperator = false;
      prevIsTrigger = false;
    }
    if (value == '') {
      // to reset the global variables
      if (/^[\+\*\/\-]/.test(holder.slice(-1)[0])) {
        prevIsOperator = true;
        beforePrevIsOperator = false;
        prevIsTrigger = false;
      }
      // to change formula display when one of '- -' is removed
      if (/^[\+|\*|\/|\-]\s\s\-$/.test(displaying.slice(-4))) {
        displaying = displaying.slice(0, -2);
        formulaDisplay('');
      }
      resultDisplay(displaying.slice(-2, -1));
    } else {
      resultDisplay(value);
    }
  } else if (value == '' && /^[\+\*\/\-]/.test(holder.slice(-1)[0])){
    displaying = displaying.slice(0, -3);
    holder.pop();
    value += holder.slice(-1)[0];
    holder.pop();
    formulaDisplay('');
    resultDisplay(value);
    prevIsTrigger = false;
    prevIsOperator = false;
    beforePrevIsOperator = false;
  }
}
function partialCompute(first, operator, second, index) {
  // to perform calculation according to BODMAS
  let calculated;
  switch (operator) {
    case '+': calculated = first + second; break;
    case '-': calculated = first - second; break;
    case '*': calculated = first * second; break;
    case '/' : calculated = first / second; break;
  }
  // to give correct results with numbers infinitely expressed due to binary such as '0.3 - 0.2'
  let binaryCorrector = calculated.toFixed(15);
  if (/\.[1-9]0+$/.test(binaryCorrector)) {
    binaryCorrector = binaryCorrector.replace(/0+$/, '');
    calculated = Number(binaryCorrector);
  }
  holder.splice(index, 3, calculated);
}
function compute(sign) {
  let i = holder.indexOf(sign);
  if(i != - 1) {
    partialCompute(holder[i-1], holder[i], holder[i+1], i-1);
    compute(sign);
  }
}
function trigger() {
  // prevent computations if no new value has been inputed or starts with an operator
  if (prevIsTrigger == true || /^[\+\*\/]/.test(holder[0]) || value == '-' && holder[0] == undefined) {
    if (holder[0] == undefined || /^[\+\*\/\-]/.test(holder[0])) {
      formulaDisplay(' = ');
      displaying = '';
      holder = [];
      value = '';
      prevIsOperator = false;
      beforePrevIsOperator = false;
      resultDisplay('Syntax error');
      prevIsTrigger = true;
      return
    }
    displaying = '';
    value = '';
    resultDisplay(holder[0]);
    prevIsTrigger = true;
    prevIsOperator = false;
    beforePrevIsOperator = false;
    return
  }
  // to compute correctly if the equation ends with an operator such as '2+2+' or '2+2*-' will compute as '2+2'
  if (value == '' && prevIsTrigger == false || value == '-') {
    holder.pop();
  } else {
    holder.push(Number(value));
  }
  value = '';
  let operators = ['/', '*', '-', '+'];
  for(let signs in operators) {
    compute(operators[signs]);
  };
  value += holder[0];
  formulaDisplay(' = ');
  displaying = '';
  holder = [];
  holder.push(Number(value));
  value = '';
  resultDisplay(holder[0]);
  prevIsOperator = false;
  beforePrevIsOperator = false;
  prevIsTrigger = true;
}

clear();
