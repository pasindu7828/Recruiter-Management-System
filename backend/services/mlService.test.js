import mlService from './mlService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Test ML Service connection
 */
async function testMLService() {
    console.log('🧪 Testing ML Service...\n');

    // 1. Health Check
    console.log('1. Testing Health Check...');
    try {
        const health = await mlService.healthCheck();
        console.log(`   Status: ${health.status}`);
        console.log(`   Models Loaded: ${health.models_loaded}`);
        console.log(`   Service URL: ${health.serviceUrl}\n`);
    } catch (error) {
        console.error(`   Error: ${error.message}\n`);
        return;
    }

    // 2. Test with a sample CV (if exists)
    const sampleCVPath = path.join(__dirname, 'test-cv.pdf');
    if (fs.existsSync(sampleCVPath)) {
        console.log('2. Testing CV Analysis...');
        const jobDescription = 'Looking for Python developer with 3 years experience';
        
        try {
            const result = await mlService.analyzeCV(sampleCVPath, jobDescription);
            console.log(`   Match Score: ${result.match_score}%`);
            console.log(`   Status: ${result.status_text}`);
            console.log(`   Skills Found: ${result.extracted_info?.skills?.join(', ') || 'None'}`);
            console.log(`   Recommendations: ${result.recommendations?.[0] || 'None'}\n`);
        } catch (error) {
            console.error(`   Error: ${error.message}\n`);
        }
    } else {
        console.log('2. Skipping CV Analysis - no test-cv.pdf found\n');
    }

    // 3. Wait for ready
    console.log('3. Waiting for service readiness...');
    const ready = await mlService.waitForReady(3);
    console.log(`   Ready: ${ready ? '✅' : '❌'}\n`);

    console.log('✅ ML Service Test Complete!');
}

// Run test
testMLService().catch(console.error);