/* eslint-disable */
function initAssertions() {
  var assertionNumber = 0;
  return function expect(firstValue) {
    assertionNumber++;
    return {
      toEqual: secondValue => {
        if (firstValue === secondValue)
          console.log('  #' + assertionNumber + ' %cpassed', 'font-weight:100;background:rgb(40,150,100);color:white;padding:2px 3px;');
        else
          console.log('  #' + assertionNumber + ' %cfailed', 'font-weight:100;background:rgb(220,50,10); color:white;padding:2px 3px;');
      }
    }
  }
}

function runTests(tests) {
  console.log('~~~~~~~~~~~~~~~~\nRunning Tests\n~~~~~~~~~~~~~~~~');
  var delay = 0;
  _.forOwn(tests, (func, desc) => {
    delay += 400;
    setTimeout(function() {
      console.log('%c> ' + desc, 'background:rgb(230,230,230);font-weight:700;border:1px solid rgb(200,200,200);padding:2px 3px; color:rgb(100,100,100);');
      func(initAssertions());
    }, delay);
  });
}
