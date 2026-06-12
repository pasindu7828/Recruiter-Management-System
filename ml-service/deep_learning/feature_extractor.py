import re
import json
import os
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class FeatureExtractor:
    """Extract features from CV text"""
    
    def __init__(self):
        # Education levels
        self.education_levels = {
            'phd': 5, 'doctorate': 5,
            'master': 4, 'm.s.': 4, 'm.sc': 4, 'm.a.': 4, 'mba': 4,
            'bachelor': 3, 'b.s.': 3, 'b.sc': 3, 'b.a.': 3, 'b.e.': 3, 'b.tech': 3,
            'associate': 2, 'diploma': 2,
            'high school': 1
        }
        
        # Skills database
        self.skills_db = self._load_skills_db()
    
    def _load_skills_db(self) -> Dict[str, List[str]]:
        """Load skills database"""
        default_skills = {
            'python': ['python', 'django', 'flask', 'fastapi', 'pandas', 'numpy'],
            'javascript': ['javascript', 'js', 'node.js', 'react', 'vue', 'angular'],
            'java': ['java', 'spring', 'spring boot', 'hibernate'],
            'sql': ['sql', 'mysql', 'postgresql', 'oracle', 'sql server'],
            'mongodb': ['mongodb', 'mongo', 'nosql'],
            'aws': ['aws', 'amazon web services', 'ec2', 's3', 'lambda'],
            'docker': ['docker', 'container', 'dockerfile'],
            'kubernetes': ['kubernetes', 'k8s', 'aks', 'eks'],
            'machine learning': ['machine learning', 'ml', 'deep learning', 'tensorflow', 'pytorch'],
            'git': ['git', 'github', 'gitlab'],
            'ci/cd': ['jenkins', 'gitlab ci', 'github actions', 'circleci']
        }
        
        # Try to load from file
        db_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'skills_db.json')
        try:
            if os.path.exists(db_path):
                with open(db_path, 'r') as f:
                    return json.load(f)
        except:
            pass
        
        return default_skills
    
    def extract_all(self, text: str) -> Dict:
        """Extract all features"""
        return {
            'skills': self.extract_skills(text),
            'experience_years': self.extract_experience(text),
            'education': self.extract_education(text),
            'education_level': self.extract_education_level(text),
            'email': self.extract_email(text),
            'phone': self.extract_phone(text),
            'name': self.extract_name(text)
        }
    
    def extract_skills(self, text: str) -> List[str]:
        """Extract skills"""
        found = set()
        text_lower = text.lower()
        
        for skill, variations in self.skills_db.items():
            for variation in variations:
                if variation in text_lower:
                    found.add(skill)
                    break
        
        return list(found)
    
    def extract_experience(self, text: str) -> float:
        """Extract years of experience"""
        total = 0
        
        # Direct mentions
        patterns = [
            r'(\d+)\+?\s*years?\s+of\s+experience',
            r'experience\s+of\s*(\d+)\+?\s*years?',
            r'(\d+)\+?\s*years?\s+experience',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text)
            if matches:
                total = max(total, int(matches[0]))
        
        # Date ranges
        date_pattern = r'(19|20)\d{2}\s*[-–]\s*((19|20)\d{2}|present)'
        matches = re.findall(date_pattern, text, re.IGNORECASE)
        
        for match in matches:
            start = int(match[0])
            end_str = match[1].lower()
            end = 2024 if end_str == 'present' else int(end_str)
            
            if 1900 < start < 2100 and 1900 < end < 2100:
                total += (end - start)
        
        return min(total, 30.0)
    
    def extract_education(self, text: str) -> str:
        """Extract highest education with proper degree names"""
        text_lower = text.lower()
    
    # Check for specific degree patterns (highest first)
        if 'phd' in text_lower or 'doctorate' in text_lower:
            return 'PhD'
    
        if 'master' in text_lower:
            return 'Master'
        
        if 'mba' in text_lower:
            return 'MBA'
        
        if 'b.s.' in text_lower or 'b.sc' in text_lower:
            return 'Bachelor'
        
        if 'm.s.' in text_lower or 'm.sc' in text_lower or 'm.a.' in text_lower:
            return 'Master'
    
        if 'bachelor' in text_lower:
            return 'Bachelor'
        
        if 'b.a.' in text_lower or 'b.e.' in text_lower or 'b.tech' in text_lower:
            return 'Bachelor'
    
        if 'associate' in text_lower or 'diploma' in text_lower:
            return 'Associate'
    
        if 'high school' in text_lower or 'secondary' in text_lower:
            return 'High School'
    
    # Fallback
        for degree in self.education_levels.keys():
            if degree in text_lower:
                return degree.capitalize()
    
        return "Not specified"

    def extract_education_level(self, text: str) -> int:
        """Extract education level as number"""
        text_lower = text.lower()
    
        # Check in order of precedence
        if 'phd' in text_lower or 'doctorate' in text_lower:
            return 5
    
        if 'master' in text_lower or 'mba' in text_lower:
            return 4
        if 'm.s.' in text_lower or 'm.sc' in text_lower or 'm.a.' in text_lower:
            return 4
    
        if 'bachelor' in text_lower:
            return 3
        if 'b.s.' in text_lower or 'b.sc' in text_lower:
            return 3
        if 'b.a.' in text_lower or 'b.e.' in text_lower or 'b.tech' in text_lower:
            return 3
    
        if 'associate' in text_lower or 'diploma' in text_lower:
            return 2
    
        if 'high school' in text_lower or 'secondary' in text_lower:
            return 1
    
        return 0
    
    def extract_email(self, text: str) -> str:
        """Extract email"""
        pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        match = re.search(pattern, text)
        return match.group(0) if match else None
    
    def extract_phone(self, text: str) -> str:
        """Extract phone number"""
        pattern = r'[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{3,4}[-\s\.]?[0-9]{4}'
        matches = re.findall(pattern, text)
        for match in matches:
            digits = re.sub(r'\D', '', match)
            if len(digits) >= 10:
                return match
        return None
    
    def extract_name(self, text: str) -> str:
        """Extract candidate name"""
        lines = text.split('\n')[:10]
        for line in lines:
            if len(line.strip()) > 0 and len(line.split()) <= 4:
                if re.match(r'^[A-Za-z\s]+$', line.strip()):
                    return line.strip()
        return "Not found"
    
    def extract_job_features(self, job_description: str) -> Dict:
        """Extract job requirements"""
        return {
            'required_skills': self.extract_skills(job_description),
            'required_experience': self._extract_required_exp(job_description),
            'required_education': self._extract_required_edu(job_description)
        }
    
    def _extract_required_exp(self, text: str) -> int:
        patterns = [
            r'(\d+)\+?\s*years?\s+of\s+experience\s+required',
            r'minimum\s+of\s*(\d+)\s*years?',
        ]
        for pattern in patterns:
            match = re.search(pattern, text.lower())
            if match:
                return int(match.group(1))
        
        if 'senior' in text.lower():
            return 5
        elif 'mid' in text.lower():
            return 3
        return 2
    
    def _extract_required_edu(self, text: str) -> int:
        text_lower = text.lower()
        for degree, level in self.education_levels.items():
            if degree in text_lower:
                return level
        return 0