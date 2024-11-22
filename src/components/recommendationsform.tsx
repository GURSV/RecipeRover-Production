/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect } from "react";
import Select from 'react-select';
import Preloader from "@/components/ui/Preloader";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CookingPot, Clock, Utensils, Flame, ChefHat, UtensilsCrossed } from "lucide-react";

interface FormData {
  categories: string[];
  dietary_preferences: {
    [key: string]: string[];
  };
  ingredients: {
    [key: string]: {
      [key: string]: string[];
    };
  };
  calorie_ranges: {
    [key: string]: { min: number; max: number };
  };
  time_ranges: {
    [key: string]: { min: number; max: number };
  };
}

const RecipeRecommendationForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [category, setCategory] = useState("");
  const [dietaryPreference, setDietaryPreference] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [calories, setCalories] = useState(0);
  const [time, setTime] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableDietaryPreferences, setAvailableDietaryPreferences] = useState<string[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<string[]>([]);
  const [calorieRange, setCalorieRange] = useState({ min: 0, max: 1100 });
  const [timeRange, setTimeRange] = useState({ min: 0, max: 12000000 });

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const categoryOptions = formData
    ? formData.categories.map((cat) => ({ value: cat, label: cat }))
    : [];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 }
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function fetchFormData() {
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_FORM_URL!);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setFormData(data);
      } catch (error) {
        console.error("Error fetching form data:", error);
      }
    }

    fetchFormData();
  }, []);

  useEffect(() => {
    if (category && formData) {
      setAvailableDietaryPreferences(formData.dietary_preferences[category] || []);
      setDietaryPreference([]);
      setIngredients([]);
      if (formData.calorie_ranges && formData.calorie_ranges[category]) {
        setCalorieRange(formData.calorie_ranges[category]);
        setCalories(formData.calorie_ranges[category].min);
      } else {
        setCalorieRange({ min: 0, max: 1100 });
        setCalories(0);
      }
      if (formData.time_ranges && formData.time_ranges[category]) {
        setTimeRange(formData.time_ranges[category]);
        setTime(formData.time_ranges[category].min);
      } else {
        setTimeRange({ min: 0, max: 12000000 });
        setTime(0);
      }
    }
  }, [category, formData]);

  useEffect(() => {
    if (category && dietaryPreference.length > 0 && formData && formData.ingredients) {
      const mergedIngredients = dietaryPreference.flatMap(
        (preference) => formData.ingredients[category]?.[preference] || []
      );
      const uniqueIngredients = [...new Set(mergedIngredients)];
      setAvailableIngredients(uniqueIngredients);
      setIngredients([]);
    }
  }, [category, dietaryPreference, formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formPayload = {
      category,
      dietary_preference: dietaryPreference,
      ingredients,
      calories,
      time,
    };

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_RECOMEND_URL!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      const recommendations = await response.json();
      
      // Store recommendations in sessionStorage
      sessionStorage.setItem('recommendations', JSON.stringify(recommendations));
      
      // Use router.push to navigate to recommendations page
      router.push('/recommendations');
    } catch (error) {
      console.error("Error submitting the form:", error);
      setIsLoading(false);
    }
  };


  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: "#1a1a1a",
      color: "#FFFFFF",
      borderColor: state.isFocused ? "#22c55e" : "#374151",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(34, 197, 94, 0.2)" : "none",
      "&:hover": {
        borderColor: "#22c55e",
      },
      transition: "all 0.2s ease",
      borderRadius: "0.5rem",
      padding: "1px",
      minHeight: "36px",
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: "#1a1a1a",
      borderRadius: "0.5rem",
      overflow: "hidden",
      backdropFilter: "blur(8px)",
      zIndex: 9999, // Added high z-index to ensure dropdown appears above other elements
      position: 'absolute', // Ensure absolute positioning
    }),
    menuPortal: (base: any) => ({ // Added menuPortal styles
      ...base,
      zIndex: 9999
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: "#FFFFFF",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#22c55e" : state.isFocused ? "#1F2937" : "#1a1a1a",
      color: "#FFFFFF",
      "&:hover": {
        backgroundColor: "#1F2937",
      },
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: "#22c55e",
      borderRadius: "0.25rem",
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: "#FFFFFF",
      fontSize: "0.875rem",
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: "#FFFFFF",
      "&:hover": {
        backgroundColor: "#DC2626",
        color: "#FFFFFF",
      },
    }),
  };
  
  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <Preloader />
        </div>
      )}
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-xl mx-auto"
      >
        <div className="text-center mb-6">
          <motion.h1 
            className="text-3xl font-bold text-white mb-1"
            variants={itemVariants}
          >
            Your Perfect Recipe Awaits
          </motion.h1>
          <motion.p 
            className="text-green-400 text-base" // Changed to green
            variants={itemVariants}
          >
            Tell us what you're craving today
          </motion.p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6 backdrop-blur-lg bg-[#1a1a1a] bg-opacity-90 p-5 rounded-xl shadow-2xl border border-gray-800 relative" // Added relative positioning
          variants={containerVariants}
        >
          {/* Category Selection */}
          <motion.div variants={itemVariants} className="form-group">
            <label className="flex items-center text-white text-sm font-medium mb-1">
              <ChefHat className="w-4 h-4 mr-2 text-green-400" />
              Category
            </label>
            <Select
              id="category"
              value={categoryOptions.find((option) => option.value === category)}
              onChange={(option) => setCategory(option?.value || "")}
              options={categoryOptions}
              styles={customSelectStyles}
              placeholder="Select a category..."
              menuPortalTarget={isMounted ? document.body : null} // Add this to render menu in a portal
              menuPosition="fixed" // Set menu position to fixed
            />
          </motion.div>

          {/* Dietary Preferences */}
          <motion.div variants={itemVariants} className="form-group">
            <label className="flex items-center text-white text-sm font-medium mb-1">
              <UtensilsCrossed className="w-4 h-4 mr-2 text-green-400" />
              Dietary Preferences
            </label>
            <Select
              id="dietaryPreference"
              isMulti
              value={availableDietaryPreferences
                .filter((pref) => dietaryPreference.includes(pref))
                .map((pref) => ({ value: pref, label: pref }))}
              onChange={(options) => setDietaryPreference(options ? options.map((option) => option.value) : [])}
              options={availableDietaryPreferences.map((pref) => ({
                value: pref,
                label: pref,
              }))}
              styles={customSelectStyles}
              isDisabled={!category}
              placeholder="Select preferences..."
              menuPortalTarget={isMounted ? document.body : null}// Add this to render menu in a portal
              menuPosition="fixed" // Set menu position to fixed
            />
          </motion.div>

          {/* Ingredients */}
          <motion.div variants={itemVariants} className="form-group">
            <label className="flex items-center text-white text-sm font-medium mb-1">
              <CookingPot className="w-4 h-4 mr-2 text-green-400" />
              Ingredients
            </label>
            <Select
              id="ingredients"
              isMulti
              value={availableIngredients
                .filter((ingredient) => ingredients.includes(ingredient))
                .map((ingredient) => ({ value: ingredient, label: ingredient }))}
              onChange={(options) => setIngredients(options ? options.map((option) => option.value) : [])}
              options={availableIngredients.map((ingredient) => ({
                value: ingredient,
                label: ingredient,
              }))}
              styles={customSelectStyles}
              isDisabled={!category}
              placeholder="Select ingredients..."
              menuPortalTarget={isMounted ? document.body : null} // Add this to render menu in a portal
              menuPosition="fixed" // Set menu position to fixed
            />
          </motion.div>

          {/* Calories */}
          <motion.div variants={itemVariants} className="form-group">
            <label className="flex items-center text-white text-sm font-medium mb-1">
              <Flame className="w-4 h-4 mr-2 text-green-400" />
              Calories ({calories})
            </label>
            <input
              type="range"
              min={calorieRange.min}
              max={calorieRange.max}
              value={calories}
              onChange={(e) => setCalories(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-green-400"
              style={{
                background: `linear-gradient(to right, #22c55e ${(calories - calorieRange.min) / (calorieRange.max - calorieRange.min) * 100}%, #374151 ${(calories - calorieRange.min) / (calorieRange.max - calorieRange.min) * 100}%)`
              }}
            />
          </motion.div>

          {/* Time input */}
          <motion.div variants={itemVariants} className="form-group">
            <label className="flex items-center text-white text-sm font-medium mb-1">
              <Clock className="w-4 h-4 mr-2 text-green-400" />
              Time (minutes)
            </label>
            <input
              type="number"
              value={time === 0 ? "" : time}
              onChange={(e) => setTime(Number(e.target.value) || 0)}
              className="w-full px-3 py-1.5 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200"
              placeholder="Enter preparation time..."
              min={timeRange.min}
              max={timeRange.max}
            />
          </motion.div>

          {/* Submit Button */}
          <motion.div 
            variants={itemVariants}
            className="pt-1"
          >
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-102 hover:shadow-lg flex items-center justify-center space-x-2"
              disabled={isLoading}
            >
              <Utensils className="w-4 h-4" />
              <span>{isLoading ? "Finding Recipes..." : "Get Recommendations"}</span>
            </button>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
    </div>
  );
};

export default RecipeRecommendationForm;