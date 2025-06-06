const http = require('http');

// Function to make an HTTP request
function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: url,
      method: method
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

// Main function
async function main() {
  try {
    console.log('Testing /api/v1/scrape/status endpoint...');
    const statusResponse = await makeRequest('/api/v1/scrape/status');
    console.log(`Status Code: ${statusResponse.statusCode}`);
    console.log('Response Data:', statusResponse.data);
    
    console.log('\nTesting /api/v1/scrape/start endpoint...');
    const startResponse = await makeRequest('/api/v1/scrape/start', 'POST');
    console.log(`Status Code: ${startResponse.statusCode}`);
    console.log('Response Data:', startResponse.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the tests
main();
