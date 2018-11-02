<?php

// Download images from Bing

// https://www.youtube.com/watch?v=tES0tNAWdCo

//* cURL - Client URL
// cURL - is a library that lets you make HTTP requests in PHP

/**
 * init
 * set options
 * excute
 * close
 */


// Error handler function
function customError($errno, $errstr) {
    echo "<b>Error:</b> [$errno] $errstr";
}
  
// Set error handler
set_error_handler("customError");



$bing = 'https://www.bing.com';
$save_folder = "file:///home/anduser/Documents/imgs/";
$ch = curl_init();

// Set URL
curl_setopt($ch,CURLOPT_URL,$bing);
// Don't want the cURL to verify anything
curl_setopt($ch,CURLOPT_SSL_VERIFYPEER,false);
// Output the data to a variable
curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
$content = curl_exec($ch);


preg_match("#/az/hprichbg/rb/(.*?).jpg#",$content,$image_match);
// [0] - the full match
// [1] - the parenthesized match
// print_r($image_match);

// Where the whole URL is stored
$image_url = $bing.$image_match[0]; // Full image URL
$image_name = $image_match[1].'.jpg'; // Full name

$save_path = $save_folder.$image_name;


// Load the actual image URL
$ch = curl_init();
curl_setopt($ch,CURLOPT_URL,$image_url);
// Don't need to send any headers
curl_setopt($ch,CURLOPT_HEADER,false);
curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
// Still loading the HTTPS protocol
curl_setopt($ch,CURLOPT_SSL_VERIFYPEER, false);
// Working with images - set binary TRUE
curl_setopt($ch,CURLOPT_BINARYTRANSFER,true);
$binary_data = curl_exec($ch);
// echo $binary_data;
curl_close($ch);

if(file_exists($save_path)) {
    unlink($save_path);
}

// Open for WRITING ONLY
$fh = fopen($save_path,"w");
fwrite($fh,$binary_data);
fclose($fh);

?>