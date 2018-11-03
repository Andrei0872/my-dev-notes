<?php
ini_set("display_errors",true);
ini_set("display_startup_errors",true);
error_reporting(E_ALL);

// function err($errno, $errname) {
//     echo "Error[$errno] : $errname";
//     return false;
// }

// set_error_handler('err');

try {
    $conn = new PDO("mysql:host=localhost;dbname=sms",'host','password');
} catch(PDOException $e) {
    echo $e->getMessage();
}

$conn->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);

require 'vendor/autoload.php';

// The returned generator
$faker = \Faker\Factory::create();

$query = "";
for($i = 0; $i < 10; $i++) {
    $query .= "
        INSERT INTO teacher(
            register_date,fname,lname,image,date_of_birth,
            age,contact,email,address,city,country
        )
        VALUES(
            '".$faker->dateTimeThisCentury->format('Y-m-d')."',
            '".$faker->firstName."',
            '".$faker->lastName."',
            '".$faker->imageUrl(640,480)."',
            '".$faker->dateTimeThisCentury->format('Y-m-d')."',
            '".$faker->randomNumber(2,true)."',
            '".$faker->randomNumber(8,true)."',
            '".$faker->email."',
            '".$faker->streetSuffix."',
            '".$faker->city."',
            '".$faker->country."'
        );
    ";
}

try {
    $stmt = $conn->prepare($query);
    $stmt->execute();
}
catch (PDOException $e)
{
    echo $e->getMessage();
    die();
}

