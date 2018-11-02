
// https://alligator.io/js/stack-trace/

/**
 * stack trace = stack of dishes 
 * When dishes are piling up and they start to fall over 
 * you know that last couple plates are the culprit
 * 
 * The most recent actions are at the top of the stack trace
 */

firstFunction = () => {
    secondFunction();
}

secondFunction = () => {
    thirdFunction();
}

thirdFunction = () => {
    notDefined();
}

firstFunction();

/*
ReferenceError: notDefined is not defined //
    at thirdFunction (/home/anduser/Desktop/Programming _ Web Dev/Web Lessons/Lessons JS/Stack Trace/stack-trace.js:11:5) // file, line, col
    at secondFunction (/home/anduser/Desktop/Programming _ Web Dev/Web Lessons/Lessons JS/Stack Trace/stack-trace.js:7:5)
    at firstFunction (/home/anduser/Desktop/Programming _ Web Dev/Web Lessons/Lessons JS/Stack Trace/stack-trace.js:3:5)
    at Object.<anonymous> (/home/anduser/Desktop/Programming _ Web Dev/Web Lessons/Lessons JS/Stack Trace/stack-trace.js:14:3) // Where it all started
*/


//* Trick
window.onerror = error => {
    // redirect to SO with error as query
    window.location.href = `https://stackoverflow.com/search?q=[js]${error.message}`;
  }