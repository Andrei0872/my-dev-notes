
const num1 = 0b1010; // 10 
const num2 = 0b1111; // 15 

// NOT num1
console.log(~num1) // 0b0101 (complement) === -11

// AND
console.log(num1 & num2) // 0b1010 === 10

// OR
console.log(num1 | num2) // 0b1111 === 15

// XOR
console.log(num1 ^ num2) // 0b0101 === 5

// Shift to the left by 1
console.log(num1 << 1) // 0b10100 === 20

// Shift to the right by 1
console.log(num1 >> 1) // 0b0101 === 5


// ======================================================


//* Using a bitmask - to query the bits found in some binary number
// A bitmask is a way to "select" the bits you're interested in

// 1st bit from the right : 1 << 0
console.log(0b00001 === 1)

// 2nd bit from the right : 1 << 1
console.log(0b00010 === 2)

// 3rd bit from the right : 1 << 2
console.log(0b00100 === 4)

// 4th bit from the right : 1 << 3
console.log(0b01000 === 8)

// 5th bit from the right : 1 << 4
console.log(0b10000 === 16) 


// ==================================================


// Selecting more than 1 bit
// 1st and 5th
console.log(0b10001 === 17) // 1 + 2 ^ 4

// 2nd, 4th and 5th
console.log(0b11010 === 26) // 2 + 2 ^ 3 + 2 ^ 4

// Selecting ALL the bits
console.log(0b11111 === 31) 


// ===================================================


// For reference only
const config = {
    isOnline:          true,
    isFullscreen:      false,
    hasAudio:          true,
    hasPremiumAccount: false,
    canSendTelemetry:  true
  };
  
  // isOnline:          1
  // isFullScreen:      0
  // hasAudio:          1
  // hasPremiumAccount: 0
  // canSendTelemetry:  1
  // Thus, we have the binary number 0b10101.
  let configNumber = 0b10101; // 21  

// Getting values
// Bitmasking allows you to extract the value of a single bit in a number


// Shifting 0b1 to the left 2 times gives the 3rd bit from the right
const bitMask = 0b1 << 2; // 4

// 3rd bit corresponds to the hasAudio prop
const query = configNumber & bitMask; // 4
const truthiness = Boolean(query); // true
console.log(truthiness === config.hasAudio) // true


// Doing the same thing, but for a falsy prop: isFullScreen
const bitMask2 = 0b1 << 3; // 4th bit from the right
const query2 = configNumber & bitMask2;
const truthiness2 = Boolean(query2); // false
console.log(truthiness2 === config.isFullscreen) // true

//* Notes: AND bitwise operator - determines the truthiness(the value we're trying to extract) of a query


// ======================================================


// Toggling Values - XOR( ^ ) operator 

// configNumber = 0b10101; // 21
// Getting 1st bit from the right
const bitMask3 = 0b1 << 0; 
// Toggling the 1st bit from the right
const query3 = configNumber ^ bitMask3;
configNumber = query3
console.log(configNumber) // 20


// ======================================================

// All together

/**
 * Extracts the truthiness of a bit given a mask
 *
 * @param {Number} binaryNum - The number to query from
 * @param {Number} mask - The bitmask that selects the bit
 * @returns {Boolean} - Truthiness
 */
function getBits(binaryNum, mask) {
    const query = binaryNum & mask;
    return Boolean(query);
} 

/**
 * Extracts the truthiness of a bit given a position
 *
 * @param {Number} binaryNum - The number to query from
 * @param {Number} position - - The bitmask that selects the bit
 * @returns {Boolean} - Truthiness
 */
function getBitsFrom(binaryNum, position) {
    // Bit-shifts according to zero-indexed position
    const mask = 1 << position;
    const query = binaryNum & mask;
    return Boolean(query);   
}

function toggleBits(binaryNum, mask) {
    return binaryNum ^ mask;
}

// const config = {
//     isOnline:          true,
//     isFullscreen:      false,
//     hasAudio:          true,
//     hasPremiumAccount: false,
//     canSendTelemetry:  true
//   };
  configNumber = 0b10101; // Still 21

// Extracts hasPremiumAccount
console.log(getBits(configNumber,1 << 1)) // false
console.log(getBitsFrom(configNumber, 1)) // false

// Toggle isOnline and isFullScreen
console.log(toggleBits(configNumber, (1 << 4) + (1 << 3))) // 0b01101 === 13
