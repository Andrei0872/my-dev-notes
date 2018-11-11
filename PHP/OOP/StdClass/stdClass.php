<?php

//* stdClass

// https://stackoverflow.com/questions/931407/what-is-stdclass-in-php
// http://krisjordan.com/dynamic-properties-in-php-with-stdclass


/*
- a generic empty class
- useful for anonymous, dynamic properties etc..
- an alternative for associative arrays
*/

// json_decode() allows to the an stdClass instance or an assoc array
// Using stdClass
$json = '{"foo" : "bar", "number" : 42}';
$stdInstance = json_decode($json);
echo $stdInstance->foo . PHP_EOL; // bar
echo $stdInstance->number . PHP_EOL; // 42

// Using assoc arrays - by using the second param : true
$arr = json_decode($json,true);
echo $arr["foo"] . PHP_EOL; // bar
echo $arr["number"] . PHP_EOL; // 42
echo "---------------------" . PHP_EOL;



//! stdClass is not the base class for Objects in PHP
// Demonstration
class Foo{}
$foo =  new Foo();
echo ($foo instanceof stdClass) ? "Y" : "N"; // N
echo PHP_EOL;
echo "---------------------" . PHP_EOL;


//* Built in dynamic properties
// Built in dynamic property accesses happen without invoking 
// a method cb to PHP script

class Dynamic{}
$obj = new Dynamic();
echo isset($obj->foo) ? "Y" : "N"; // N

// Set dynamic props
$obj->foo = "bar";
$obj->fooz = "baz";

echo isset($obj->foo) ? "Y" : "N"; echo PHP_EOL; // Y
unset($obj->foo);

foreach($obj as $key=>$value) {
    echo "$key : $value"; // fooz : baz
}
