const mammoth = require('./node_modules/mammoth');
const fs = require('fs');
const path = require('path');

const baseDir = 'GoodLuckDocs/MIS FILES-20260307T075812Z-3-001/MIS FILES';

const docxFiles = [
    path.join(baseDir, 'MIS Reports list .docx'),
    path.join(baseDir, 'TA-DA/T.A_D.A . BILL PROCEDURE.docx'),
];

async function readDocx() {
    let output = '';

    for (const filePath of docxFiles) {
        output += '\n' + '='.repeat(80) + '\n';
        output += 'WORD FILE: ' + filePath + '\n';
        output += '='.repeat(80) + '\n';

        try {
            const result = await mammoth.extractRawText({ path: filePath });
            output += result.value + '\n';
        } catch (e) {
            output += 'ERROR: ' + e.message + '\n';
        }
    }

    fs.appendFileSync('mis_output.txt', output, 'utf8');
    console.log('Word files appended to mis_output.txt');
}

readDocx();
