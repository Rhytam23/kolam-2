const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\2020s\\.gemini\\antigravity\\brain\\4e4f1df8-25ca-4890-87fb-45a2337d2fb2';
const destDir = 'E:\\kolam-2-main\\public';

const files = fs.readdirSync(srcDir);
files.forEach(file => {
    if (file.startsWith('media__') && file.endsWith('.png')) {
        const srcPath = path.join(srcDir, file);
        const destPath = path.join(destDir, file);
        fs.copyFileSync(srcPath, destPath);
        console.log('Copied ' + file);
    }
});
