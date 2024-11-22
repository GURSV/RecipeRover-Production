import logging
from app.services.image_search import ImageSearchService
from app.utils.data_loading import load_or_create_data
from app.utils.recommendation_utils import get_top_recommendations

logger = logging.getLogger(__name__)

class FlexibleRecipeRecommendationSystem:
    def __init__(self, csv_file_path, precomputed_dir):
        self.default_feature_weights = {
            'ingredients': 0.15, 'category': 0.25, 'dietary': 0.20,
            'calories': 0.10, 'time': 0.10, 'keywords': 0.10, 'keywords_name': 0.10
        }
        self.image_search_service = ImageSearchService()
        self.data = load_or_create_data(csv_file_path, precomputed_dir, self.default_feature_weights)

    async def get_recommendations(self, category=None, dietary_preference=None, ingredients=None,
                                  calories=None, time=None, keywords=None, keywords_name=None,
                                  top_n=6, feature_weights=None):
        # Use the provided feature_weights, or fall back to the default if not provided
        weights = feature_weights or self.default_feature_weights

        return await get_top_recommendations(
            self.data['df'], self.data['combined_matrix'], 
            self.data['tfidf_vectorizer_ingredients'],
            self.data['tfidf_vectorizer_keywords'], 
            self.data['tfidf_vectorizer_keywords_name'],
            self.data['category_dummies'], self.data['scaler'], 
            weights, self.image_search_service,
            category, dietary_preference, ingredients, 
            calories, time, keywords, keywords_name, top_n
        )