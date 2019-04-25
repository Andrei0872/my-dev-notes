#!/bin/bash

js="<script src="./main.js"></script>"

html="$(echo "
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    <link rel="stylesheet" href="./main.css">
</head>
<body>
    
</body>
$([ "$2" == 'js' ] && echo $js || echo '')
</html>
"
)"

# Choose your location
dirPath=$HOME/Documents/Workspace/train/
cd $dirPath

nrFiles="$(ls -1 | wc -l)"
nrFiles=$(($nrFiles + 1))
prefix=$([ $nrFiles -lt 10 ] && echo "0${nrFiles}" || echo $nrFiles)

mkdir "${prefix}_$1" && cd $_

echo "$html" > index.html
echo '' > main.css

if [[ "$2" == 'js' ]]; then
    echo '' > main.js
fi

code .