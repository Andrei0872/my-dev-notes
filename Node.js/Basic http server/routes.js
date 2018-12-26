
const fs = require('fs');
const os = require('os');

const form = `
    <form action='/message' method='POST'>
        <input type='text' name='info' placeholder='type here'>
        <button type='submit'>Submit</button>
    </form>
`;

const requestHandler = (req, resp) => {
    const method = req.method;
    console.log(`getting to server via ${method} request`);

    if (req.url === '/') {
        resp.setHeader('Content-type', 'text/html');
        resp.write(form);
        return resp.end();
    }

    if (req.url === '/message' && method === 'POST') {
        const body = [];

        // Whenever a new chunk is ready to be read
        req.on('data', (chunk) => {
            console.log('chunk', chunk) // #1
            body.push(chunk)
        });

        // When done parsing data
        // Return so the code outside this block won't get executed
        return req.on('end', () => {
            const parsedBody = Buffer.concat(body).toString();
            console.log('parsed body', parsedBody) // #2
            const message = parsedBody.split `=` [1];

            //! Block execution of the next line of code until this file is done
            // fs.writeFileSync('message.txt', message + os.EOL);

            //* Asynchronous way
            fs.writeFile('message.txt', message + os.EOL, err => {
                console.log('done parsing data; redirecting....') // #3
                resp.statusCode = 302;
                resp.setHeader('Location', '/');
                return resp.end();
            });
        });
    }

    resp.setHeader('Content-Type', 'text/html');
    resp.write('<strong>Hi!</strong>');
    resp.end();
}

module.exports = requestHandler;