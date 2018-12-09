
<?php

// https://www.regular-expressions.info/lookaround.html


/* Lookahead & Lookbehind = LOOKAROUND
- are zero length assertions 
- matches characters, but then gives up the match, returning only the result : match or no match (called "assertions") 
- they dont consume the chars in the string, but only assert wheter a match is possible or not
- you can use regex inside the lookahead : (?=(regex)) 
*/


//* Negative lookahead - ?!
/*
! you want to match smth not followed by something else
*/
$str2 = 'one "two" (three) -four- ';
// Assert that the Regex below does not match
// Split on non-word charater followed by a word boundary
$arr = preg_split("#(?!\w)\b#",$str2);
print_r($arr);
/*
Array
(
    [0] => one
    [1] =>  "two
    [2] => " (three
    [3] => ) -four
    [4] => - 
)
*/

// Split on non-word characters
$arr2 = preg_split("#(\w)\b#",$str2);
print_r($arr2);
/*
    [0] => on
    [1] =>  "tw
    [2] => " (thre
    [3] => ) -fou
    [4] => - 
*/


// Negative lookahead
// q not followed by u
$regex = "/q(?!u)/";
$str5 = "Iraq"; 
$res = preg_match($regex,$str5,$matches);
// echo $res; // 1
// print_r($matches);


$str4 = "quit";
$res2 = preg_match($regex,$str4);
// echo $res2; // 0


//* Positive lookahead - ?=
// q(?=u) - q followed by u 
$res3 = preg_match("/q(?=u)/",$str4);
echo $res3; // 1


$str22 = "The lookbehind lookABC engine lookAND notes that the regex inside the lookahead";
$regex2 = '/look(?=ahead)/';
$result = preg_match($regex2,$str22,$matches2);
echo PHP_EOL . $result; // 1
// print_r($matches2);


$regex3 = "/(look)(?=(\w+))/";
$res4 = preg_match_all($regex3,$str22,$matches4);
echo PHP_EOL . $res4; // 4
print_r($matches4);
/*
Array
(
    [0] => Array
        (
            [0] => look
            [1] => look
            [2] => look
            [3] => look
        )


    [1] => Array
        (
            [0] => look
            [1] => look
            [2] => look
            [3] => look
        )


    [2] => Array - second parenthesized subpattern
        (
            [0] => behind
            [1] => ABC
            [2] => AND
            [3] => ahead
        )
)
*/


//* Positive and Negative LOOKBEHIND
/*
- same effect as lookahead, but works backwards
- tells the regex to step backwards in the string, to check if the string
  in the lookbehind can be matched
(?<!a)b - negative lookbehind -  b that is not preceded by an "a"
cab - NO ATCH
deb - MATCH
(?<=a)b  - positive lookbehind - matches b in "cab", BUT DOES NOT in "bed"
*/

$version = '1.2.3';

// Match the second thing after that is not a dot
$r1 = "#(?<=\.)[^.]+#"; 
preg_match($r1,$version,$m3);
// print_r($m3);
/*
Array
(
    [0] => 2
)
*/

// Match the third thing that is not a dot (preceded by a dot)
$r2 = "#(?<=\.[^.]\.)[^.]+#";
preg_match($r2,$version,$m4);
// print_r($m4);
/*
Array
(
    [0] => 3
)
*/

$name = "Andrei has never been in Andorra";
// Match words in which "r" is neither the first letter nor the last
$reg = "#\b(\w+)(?<=[a-zA-Z])r(\w+)\b#";
preg_match_all($reg,$name,$m5);
// print_r($m5);
/*
Array
(
    [0] => Array
        (
            [0] => Andrei
            [1] => Andorra
        )

    [1] => Array
        (
            [0] => And
            [1] => Andor
        )

    [2] => Array
        (
            [0] => ei
            [1] => a
        )
)
*/
