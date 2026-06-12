import mlService from './services/mlService.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testCV() {
    console.log('🧪 Testing Real CV Analysis...\n');
    
    const cvPath = path.join(__dirname, 'test-cv.pdf');
    const jobDescription = 'Looking for Python developer with 3 years experience and AWS skills';
    
    console.log('📄 CV File:', cvPath);
    console.log('💼 Job Description:', jobDescription);
    console.log('');
    
    try {
        console.log('⏳ Analyzing CV (this may take a few seconds)...\n');
        
        const result = await mlService.analyzeCV(cvPath, jobDescription);
        
        console.log('📊 RESULTS:');
        console.log('=' .repeat(40));
        console.log(`🎯 Match Score: ${result.match_score}%`);
        console.log(`📌 Status: ${result.status_text}`);
        console.log(`⭐ Semantic Score: ${result.semantic_score}%`);
        console.log(`🔧 Skills Score: ${result.skills_score}%`);
        console.log(`💼 Experience Score: ${result.experience_score}%`);
        
        console.log('\n📋 Extracted Info:');
        console.log(`   Skills: ${result.extracted_info?.skills?.join(', ') || 'None'}`);
        console.log(`   Experience: ${result.extracted_info?.experience_years || 0} years`);
        console.log(`   Education: ${result.extracted_info?.education || 'Not specified'}`);
        console.log(`   Email: ${result.extracted_info?.email || 'Not found'}`);
        
        console.log('\n🔍 Job Match:');
        console.log(`   Required Skills: ${result.job_match?.required_skills?.join(', ') || 'None'}`);
        console.log(`   Missing Skills: ${result.job_match?.missing_skills?.join(', ') || 'None'}`);
        
        console.log('\n💡 Recommendations:');
        result.recommendations?.forEach(rec => console.log(`   • ${rec}`));
        
        console.log('\n✅ Analysis Complete!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    }
}

testCV();