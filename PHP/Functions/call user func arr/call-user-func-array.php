
<?php

$multiply = function ():int {
    echo "func args : " . json_encode(func_get_args()) . PHP_EOL;
    echo "number of args : " . json_encode(func_num_args()) . PHP_EOL;
    // return func_get_arg(0) * func_get_arg(1);
    $p = 1;
    foreach(func_get_args() as $arg) {
        $p *= $arg;
    }
    return $p;
};

echo call_user_func_array($multiply, array(3,4,10,10)); // 1200

