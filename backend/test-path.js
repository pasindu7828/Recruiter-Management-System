// test-path.js
import path from 'path';
import fs from 'fs';

const testPath = "uploads/resumes/1774337894315-B.M.P.Piyumal Premachandra CV.pdf";
const fullPath = path.join(process.cwd(), testPath);

console.log('Looking for CV at:', fullPath);
console.log('File exists:', fs.existsSync(fullPath));

if (fs.existsSync(fullPath)) {
    console.log('✅ CV found! Ready for ML service');
} else {
    console.log('❌ CV not found!');
    
    // List what's in uploads/resumes
    const dir = path.join(process.cwd(), 'uploads', 'resumes');
    if (fs.existsSync(dir)) {
        console.log('\nFiles in uploads/resumes:');
        fs.readdirSync(dir).forEach(f => console.log('  -', f));
    }
}