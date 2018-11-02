<?php

$string = 'The quick brown fox jumps over the lazy dog.';

$patterns = array();
$patterns[0] = '/quick/';
$patterns[1] = '/brown/';
$patterns[2] = '/fox/';

$replacements = array();
$replacements[2] = 'bear';
$replacements[1] = 'black';
$replacements[0] = 'slow';

print_r($patterns);
/*
Array
(
    [0] => /quick/
    [1] => /brown/
    [2] => /fox/
)
*/

print_r($replacements);
/*
Array
(
    [2] => bear
    [1] => black
    [0] => slow
)
*/

// ksort($replacements);
// print_r($replacements);
// The slow black bear jumps over the lazy dog.a

// echo preg_replace($patterns,$replacements,$string);
# The bear black slow jumps over the lazy dog.


$replacements2 = [];
$replacements2[0] = 'slow';
$replacements2[1] = 'black';
$replacements2[2] = 'bear';
echo preg_replace($patterns,$replacements2,$string);
// The slow black bear jumps over the lazy dog.


?>
