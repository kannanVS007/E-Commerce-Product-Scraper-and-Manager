const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/v1/scrape/status',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Data:');
    console.log(data);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end(); 