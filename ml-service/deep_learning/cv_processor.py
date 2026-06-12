import logging
import numpy as np
from typing import Dict, Any, List

from .text_extractor import extract_text_from_file
from .embedding_model import EmbeddingModel
from .feature_extractor import FeatureExtractor
from .similarity_scorer import SimilarityScorer

logger = logging.getLogger(__name__)

class CVProcessor:
    """Main CV processing class using Deep Learning"""
    
    def __init__(self):
        """Initialize all DL models"""
        logger.info("Initializing CV Processor...")
        
        # Load embedding model
        logger.info("Loading embedding model...")
        self.embedding_model = EmbeddingModel()
        
        # Initialize feature extractor
        logger.info("Initializing feature extractor...")
        self.feature_extractor = FeatureExtractor()
        
        # Initialize similarity scorer
        self.similarity_scorer = SimilarityScorer()
        
        # Weights for scoring
        self.weights = {
            'semantic': 0.30,
            'skills': 0.40,
            'experience': 0.20,
            'education': 0.10
        }
        
        self._ready = True
        logger.info("✅ CV Processor ready!")
    
    def is_ready(self) -> bool:
        return self._ready
    
    def process_cv(self, cv_path: str, job_description: str) -> Dict[str, Any]:
        """Process CV and return analysis"""
        try:
            # Extract text
            cv_text = extract_text_from_file(cv_path)
            if not cv_text:
                raise ValueError("Could not extract text from CV")
            
            logger.info(f"Extracted {len(cv_text)} characters")
            
            # Get embeddings
            cv_embedding = self.embedding_model.get_embedding(cv_text[:2000])
            job_embedding = self.embedding_model.get_embedding(job_description[:2000])
            
            # Calculate semantic similarity
            semantic_score = self.similarity_scorer.cosine_similarity(
                cv_embedding, job_embedding
            )
            
            # Extract features
            cv_features = self.feature_extractor.extract_all(cv_text)
            job_features = self.feature_extractor.extract_job_features(job_description)
            
            # Calculate scores
            skills_score = self._calculate_skills_match(
                cv_features['skills'], 
                job_features['required_skills']
            )
            
            experience_score = self._calculate_experience_match(
                cv_features['experience_years'],
                job_features['required_experience']
            )
            
            education_score = self._calculate_education_match(
                cv_features['education_level'],
                job_features['required_education']
            )
            
            # Combine scores
            final_score = (
                semantic_score * self.weights['semantic'] +
                skills_score * self.weights['skills'] +
                experience_score * self.weights['experience'] +
                education_score * self.weights['education']
            ) * 100
            
            # Generate recommendations
            recommendations = self._generate_recommendations(
                final_score, cv_features, job_features
            )
            
            # Determine status
            status, status_text = self._determine_status(final_score)
            
            return {
                'match_score': round(final_score, 2),
                'status': status,
                'status_text': status_text,
                'semantic_score': round(semantic_score * 100, 2),
                'skills_score': round(skills_score * 100, 2),
                'experience_score': round(experience_score * 100, 2),
                'education_score': round(education_score * 100, 2),
                'extracted_info': {
                    'skills': cv_features['skills'],
                    'skills_count': len(cv_features['skills']),
                    'experience_years': cv_features['experience_years'],
                    'education': cv_features['education'],
                    'education_level': cv_features['education_level'],
                    'email': cv_features['email'],
                    'phone': cv_features['phone'],
                    'name': cv_features.get('name', 'Not found')
                },
                'job_match': {
                    'required_skills': job_features['required_skills'],
                    'missing_skills': list(set(job_features['required_skills']) - set(cv_features['skills'])),
                    'required_experience': job_features['required_experience'],
                    'experience_gap': max(0, job_features['required_experience'] - cv_features['experience_years']),
                    'skills_match_percentage': round(len(set(cv_features['skills']) & set(job_features['required_skills'])) / max(1, len(job_features['required_skills'])) * 100, 1)
                },
                'recommendations': recommendations,
                'analysis_summary': self._generate_summary(final_score, cv_features, job_features)
            }
        
        except Exception as e:
            logger.error(f"Process error: {str(e)}")
            raise
    
    def _calculate_skills_match(self, cv_skills: list, job_skills: list) -> float:
        if not job_skills:
            return 0.5
        
        cv_set = set(cv_skills)
        job_set = set(job_skills)
        
        if not cv_set:
            return 0.0
        
        matched = len(cv_set & job_set)
        match_ratio = matched / len(job_set)
        
        if cv_set.issuperset(job_set):
            match_ratio = min(1.0, match_ratio * 1.2)
        
        return min(1.0, match_ratio)
    
    def _calculate_experience_match(self, cv_exp: float, required_exp: float) -> float:
        if required_exp <= 0:
            return 0.5
        if cv_exp >= required_exp:
            return 1.0
        return cv_exp / required_exp
    
    def _calculate_education_match(self, cv_level: int, required_level: int) -> float:
        if required_level <= 0:
            return 0.5
        if cv_level >= required_level:
            return 1.0
        return cv_level / required_level
    
    def _generate_recommendations(self, score: float, cv_features: dict, job_features: dict) -> list:
        recommendations = []
        
        missing_skills = set(job_features['required_skills']) - set(cv_features['skills'])
        if missing_skills:
            recommendations.append(f"Missing key skills: {', '.join(list(missing_skills)[:5])}")
        
        exp_gap = job_features['required_experience'] - cv_features['experience_years']
        if exp_gap > 0:
            recommendations.append(f"Experience gap: {exp_gap} years less than required")
        
        if cv_features['education_level'] < job_features['required_education']:
            recommendations.append("Education level lower than required")
        
        if score >= 80:
            recommendations.append("Excellent match! Strongly recommend for interview")
        elif score >= 65:
            recommendations.append("Good match, consider for interview")
        elif score >= 50:
            recommendations.append("Potential candidate, review manually")
        else:
            recommendations.append("Low match, may not be suitable")
        
        return recommendations
    
    def _determine_status(self, score: float) -> tuple:
        if score >= 80:
            return "strong_shortlist", "Strong Candidate - Highly Recommended"
        elif score >= 65:
            return "shortlist", "Good Match - Consider for Interview"
        elif score >= 50:
            return "maybe", "Potential - Review Manually"
        else:
            return "reject", "Low Match - Not Recommended"
    
    def _generate_summary(self, score: float, cv_features: dict, job_features: dict) -> str:
        return (f"Candidate has {len(cv_features['skills'])} skills, "
                f"{cv_features['experience_years']} years experience. "
                f"Match score: {score:.1f}%")