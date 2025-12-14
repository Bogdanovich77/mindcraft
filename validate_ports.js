/**
 * Port validation script to verify all services start on correct ports
 */

import http from 'http';

// Function to check if a port is in use
function checkPort(port) {
    return new Promise((resolve) => {
        const server = http.createServer();
        
        server.listen(port, () => {
            server.close(() => {
                resolve(false); // Port is available
            });
        });
        
        server.on('error', () => {
            resolve(true); // Port is in use
        });
    });
}

// Function to check if a service is responding on a port
async function checkService(port, path = '/') {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: port,
            path: path,
            method: 'GET',
            timeout: 2000
        };

        const req = http.request(options, (res) => {
            resolve(res.statusCode < 500); // Service is responding
        });

        req.on('error', () => {
            resolve(false); // Service not responding
        });

        req.on('timeout', () => {
            req.destroy();
            resolve(false); // Service not responding
        });

        req.end();
    });
}

async function main() {
    console.log('🔍 Validating port configuration for 3-tier architecture...\n');

    const services = [
        { name: 'Node.js Agent Core', port: 8081, path: '/', internal: true },
        { name: 'FastAPI Gateway', port: 8000, path: '/health', internal: false },
        { name: 'Frontend Dashboard', port: 5173, path: '/', internal: false }
    ];

    console.log('Checking port availability...');
    for (const service of services) {
        const inUse = await checkPort(service.port);
        if (inUse) {
            const responding = await checkService(service.port, service.path);
            if (responding) {
                console.log(`✅ ${service.name}: Port ${service.port} is in use and responding`);
            } else {
                console.log(`⚠️  ${service.name}: Port ${service.port} is in use but not responding`);
            }
        } else {
            console.log(`❌ ${service.name}: Port ${service.port} is available (service not running)`);
        }
    }

    console.log('\n📋 Expected Port Configuration:');
    console.log('=====================================');
    services.forEach(service => {
        const type = service.internal ? 'Internal' : 'External';
        console.log(`• ${service.name}: ${service.port} (${type})`);
    });

    console.log('\n🚀 To start all services:');
    console.log('  • Windows: run start-bots.bat');
    console.log('  • Linux/macOS: ./start-bots.sh');
    
    console.log('\n🌐 Service URLs:');
    console.log('  • FastAPI Gateway:    http://localhost:8000');
    console.log('  • API Documentation:   http://localhost:8000/docs');
    console.log('  • Frontend Dashboard:  http://localhost:5173');
    console.log('  • WebSocket Status:    http://localhost:8000/api/websocket/status');
}

main().catch(console.error);