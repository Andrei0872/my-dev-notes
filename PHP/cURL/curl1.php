<?php

// Basic cURL tutorial

// https://www.youtube.com/watch?v=7XUibDYw4mc


// -i - Include Header Information

// --head / -I : Include only the header

// -o -  Write output to <file> instead of stdout. If you are using {} or
    // [] to fetch multiple documents, you can 

// -O - download it


// --limit-rate {nr}B Limit the transfer rate


// --data / -D = add data

// -X PUT -d - update
// curl -X PUT -d "title=llo" https://jsonplaceholder.typicode.com/posts/3
// {
//   "title": "Hello",
//   "id": 3
// }


/*
-d {
    Sends the specified data in a POST request to the HTTP server,
    in the same way that a browser does when a user has filled in an HTML
    form and presses the submit button
}
*/

// Delete
/*
curl -X DELETE  https://jsonplaceholder.typicode.com/posts/3
*/


// L - redirect



// Working with FTP

/*
-T / --upload-file - This transfers the specified local file to the remote URL

-u/  --user <user:password> - credentials
Specify  the user name and password to use for server authentication.
*/
