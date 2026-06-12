import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

class SimilarityScorer:
    """Calculate similarity scores between embeddings"""
    
    @staticmethod
    def cosine_similarity(emb1: np.ndarray, emb2: np.ndarray) -> float:
        """Calculate cosine similarity between two embeddings"""
        if emb1 is None or emb2 is None:
            return 0.0
        
        emb1 = emb1.reshape(1, -1)
        emb2 = emb2.reshape(1, -1)
        similarity = cosine_similarity(emb1, emb2)[0][0]
        return float(max(0, min(1, similarity)))
    
    @staticmethod
    def euclidean_distance(emb1: np.ndarray, emb2: np.ndarray) -> float:
        """Calculate Euclidean distance"""
        return float(np.linalg.norm(emb1 - emb2))