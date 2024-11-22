from flask import Blueprint, Response, request, jsonify, current_app
from app.models.recipe import Recipe
import json
import asyncio
from app.services import extraction
from app.services import image_query 

api_bp = Blueprint('api', __name__)

@api_bp.route('/form-data', methods=['GET'])
def get_form_data():
    with open('form_data.json', 'r') as file:
        data = json.load(file)
    return jsonify(data)

@api_bp.route('/recommend', methods=['POST'])
async def recommend_recipes():  # Make this function async
    data = request.json
    category = data.get('category')
    dietary_preference = data.get('dietary_preference')
    ingredients = data.get('ingredients', [])
    calories = data.get('calories')
    time = data.get('time')
    keywords = data.get('keywords', [])
    keywords_name = data.get('keywords_name', [])

    try:
        if calories is not None:
            calories = int(calories)
        if time is not None:
            time = int(time)
    except ValueError:
        return jsonify({"error": "Calories and time must be integers if provided"}), 400

    feature_weights_recommend = {
        'ingredients': 0.15, 'category': 0.25, 'dietary': 0.20,
        'calories': 0.10, 'time': 0.10, 'keywords': 0.10, 'keywords_name': 0.10
    }

    # Use await to call the async function
    recommendations = await current_app.recommendation_system.get_recommendations(
        category=category,
        dietary_preference=dietary_preference,
        ingredients=ingredients,
        calories=calories,
        time=time,
        keywords=keywords,
        keywords_name=keywords_name,
        feature_weights=feature_weights_recommend
    )

    return jsonify([vars(recipe) for recipe in recommendations])

@api_bp.route('/extract-recipe-attributes', methods=['POST'])
async def recommend_recipes2():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        raw_text = data.get('text')
        if not raw_text:
            return jsonify({"error": "No search text provided"}), 400

        # Extract recipe attributes
        extracted_info = extraction.extract_recipe_attributes(raw_text)  # Call the extraction function

        # Check if extraction was successful
        if 'error' in extracted_info:
            return jsonify(extracted_info), 500
        
        feature_weights_extract = {
            'ingredients': 0.50, 'category': 0.0, 'dietary': 0.0,
            'calories': 0.0, 'time': 0.0, 'keywords': 0.40, 'keywords_name': 0.10
        }

        # Access the extracted attributes
        category = extracted_info.get('category', '')
        calories = extracted_info.get('calories', None)
        time = extracted_info.get('time', None)
        keywords = extracted_info.get('keywords', [])
        keywords_name = extracted_info.get('keywords_name', [])
        ingredients = extracted_info.get('ingredients', [])

        # Convert calories and time to integers if they exist
        try:
            calories = int(calories) if calories else None
            time = int(time) if time else None
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid calories or time value"}), 400

        # Get recommendations using the recommendation system
        recommendations = await current_app.recommendation_system.get_recommendations(
            category=category,
            ingredients=ingredients,  # Adjust if you plan to add ingredients in the extraction function
            calories=calories,
            time=time,
            keywords=keywords,
            keywords_name=keywords_name,
            feature_weights=feature_weights_extract
        )

        # Convert recommendations to JSON-serializable format
        recipe_list = [vars(recipe) for recipe in recommendations]

        return jsonify(recipe_list)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# searchImage
@api_bp.route('/analyze-food-image', methods=['POST'])
async def handle_analyze_food_image():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
            
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        
        # Call the analyze function with the file
        description = image_query.analyze_food_image(file)
        
        # Extract recipe attributes
        extracted_info = extraction.extract_recipe_attributes(description)  # Call the extraction function

        # Check if extraction was successful
        if 'error' in extracted_info:
            return jsonify(extracted_info), 500

        feature_weights_extract = {
            'ingredients': 0.50, 'category': 0.0, 'dietary': 0.0,
            'calories': 0.0, 'time': 0.0, 'keywords': 0.40, 'keywords_name': 0.10
        }

        # Access the extracted attributes
        category = extracted_info.get('category', '')
        calories = extracted_info.get('calories', None)
        time = extracted_info.get('time', None)
        keywords = extracted_info.get('keywords', [])
        keywords_name = extracted_info.get('keywords_name', [])
        ingredients = extracted_info.get('ingredients', [])

        # Convert calories and time to integers if they exist
        try:
            calories = int(calories) if calories else None
            time = int(time) if time else None
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid calories or time value"}), 400

        # Get recommendations using the recommendation system
        recommendations = await current_app.recommendation_system.get_recommendations(
            category=category,
            ingredients=ingredients,  # Adjust if you plan to add ingredients in the extraction function
            calories=calories,
            time=time,
            keywords=keywords,
            keywords_name=keywords_name,
            feature_weights=feature_weights_extract
        )

        # Convert recommendations to JSON-serializable format
        recipe_list = [vars(recipe) for recipe in recommendations]

        return jsonify(recipe_list)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    