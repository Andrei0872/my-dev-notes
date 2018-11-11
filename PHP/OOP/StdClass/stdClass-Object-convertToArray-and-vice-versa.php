<?php
 
 // Create a stdClass object
 $obj = (object) array(
    array("firstname" => "gatej","lastname"=>"andrei","age"=>17),
    array("firstname" => "secondLastname","lastname"=>"dan","age"=>21),
    array("firstname" => "gatej","lastname"=>"marius","age"=>39)
 );
// print_r($obj); // stdClass Object


//* Get the stdClass Object as an associative array
$obj = json_decode(json_encode($obj),true);
// print_r($obj); // Associative Array

//* Accessing properties

// First alternative
echo $obj[0]['age'] . PHP_EOL; // 17

// Second alternative
echo $obj{'0'}{'firstname'}.PHP_EOL; // gatej



//* Get the stdClass object back
function toStd($elem) {
    // If $elem is array, we will call recursively this function for each element in the array
    if(is_array($elem)) {
        return (object) array_map(__FUNCTION__,$elem);
    }else {
        return $elem;
    }
}
$stdObj = toStd($obj);
print_r($stdObj);
 