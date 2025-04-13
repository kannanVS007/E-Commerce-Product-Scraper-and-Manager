// This script requires Node.js v18 or higher
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function main() {
  try {
    console.log('Testing /api/v1/scrape/status endpoint...');
    const statusResponse = await fetch('http://localhost:3003/api/v1/scrape/status');
    console.log(`Status Code: ${statusResponse.status}`);
    const statusData = await statusResponse.json();
    console.log(`Response: ${JSON.stringify(statusData, null, 2)}`);
    
    console.log('\nTesting /api/v1/scrape/start endpoint...');
    const startResponse = await fetch('http://localhost:3003/api/v1/scrape/start', {
      method: 'POST'
    });
    console.log(`Status Code: ${startResponse.status}`);
    const startData = await startResponse.json();
    console.log(`Response: ${JSON.stringify(startData, null, 2)}`);
    
    console.log('\nTesting /api/v1/products endpoint...');
    const productsResponse = await fetch('http://localhost:3003/api/v1/products');
    console.log(`Status Code: ${productsResponse.status}`);
    const productsData = await productsResponse.json();
    console.log(`Response: ${JSON.stringify(productsData, null, 2)}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 