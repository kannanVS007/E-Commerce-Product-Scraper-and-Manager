const { exec } = require('child_process');
const http = require('http');

// Function to check if a port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.once('error', () => {
      resolve(true);
    });
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port);
  });
}

// Function to kill the process using a port
async function killProcessOnPort(port) {
  return new Promise((resolve, reject) => {
    if (process.platform === 'win32') {
      exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
        if (error) {
          console.log(`No process found using port ${port}`);
          resolve();
          return;
        }
        
        const lines = stdout.split('\n');
        for (const line of lines) {
          if (line.includes(`:${port}`)) {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            
            exec(`taskkill /F /PID ${pid}`, (error) => {
              if (error) {
                console.error(`Error killing process ${pid}:`, error);
              } else {
                console.log(`Killed process ${pid} using port ${port}`);
              }
              resolve();
            });
            return;
          }
        }
        resolve();
      });
    } else {
      // For non-Windows platforms
      exec(`lsof -i :${port} | grep LISTEN | awk '{print $2}' | xargs kill -9`, (error) => {
        if (error) {
          console.log(`No process found using port ${port}`);
        } else {
          console.log(`Killed process using port ${port}`);
        }
        resolve();
      });
    }
  });
}

// Main function
async function main() {
  const port = 3001;
  
  console.log(`Checking if port ${port} is in use...`);
  const inUse = await isPortInUse(port);
  
  if (inUse) {
    console.log(`Port ${port} is in use. Attempting to kill the process...`);
    await killProcessOnPort(port);
    
    // Wait a moment for the port to be released
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('Starting the server...');
  const server = exec('npm run dev', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error starting server: ${error}`);
      return;
    }
    console.log(stdout);
    if (stderr) {
      console.error(stderr);
    }
  });
  
  server.stdout.on('data', (data) => {
    console.log(data);
  });
  
  server.stderr.on('data', (data) => {
    console.error(data);
  });
}

main().catch(console.error); 