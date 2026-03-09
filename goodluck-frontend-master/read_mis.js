const xlsx = require('./node_modules/xlsx');
const fs = require('fs');
const path = require('path');

const baseDir = 'GoodLuckDocs/MIS FILES-20260307T075812Z-3-001/MIS FILES';
const subDirs = ['', 'TA-DA', 'WORKSHOP'];

let output = '';

subDirs.forEach(subDir => {
    const dir = subDir ? path.join(baseDir, subDir) : baseDir;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.xlsx') || f.endsWith('.docx'));

    files.forEach(filename => {
        const filePath = path.join(dir, filename);

        if (filename.endsWith('.xlsx')) {
            try {
                const wb = xlsx.readFile(filePath);
                output += '\n' + '='.repeat(80) + '\n';
                output += 'FILE: ' + (subDir ? subDir + '/' : '') + filename + '\n';
                output += '='.repeat(80) + '\n';

                wb.SheetNames.forEach(sheetName => {
                    const ws = wb.Sheets[sheetName];
                    const data = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '' });
                    output += '\n--- Sheet: ' + sheetName + ' ---\n';
                    const nonEmpty = data.filter(row => row.some(cell => String(cell).trim() !== ''));
                    nonEmpty.slice(0, 60).forEach(row => {
                        const cols = row.map(c => String(c).trim()).filter(c => c);
                        if (cols.length > 0) output += cols.join(' | ') + '\n';
                    });
                    if (nonEmpty.length > 60) {
                        output += '... (' + (nonEmpty.length - 60) + ' more rows)\n';
                    }
                });
            } catch (e) {
                output += 'ERROR reading ' + filename + ': ' + e.message + '\n';
            }
        }
    });
});

fs.writeFileSync('mis_output.txt', output, 'utf8');
console.log('Done! Written to mis_output.txt');
console.log('Total chars:', output.length);
