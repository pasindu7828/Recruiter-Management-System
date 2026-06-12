import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

/**
 * ML Service Client
 * Handles communication with Python Deep Learning CV Filtering Service
 */
class MLServiceClient {
    constructor() {
        this.baseURL = process.env.ML_SERVICE_URL || 'http://localhost:5001';
        this.timeout = parseInt(process.env.ML_SERVICE_TIMEOUT) || 30000;
        this.apiKey = process.env.ML_API_KEY || null;
        this.retries = parseInt(process.env.ML_SERVICE_RETRIES) || 3;
        this.retryDelay = parseInt(process.env.ML_SERVICE_RETRY_DELAY) || 1000;
    }

    /**
     * Analyze a single CV against job description
     * @param {Object} cvFile - The CV file object (from multer)
     * @param {string} jobDescription - Job description text
     * @returns {Promise<Object>} Analysis results
     */
    async analyzeCV(cvFile, jobDescription) {
        let lastError = null;
        
        for (let attempt = 1; attempt <= this.retries; attempt++) {
            try {
                const formData = new FormData();
                formData.append('job_description', jobDescription);
                
                // Handle different file input types
                if (cvFile.buffer) {
                    // File from multer memory storage
                    formData.append('cv', cvFile.buffer, {
                        filename: cvFile.originalname,
                        contentType: cvFile.mimetype
                    });
                } else if (cvFile.path) {
                    // File from disk storage
                    formData.append('cv', fs.createReadStream(cvFile.path), {
                        filename: path.basename(cvFile.path),
                        contentType: cvFile.mimetype
                    });
                } else if (typeof cvFile === 'string') {
                    // File path string
                    formData.append('cv', fs.createReadStream(cvFile), {
                        filename: path.basename(cvFile)
                    });
                } else {
                    throw new Error('Invalid CV file format');
                }

                const headers = {
                    ...formData.getHeaders(),
                    'X-API-Key': this.apiKey,
                    'X-Request-ID': this.generateRequestId()
                };

                const response = await axios.post(
                    `${this.baseURL}/analyze-cv`,
                    formData,
                    {
                        headers,
                        timeout: this.timeout,
                        maxContentLength: Infinity,
                        maxBodyLength: Infinity
                    }
                );

                // Add metadata to response
                return {
                    ...response.data,
                    _metadata: {
                        processedAt: new Date().toISOString(),
                        serviceUrl: this.baseURL,
                        attempt: attempt
                    }
                };

            } catch (error) {
                lastError = error;
                console.error(`ML Service attempt ${attempt} failed:`, error.message);
                
                if (attempt < this.retries) {
                    await this.delay(this.retryDelay * attempt);
                }
            }
        }
        
        throw this.formatError(lastError);
    }

    /**
     * Analyze multiple CVs in batch
     * @param {Array} cvFiles - Array of CV file objects
     * @param {string} jobDescription - Job description text
     * @returns {Promise<Object>} Batch analysis results
     */
    async batchAnalyze(cvFiles, jobDescription) {
        if (!cvFiles || cvFiles.length === 0) {
            throw new Error('No CV files provided');
        }

        try {
            const formData = new FormData();
            formData.append('job_description', jobDescription);
            
            // Add all CV files
            cvFiles.forEach((cvFile, index) => {
                if (cvFile.buffer) {
                    formData.append('cvs', cvFile.buffer, {
                        filename: cvFile.originalname || `cv_${index}.pdf`,
                        contentType: cvFile.mimetype
                    });
                } else if (cvFile.path) {
                    formData.append('cvs', fs.createReadStream(cvFile.path), {
                        filename: path.basename(cvFile.path)
                    });
                }
            });

            const headers = {
                ...formData.getHeaders(),
                'X-API-Key': this.apiKey
            };

            const response = await axios.post(
                `${this.baseURL}/batch-analyze`,
                formData,
                {
                    headers,
                    timeout: this.timeout * 2 // Longer timeout for batch
                }
            );

            return response.data;

        } catch (error) {
            console.error('Batch analysis error:', error.message);
            throw this.formatError(error);
        }
    }

    /**
     * Extract text from CV only (without analysis)
     * @param {Object} cvFile - CV file object
     * @returns {Promise<Object>} Extracted text
     */
    async extractText(cvFile) {
        try {
            const formData = new FormData();
            
            if (cvFile.buffer) {
                formData.append('cv', cvFile.buffer, {
                    filename: cvFile.originalname,
                    contentType: cvFile.mimetype
                });
            } else if (cvFile.path) {
                formData.append('cv', fs.createReadStream(cvFile.path), {
                    filename: path.basename(cvFile.path)
                });
            }

            const headers = {
                ...formData.getHeaders(),
                'X-API-Key': this.apiKey
            };

            const response = await axios.post(
                `${this.baseURL}/extract-text`,
                formData,
                { headers, timeout: this.timeout }
            );

            return response.data;

        } catch (error) {
            console.error('Text extraction error:', error.message);
            throw this.formatError(error);
        }
    }

    /**
     * Check ML service health
     * @returns {Promise<Object>} Health status
     */
    async healthCheck() {
        try {
            const response = await axios.get(`${this.baseURL}/health`, {
                timeout: 5000
            });
            return {
                status: 'healthy',
                ...response.data,
                serviceUrl: this.baseURL,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                serviceUrl: this.baseURL,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Send recruiter feedback to ML service
     * @param {Object} feedback - Feedback data
     * @returns {Promise<Object>} Response
     */
    async sendFeedback(feedback) {
        try {
            const response = await axios.post(
                `${this.baseURL}/collect-feedback`,
                feedback,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': this.apiKey
                    },
                    timeout: 10000
                }
            );
            return response.data;
        } catch (error) {
            console.error('Feedback sending error:', error.message);
            // Don't throw - feedback is optional
            return { success: false, error: error.message };
        }
    }

    /**
     * Wait for ML service to be ready
     * @param {number} maxAttempts - Maximum number of attempts
     * @returns {Promise<boolean>} True if ready
     */
    async waitForReady(maxAttempts = 30) {
        for (let i = 1; i <= maxAttempts; i++) {
            const health = await this.healthCheck();
            if (health.status === 'healthy' && health.models_loaded) {
                console.log(`✅ ML Service ready (attempt ${i})`);
                return true;
            }
            console.log(`⏳ Waiting for ML Service... (attempt ${i}/${maxAttempts})`);
            await this.delay(2000);
        }
        console.error('❌ ML Service not ready after maximum attempts');
        return false;
    }

    // ========== PRIVATE METHODS ==========

    /**
     * Generate unique request ID for tracking
     */
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Delay for specified milliseconds
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Format error for consistent response
     */
    formatError(error) {
        if (error.response) {
            // Server responded with error
            return new Error(`ML Service Error (${error.response.status}): ${error.response.data?.error || error.message}`);
        } else if (error.request) {
            // No response received
            return new Error(`ML Service unavailable: ${error.message}`);
        } else {
            // Request setup error
            return new Error(`ML Service request failed: ${error.message}`);
        }
    }
}

// Export singleton instance
export default new MLServiceClient();