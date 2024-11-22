/* eslint-disable react/jsx-key */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { Star, Clock, Flame, X } from "lucide-react";
import { account } from "@/lib/appwrite";

interface Recipe {
  RecipeId: number;
  Name: string;
  RecipeCategory: string;
  RecipeIngredientParts: string[];
  RecipeIngredientQuantities: string[];
  Keywords: string[];
  keywords_name: string[];
  Calories: number;
  TotalTime_minutes: number;
  AggregatedRating: number;
  ReviewCount: number;
  Description: string;
  RecipeInstructions: string[];
  Images: string[];
  Similarity: number;
}

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => (
  <button
  className={`bg-gradient-to-r from-green-500 to-green-700 text-white font-bold py-3 px-6 rounded-full hover:from-green-600 hover:to-green-800 transition-all duration-300 transform hover:scale-105 ${className}`}
    {...props}
  >
    {children}
  </button>
);

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-zinc-900 text-white rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-hidden">
        {children}
      </div>
    </div>
  );
};

interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
}

const ScrollArea: React.FC<ScrollAreaProps> = ({ children, className }) => (
  <div className={`overflow-auto ${className}`}>
    {children}
  </div>
);

const RecommendationsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const session = await account.getSession('current');
        console.log('Session:', session);
        if (session) {
          setUserId(session.userId);
          console.log('User ID:', session.userId);
        }
      } catch (error) {
         console.error('Error fetching user session:', error);
       }finally {
        setIsSessionLoading(false);  // Add this line here
      }
    };
    fetchUserSession();
  }, []);

  useEffect(() => {
    const handleRecommendations = async () => {
      try {
        const storedRecommendations = sessionStorage.getItem('recommendations');
        console.log('[Storage Debug] Stored recommendations exist:', !!storedRecommendations);
        
        if (storedRecommendations) {
          const parsedRecommendations = JSON.parse(storedRecommendations);
          console.log('[Storage Debug] Parsed recommendations count:', parsedRecommendations.length);
          
          // Set recommendations state for all users
          setRecommendations(parsedRecommendations);
          
          // Save to MongoDB only for logged-in users
          if (userId) {
            try {
              console.log('[MongoDB Debug] Attempting to save to MongoDB. UserId:', userId);
              
              const response = await fetch('/api/search-history', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userId,
                  searchData: parsedRecommendations,
                  totalResults: parsedRecommendations.length
                }),
              });
              
              const responseData = await response.json();
              console.log('[MongoDB Debug] Save response:', responseData);
              
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
            } catch (mongoError) {
              console.error('[MongoDB Error] Failed to save to MongoDB:', mongoError);
            }
          } else {
            console.log('[Info] User not logged in, skipping MongoDB save');
          }
          
          // Clear storage after displaying recommendations (for all users)
          sessionStorage.removeItem('recommendations');
          console.log('[Storage Debug] Recommendations cleared from session storage');
        } else {
          console.log('[Storage Debug] No recommendations found in session storage');
        }
      } catch (error) {
        console.error('[General Error] Error processing recommendations:', error);
      } finally {
        setTimeout(() => {
          setIsRecommendationsLoading(false);
        }, 1000);
      }
    };

    // Call handleRecommendations when isSessionLoading is false
    if (!isSessionLoading) {
      handleRecommendations();
    }
  }, [userId, isSessionLoading]); 

  const defaultImageUrl = "default.png";

  const RecipeCard: React.FC<{ recipe: Recipe }> = ({ recipe }) => (
    <div
      className="bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer h-full"
      onClick={() => setSelectedRecipe(recipe)}
    >
      <div className="relative">
        <img
          src={recipe.Images[0] || defaultImageUrl}
          alt={recipe.Name}
          className="w-full h-56 object-cover"
          loading="lazy"
          onError={(e) => (e.currentTarget.src = defaultImageUrl)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
        <div className="absolute top-3 right-3 bg-yellow-400 rounded-full p-2 flex items-center space-x-1">
          <Star className="w-4 h-4 text-gray-900" />
          <span className="font-bold text-gray-900">{recipe.AggregatedRating.toFixed(1)}</span>
        </div>
        <h3 className="absolute bottom-3 left-3 text-white font-bold text-xl truncate w-11/12">
          {recipe.Name}
        </h3>
      </div>
      <div className="p-4 text-white">
        <p className="text-sm text-gray-300 mb-3 line-clamp-2">{recipe.Description}</p>
        <div className="flex justify-between text-sm">
          <span className="flex items-center bg-zinc-700 rounded-full px-3 py-1">
            <Flame className="w-4 h-4 text-red-400 mr-2" />
            {recipe.Calories.toFixed(0)} cal
          </span>
          <span className="flex items-center bg-zinc-700 rounded-full px-3 py-1">
            <Clock className="w-4 h-4 text-blue-400 mr-2" />
            {recipe.TotalTime_minutes} mins
          </span>
        </div>
      </div>
    </div>
  );

  const RecipeCardSkeleton: React.FC = () => (
    <div className="bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-xl overflow-hidden shadow-lg h-full">
      <div className="relative">
        {/* Image skeleton */}
        <div className="w-full h-56 bg-gradient-to-r from-zinc-800 to-zinc-700 animate-pulse" />
        
        {/* Rating badge skeleton */}
        <div className="absolute top-3 right-3 bg-gradient-to-r from-zinc-700 to-zinc-600 rounded-full w-16 h-8 animate-pulse" />
        
        {/* Title skeleton */}
        <div className="absolute bottom-3 left-3 w-3/4">
          <div className="h-6 bg-gradient-to-r from-zinc-700 to-zinc-600 rounded animate-pulse" />
        </div>
      </div>
      
      <div className="p-4">
        {/* Description skeleton */}
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-gradient-to-r from-zinc-700 to-zinc-600 rounded animate-pulse" />
          <div className="h-4 bg-gradient-to-r from-zinc-700 to-zinc-600 rounded animate-pulse w-3/4" />
        </div>
        
        {/* Stats container */}
        <div className="flex justify-between text-sm">
          {/* Calories skeleton */}
          <div className="bg-gradient-to-r from-zinc-700 to-zinc-600 rounded-full h-8 w-24 animate-pulse" />
          
          {/* Time skeleton */}
          <div className="bg-gradient-to-r from-zinc-700 to-zinc-600 rounded-full h-8 w-24 animate-pulse" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 bg-gradient-to-b from-[#0f0f0f] via-[#1c1c1c] to-[#252525] p-8 overflow-x-hidden" style={{
      backgroundImage: `url('/bg.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      {(isSessionLoading || isRecommendationsLoading) ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(6)].map((_, index) => (
            <RecipeCardSkeleton key={index} />
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-white text-center p-10 text-2xl">No recommendations found. Try searching through form.</div>
      ) : (
        <div className="mt-12">
      <h1 className="text-4xl font-bold text-center mb-1 text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">Recipe Recommendations</h1>
      <div className="max-w-8xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {recommendations.slice(0, 6).map((recipe) => (
            <div className="h-full">
              <RecipeCard key={recipe.RecipeId} recipe={recipe} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )}

      <Dialog open={!!selectedRecipe} onClose={() => setSelectedRecipe(null)}>
        {selectedRecipe && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold">{selectedRecipe.Name}</h2>
              <button
                onClick={() => setSelectedRecipe(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <ScrollArea className="max-h-[calc(80vh-4rem)] pr-4">
              <div className="space-y-6">
                <img
                  src={selectedRecipe.Images[0] || defaultImageUrl}
                  alt={selectedRecipe.Name}
                  className="w-full h-56 object-cover rounded-lg"
                  onError={(e) => (e.currentTarget.src = defaultImageUrl)}
                />
                <div className="flex justify-between items-center bg-zinc-800 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Star className="w-6 h-6 text-yellow-400 mr-2" />
                    <span className="text-lg">{selectedRecipe.AggregatedRating.toFixed(1)} ({selectedRecipe.ReviewCount} reviews)</span>
                  </div>
                  <div className="flex space-x-4">
                    <span className="flex items-center bg-zinc-700 rounded-full px-4 py-2">
                      <Flame className="w-5 h-5 text-red-400 mr-2" />
                      {selectedRecipe.Calories.toFixed(0)} cal
                    </span>
                    <span className="flex items-center bg-zinc-700 rounded-full px-4 py-2">
                      <Clock className="w-5 h-5 text-blue-400 mr-2" />
                      {selectedRecipe.TotalTime_minutes} mins
                    </span>
                  </div>
                </div>
                <p className="text-gray-300 text-lg">{selectedRecipe.Description}</p>
                <div className="bg-zinc-800 p-4 rounded-lg">
                  <h4 className="text-xl font-semibold mb-2">Category</h4>
                  <p className="text-gray-300">{selectedRecipe.RecipeCategory}</p>
                </div>
                <div className="bg-zinc-800 p-4 rounded-lg">
                  <h4 className="text-xl font-semibold mb-2">Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecipe.Keywords.map((keyword, index) => (
                      <span key={index} className="bg-zinc-700 text-gray-300 px-3 py-1 rounded-full text-sm">{keyword}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-zinc-800 p-4 rounded-lg">
                  <h4 className="text-xl font-semibold mb-2">Ingredients</h4>
                  <ul className="list-disc list-inside text-gray-300 space-y-2">
                    {selectedRecipe.RecipeIngredientParts.map((ingredient, index) => (
                      <li key={index}>
                        <span className="font-medium">{selectedRecipe.RecipeIngredientQuantities[index]}</span> {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-zinc-800 p-4 rounded-lg">
                  <h4 className="text-xl font-semibold mb-2">Instructions</h4>
                  <ol className="list-decimal list-inside text-gray-300 space-y-4">
                    {selectedRecipe.RecipeInstructions.map((instruction, index) => (
                      <li key={index} className="pl-2">{instruction}</li>
                    ))}
                  </ol>
                </div>
                <div className="bg-zinc-800 p-4 rounded-lg">
                  <h4 className="text-xl font-semibold mb-2">Similarity</h4>
                  <div className="w-full bg-zinc-700 rounded-full h-4">
                    <div
                      className="bg-green-500 h-4 rounded-full"
                      style={{ width: `${selectedRecipe.Similarity * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-300 mt-2">{(selectedRecipe.Similarity * 100).toFixed(2)}% match</p>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </Dialog>
      <div className="mt-12 text-center">
        <Button onClick={() => window.location.href = "/form"}>
          Back to Recommendation Form
        </Button>
      </div>
    </div>
  );
};

export default RecommendationsPage;