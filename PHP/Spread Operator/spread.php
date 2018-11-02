
<?php

function fun(...$arr) {
  $cnt = count(is_array($arr[0]) === TRUE ? $arr[0] : $arr );
  echo $cnt . PHP_EOL;
}

$arr = [1,2,3,4];

fun(1,2,3,4,5); // 5
fun($arr); // 4

