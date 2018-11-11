
<?php


// http://php.net/manual/ro/function.preg-match-all.php

// preg_match_all()

/**
 * PREG_PATTERN_ORDER {
 *  $matches[0] - an array of full matches
 *  $matches[1] - an array of parenthesized matches
 * }
 */

$str = "<b>example: </b><div align=left>this is a test</div>";

preg_match_all('|<[^>]+>(.*?)</[^>]+>|',$str,$matches,PREG_PATTERN_ORDER);
// print_r($matches);
/*
Array
(
    [0] => Array
        (
            [0] => <b>example: </b>
            [1] => <div align=left>this is a test</div>
        )
    [1] => Array
        (
            [0] => example:
            [1] => this is a test
        )
)
*/


// ============================================================


/**
 * PREG_SET_ORDER {
 *  $matches[0] an array of first set of matches
 *  $matches[1] an array of second set of matches
 *  ... and so on
 * }
 */

$str2 = '<b>example: </b><div align="left">this is a test</div>';
preg_match_all('#<[^>]+>(.*?)</[^>]+>#',$str2,$matches2, PREG_SET_ORDER);
// print_r($matches2);

/*
Array
(
    [0] => Array
        (
            [0] => <b>example: </b>
            [1] => example:
        )
    [1] => Array
        (
            [0] => <div align="left">this is a test</div>
            [1] => this is a test
        )
)
*/