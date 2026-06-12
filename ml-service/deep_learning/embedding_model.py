import torch
import numpy as np
from sentence_transformers import SentenceTransformer
import logging

logger = logging.getLogger(__name__)

class EmbeddingModel:
    """Handles text embeddings using pre-trained transformer models"""
    
    def __init__(self, model_name='all-MiniLM-L6-v2'):
        logger.info(f"Loading embedding model: {model_name}")
        
        try:
            self.model = SentenceTransformer(model_name)
            self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
            self.model.to(self.device)
            self.embedding_dim = 384  # Dimension for all-MiniLM-L6-v2
            logger.info(f"Model loaded on {self.device}")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise
    
    def get_embedding(self, text: str) -> np.ndarray:
        """Get embedding vector for text"""
        if not text or len(text.strip()) == 0:
            return np.zeros(self.embedding_dim)
        
        # Truncate to avoid memory issues
        text = text[:2000]
        
        try:
            embedding = self.model.encode([text])[0]
            return embedding
        except Exception as e:
            logger.error(f"Embedding error: {e}")
            return np.zeros(self.embedding_dim)
    
    def get_similarity(self, text1: str, text2: str) -> float:
        """Calculate cosine similarity between two texts"""
        emb1 = self.get_embedding(text1)
        emb2 = self.get_embedding(text2)
        
        similarity = np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))
        return float(similarity)