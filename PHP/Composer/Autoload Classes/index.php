<?php

//* How to autoload classes 
// https://www.youtube.com/watch?v=YKpB0Sd3mGE

//! Old way of doing things
// include 'src/Animal.php';
// $animal = new Animal();
// echo $animal->roar();


//* Good !
require 'vendor/autoload.php';
// $animal  = new Acme\Animal();
// echo $animal->roar();

require 'fight.php';

// "Acme\\" : "src" -  the directory that holds all my classes is "src"

