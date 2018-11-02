
// https://medium.freecodecamp.org/how-to-get-a-grip-on-reference-vs-value-in-javascript-cba3f86da223


// It may reserve a new space to store a copy of the value,
// or it might not create a copy at all and just
//* point to the existing value(reference)

//* Primitive Types - undefined,null,string,number,boolean,symbol - passed by value

// Passing by value
let name = 'Andrei';
let name2 = name;
console.log({name, name2}) //  { name: 'Andrei', name2: 'Andrei' }

name = 'Dan';
console.log({name, name2}) //  { name: 'Dan', name2: 'Andrei' }
/**
 * When "name" is assigned, a space in the memory with an address of 0x001 is reserved to store that value
 * "name" points to that address
 * "name2" is set to equal "name" ==> a new space in the memory,
 * with the address 0x002 is allocated
 */


 //* Object & Arrays
 const animals = ['Cat', 'Dog', 'Horse', 'Snake'];
 let animals2 = animals;
 console.log({animals, animals2}); 
/*
 { animals: [ 'Cat', 'Dog', 'Horse', 'Snake' ],
  animals2: [ 'Cat', 'Dog', 'Horse', 'Snake' ] }
*/
animals2[3] = 'Wale';
/*
  animals: ['Cat', 'Dog', 'Horse', 'Wale'],
  animals2: ['Cat', 'Dog', 'Horse', 'Wale']
*/
/**
 * "animals2" is simply pointed to the same object in the existing address
 */
//* Goes the same for objects

//* Copying obj
// If the obj "person" has a prop "age", it will be overwritten
// let human = Object.assign({}, person, { age: 20 });

//* Deep clone
const person = {
    name: 'Andrei',
    age: 17
  };

let p2 = JSON.parse(JSON.stringify(person));
p2.name = 'Dan';

console.log(person,p2) //  { name: 'Andrei', age: 17 } { name: 'Dan', age: 17 }

