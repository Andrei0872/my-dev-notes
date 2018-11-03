<?php
/**
 ** PHP Cloures
 *? Link : https://blog.eduonix.com/web-programming-tutorials/closures-in-php/
 */

//  Lazy loading  - the loading of an obj is delayed until is really required

// Anonymous function - function without a name; it is assigned to variable; is ended with semicolon

$string = function () {

    // Returns an object of closure which is assigned to this anonymous function
    return 'This is an anonymous function';

};

echo $string(); # This is an anonymous function
echo PHP_EOL;

/**
 ** What is a closure ? 
 *
 * A closure is an object representation of an anonymous function
 * 
 * A closure is an object oriented way to use anonymous functions
 * 
 ** Use of closure
 *
 * Can acces private data of an object instance
 *  
 * lazy loading
 */

 // In order to use external data into closures, you need to use the "use" clause


 // This variable is used inside the anonymous function using "use" clause
$client = "Andrei";

// The closure object is stored in $output2 variable
$output2 = function () use($client) {
    echo "Hello $client!"; 
};

 $output2(); # Hello Andrei!
echo PHP_EOL;

//! If you want to change the value of the external variable, you can do it by passing it  by reference


// * Closures can also acces ALL the private data of a class

class Worker {
    
    private $id;
    private $sal;

    // Set the variables in the constructor function
    public function __construct(int $id,int $sal) {
        
        $this->id = $id;
        $this->sal = $sal;

    }

    public function info() {
           
        // $this won't work inside a closure unless we use the "use" clause
        $that = $this;

        // Because it is a closure, we assign the closure to a variable
        // Return a closure
        return /*$result = */  (function () use ($that) { //* use($that) - make sure we use the current object. "use" clause - for using external data inside a closure

            // We are accessing the private members $id and $sal in the closure
            return "ID = {$this->id}, Salary = {$this->sal}.";
        
        })();
        
    }


} 

// Create the new instance 
$andrei = new Worker(187,10000);

/* If we were assigning the closure to a variable : 
        $worker = $andrei->info();
        echo $worker();
*/
// Calling the closure
echo $andrei->info(); # ID = 187, Salary = 10000.
echo PHP_EOL;




/**
 * If you don't want to allow a closure to use the data in the class, you can prefix it with the "static keyword" 
 *
 * This helps us to save memory needed to store the object data when used in closure
 * 
 * Useful when you use more than one closure in a class
 * 
 */
  //* Using the "static keyword"  

    
 class Plane {

    private $id;

    function __construcyt($id) {

        $this->id = $id;

    }

    public function company ($comp) {

        $that = $this;

        // return the closure
        return ( static function() use ($that,$comp) {
            return "The company is  : {$comp}.";
        })();

    }


 }

$plane = new Plane(123);
echo $plane->company("Blue Air"); # The company is  : Blue Air.
echo PHP_EOL;


// The __invoke() magic method - allows the object of a class itself to become a closure

class Test {
    public function __invoke() {
        return  "this is a test";
    }
}

$test = new Test();
echo $test(); # this is a test 
echo PHP_EOL;

?>