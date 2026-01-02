const fs = require('fs');
const path = require('path');

function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            scanDir(fullPath);
        } else if (file.endsWith('.json')) {
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                if (content.trim() === '') {
                    console.log('EMPTY JSON:', fullPath);
                } else {
                    JSON.parse(content);
                }
            } catch (e) {
                console.log('INVALID JSON:', fullPath, e.message);
            }
        }
    }
}

console.log('Scanning node_modules for invalid JSON...');
scanDir(path.resolve(__dirname, 'node_modules'));
console.log('Scan complete.');
