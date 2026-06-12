import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import tempfile

# Import DL module
from deep_learning.cv_processor import CVProcessor

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask
app = Flask(__name__)
CORS(app)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024
app.config['UPLOAD_FOLDER'] = 'uploads'

# Create folders
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs('logs', exist_ok=True)

# Initialize CV Processor
logger.info("🚀 Loading Deep Learning models...")
try:
    cv_processor = CVProcessor()
    logger.info("✅ Models loaded successfully!")
except Exception as e:
    logger.error(f"❌ Failed to load models: {e}")
    cv_processor = None

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy' if cv_processor else 'unhealthy',
        'service': 'CV Filtering DL Service',
        'models_loaded': cv_processor.is_ready() if cv_processor else False,
        'version': '1.0.0'
    })

@app.route('/analyze-cv', methods=['POST'])
def analyze_cv():
    """Analyze a single CV"""
    if not cv_processor:
        return jsonify({'error': 'ML Service not ready'}), 503
    
    try:
        # Get job description
        job_description = request.form.get('job_description')
        if not job_description:
            return jsonify({'error': 'Missing job_description'}), 400
        
        # Get CV file
        if 'cv' not in request.files:
            return jsonify({'error': 'Missing CV file'}), 400
        
        cv_file = request.files['cv']
        if cv_file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400
        
        # Save temporarily
        filename = secure_filename(cv_file.filename)
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], f'temp_{filename}')
        cv_file.save(temp_path)
        
        try:
            # Process CV
            result = cv_processor.process_cv(temp_path, job_description)
            return jsonify(result)
        finally:
            # Clean up
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
    except Exception as e:
        logger.error(f"Error processing CV: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/batch-analyze', methods=['POST'])
def batch_analyze():
    """Analyze multiple CVs"""
    if not cv_processor:
        return jsonify({'error': 'ML Service not ready'}), 503
    
    try:
        job_description = request.form.get('job_description')
        if not job_description:
            return jsonify({'error': 'Missing job_description'}), 400
        
        if 'cvs' not in request.files:
            return jsonify({'error': 'Missing CV files'}), 400
        
        cvs = request.files.getlist('cvs')
        results = []
        
        for cv_file in cvs:
            if cv_file.filename == '':
                continue
            
            filename = secure_filename(cv_file.filename)
            temp_path = os.path.join(app.config['UPLOAD_FOLDER'], f'temp_{filename}')
            cv_file.save(temp_path)
            
            try:
                result = cv_processor.process_cv(temp_path, job_description)
                result['filename'] = filename
                results.append(result)
            except Exception as e:
                results.append({
                    'filename': filename,
                    'error': str(e)
                })
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
        
        # Sort by match score
        results.sort(key=lambda x: x.get('match_score', 0), reverse=True)
        
        return jsonify({
            'results': results,
            'total': len(results),
            'average_score': sum(r.get('match_score', 0) for r in results) / len(results) if results else 0
        })
    
    except Exception as e:
        logger.error(f"Batch error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/extract-text', methods=['POST'])
def extract_text():
    """Extract text only"""
    try:
        if 'cv' not in request.files:
            return jsonify({'error': 'Missing CV file'}), 400
        
        cv_file = request.files['cv']
        filename = secure_filename(cv_file.filename)
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], f'temp_{filename}')
        cv_file.save(temp_path)
        
        try:
            from deep_learning.text_extractor import extract_text_from_file
            text = extract_text_from_file(temp_path)
            return jsonify({
                'text': text,
                'length': len(text),
                'words': len(text.split())
            })
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.errorhandler(413)
def too_large(e):
    return jsonify({'error': 'File too large. Max size 10MB'}), 413

if __name__ == '__main__':
    port = int(os.environ.get('FLASK_PORT', 5001))
    host = os.environ.get('FLASK_HOST', '0.0.0.0')
    app.run(host=host, port=port, debug=True)