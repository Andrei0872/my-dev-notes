
/* 
Typed Arrays

- Provide a mechanism for accessing raw binary data
- Examples:
    - Int8Array(array of 8-bit integers)
    - Uint8Array 

The container for all typed arrays: ArrayBuffer
Interacting with ArrayBuffer: DataView; You'll get all the Array methods and properties available
*/

// Create a 16 bytes buffer
const buffer = new ArrayBuffer(16);

// Access the whole buffer
const dv1 = new DataView(buffer);
// Start at slot 10, get only 3 bytes
const dv2 = new DataView(buffer, 10, 3);

// Put "42" in slot "11" through view1
dv1.setInt8(11, 42);
// Get the second slot(starting from 10)
const num = dv2.getInt8(1);
console.log(num) // 42

// ======================================================
