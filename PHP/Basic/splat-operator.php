<?php
// Three dot (...) in PHP, also known as "splat" operator
// ... allows us to capture a variable number of arguments to a function

$person = "andrei";

function showSkills($person, ...$skills) {
    echo "$person is good at : \n";
    
    // Loop through the $skills array..
    foreach($skills as $key=>$value) {
        echo $key == count($skills)-1 ?  "$value" : "$value, ";
    }
}

echo showSkills($person,"web","c++","football");
/*
 Output : 
 andrei is good at : 
 web, c++, football
*/

?>