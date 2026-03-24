const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const rootDir = __dirname;
const srcDir = path.join(rootDir, 'src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir(srcDir, function(filePath) {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    const code = fs.readFileSync(filePath, 'utf8');
    
    try {
      const result = babel.transformSync(code, {
        filename: filePath,
        presets: [
          ['@babel/preset-typescript', { isTSX: true, allExtensions: true }]
        ],
        plugins: ['@babel/plugin-syntax-jsx']
      });
      
      fs.writeFileSync(filePath, result.code);
      console.log(`Converted ${filePath}`);
    } catch (err) {
      console.error(`Error converting ${filePath}:`, err.message);
    }
  }
});
