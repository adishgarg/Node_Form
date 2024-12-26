const http = require('http');
const fs = require('fs');
const url = require('url');
const querystring = require('querystring');

const serveHTML = (res) => {
    fs.readFile('index.html', 'utf8', (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error loading the HTML file.');
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    });
};

const saveUserData = (userData) => {
    fs.readFile('user.json', 'utf8', (err, data) => {
        let users = [];
        if (!err) {
            users = JSON.parse(data);
        }
        users.push(userData);
        fs.writeFile('user.json', JSON.stringify(users, null, 2), (err) => {
            if (err) console.log('Error saving user data:', err);
        });
    });
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    const method = req.method;

    if (parsedUrl.pathname === '/') {
        serveHTML(res);
    } else if (parsedUrl.pathname === '/signup' && method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            const userData = querystring.parse(body);
            const { name, rollNumber, dob, email, gender, password, address } = userData;

            fs.readFile('user.json', 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error reading users data.');
                    return;
                }

                const users = JSON.parse(data);
                const userExists = users.some(u => u.email === email);

                if (userExists) {
                    res.writeHead(400, { 'Content-Type': 'text/plain' });
                    res.end('Email already registered. Please use another email.');
                } else {
                    const user = { name, rollNumber, dob, email, gender, password, address };
                    saveUserData(user);
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end('User successfully registered');
                }
            });
        });
    } else if (parsedUrl.pathname === '/signin' && method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            const credentials = querystring.parse(body);
            const { email, password } = credentials;

            fs.readFile('user.json', 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error reading users data.');
                    return;
                }

                const users = JSON.parse(data);
                const user = users.find(u => u.email === email && u.password === password);

                if (user) {
                    const userInfo = `Welcome ${user.name}!\nEmail: ${user.email}\nRoll Number: ${user.rollNumber}\nDOB: ${user.dob}\nGender: ${user.gender}\nAddress: ${user.address}`;
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end(userInfo);
                } else {
                    res.writeHead(401, { 'Content-Type': 'text/plain' });
                    res.end('Invalid credentials. Please try again.');
                }
            });
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Page not found.');
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
