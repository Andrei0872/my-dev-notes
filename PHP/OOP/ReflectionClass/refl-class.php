
<?php

class Obj {
    private $age = 3;
    private $name = "andrei";
    protected $connection = "this is a connection";
    var $public_var = "this is a public var";
    
    public function set_age($age) {
        echo "setting age $age";
    }     
}

$refl= new ReflectionClass( new Obj);
print_r($refl->getDefaultProperties());
/*
Array
(
    [age] => 3
    [name] => andrei
    [connection] => this is a connection
    [public_var] => this is a public var
)
*/

foreach(array_keys($refl->getDefaultProperties()) as $key) {
    echo "key : {$key}" . PHP_EOL;
}

$key = 'age';
$info = [$key => 18];
if($refl->hasMethod('set_'.$key)) {
    (new Obj)->{'set_'.$key}($info[$key]);
}
