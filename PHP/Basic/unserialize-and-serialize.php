<?php

 $arr =  array(
    array("firstname" => "gatej","lastname"=>"andrei","age"=>17),
    array("firstname" => "secondLastname","lastname"=>"dan","age"=>21),
    array("firstname" => "gatej","lastname"=>"marius","age"=>39)
 );



//* Convert array to object - using unserialize()
function arrayToObject(array $array, $className) {
    return unserialize(sprintf(
        'O:%d:"%s"%s', // O - object
        strlen($className), // The length of the class name
        $className, // The class name
        strstr(serialize($array), ':') // strstr - get rid of the first letter before ":"
    ));
}


// The class that will hold the array elements
class Test {}

// print_r(arrayToObject($arr,"Test")); /* Test Object (...) */

//* Another unserialize() example
class Andr {}

    print_r(unserialize(sprintf(
        'O:%d:"%s"%s', // O - object
        strlen("Andr"), // The length of the class name
        "Andr", // The class name
        strstr('a:2:{s:4:"nume";s:6:"andrei";s:3:"age";i:17;}', ':') // strstr - get rid of the first letter before ":"
    )));




//* Getting familiar with serialize() function

// print_r(serialize($arr));
/*
a:3:{i:0;a:3:{s:9:"firstname";s:5:"gatej";s:8:"lastname";s:6:"andrei";s:3:"age";i:17;}i:1;a:3:{s:9:"firstname";s:14:"secondLastname";s:8:"lastname";s:3:"dan";s:3:"age";i:21;}i:2;a:3:{s:9:"firstname";s:5:"gatej";s:8:"lastname";s:6:"marius";s:3:"age";i:39;}}
*/

//* Serialize a class

// The class which we will apply the serialize() function on
class Test2 {
    var $nume = "andrei";
    var $age = 17;
}

// Create a new instance
$test = new Test2();
// echo serialize($test); # O:5:"Test2":2:{s:4:"nume";s:6:"andrei";s:3:"age";i:17;}



//* What does sprintf() actually do - stores a formatted string 
$srlClass = sprintf('O:%d:"%s"%s',3,"Test",strstr(serialize(array("andrei","gatej",17)),':'));
// echo $srlClass . PHP_EOL; # O:3:"Test":3:{i:0;s:6:"andrei";i:1;s:5:"gatej";i:2;i:17;}



 

 
?>
