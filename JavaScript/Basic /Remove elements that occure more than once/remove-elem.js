

// https://stackoverflow.com/questions/53066843/remove-all-elements-that-occur-more-than-once-from-array

const a = ['Ronaldo', 'Pele', 'Maradona', 'Messi', 
           'Pele', 'Messi', 'Jair', 'Baggio', 'Messi', 
           'Seedorf'];

const uniqueArr = a.filter(name => a.indexOf(name) === a.lastIndexOf(name));
console.log(uniqueArr) //  [ 'Ronaldo', 'Maradona', 'Jair', 'Baggio', 'Seedorf' ]

