/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
import React from 'react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero Section with fade-in animation */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl mt-16 font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent animate-gradient">
            About RecipeRover
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto opacity-0 animate-slide-up">
            Your intelligent culinary companion that transforms the way you discover and create amazing dishes
          </p>
        </div>

        {/* Main Content Grid with stagger effect */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6 order-2 md:order-1 opacity-0 animate-slide-in-left">
            <h2 className="text-2xl md:text-3xl font-semibold text-purple-400">
              Revolutionizing Recipe Discovery
            </h2>
            <p className="text-gray-300 leading-relaxed">
              RecipeRover harnesses the power of advanced AI to understand your unique preferences, dietary requirements, and available ingredients. Whether you're searching by text, uploading an image of ingredients, or filling out a detailed form, we connect you with perfectly matched recipes from our vast collection.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Our intelligent recommendation system learns from your interactions, making each suggestion more personalized than the last. From quick weekday dinners to elaborate weekend feasts, RecipeRover is your trusted companion in the kitchen.
            </p>
          </div>
          <div className="order-1 md:order-2 opacity-0 animate-slide-in-right">
            <img 
              src="/about1.png"
              alt="Website Interface Illustration"
              className="w-full h-auto rounded-lg shadow-xl transform hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Second Content Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="opacity-0 animate-slide-in-left">
            <img 
              src="/about2.png"
              alt="Cooking Illustration"
              className="w-full h-auto rounded-lg shadow-xl transform hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="space-y-6 opacity-0 animate-slide-in-right">
            <h2 className="text-2xl md:text-3xl font-semibold text-purple-400">
              Our Vision
            </h2>
            <p className="text-gray-300 leading-relaxed">
              We believe that cooking should be an accessible, enjoyable, and creative experience for everyone. Our platform is designed to inspire confidence in the kitchen, encourage culinary exploration, and make meal planning effortless.
            </p>
            <p className="text-gray-300 leading-relaxed">
              By combining cutting-edge technology with our passion for food, we're building a community where food lovers can discover, share, and create memorable dining experiences.
            </p>
          </div>
        </div>

        {/* Team Section with hover effects */}
        <div className="mt-20 text-center opacity-0 animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-semibold text-purple-400 mb-8">
            Meet Our Developers
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <a 
              href="https://www.linkedin.com/in/garvit-nag-b3871531b/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group"
            >
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:bg-gray-700">
                <div className="mb-4 overflow-hidden rounded-full w-32 h-32 mx-auto">
                  <img 
                    src="/dev1.jpeg" 
                    alt="Garvit Nag"
                    className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">Garvit Nag</h3>
                <p className="text-gray-400">Lead Developer</p>
              </div>
            </a>
            <a 
              href="https://www.linkedin.com/in/gurmehar-singh-b5864a23a/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group"
            >
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:bg-gray-700">
                <div className="mb-4 overflow-hidden rounded-full w-32 h-32 mx-auto">
                  <img 
                    src="/dev2.jpg" 
                    alt="Gurmehar Singh Virdi"
                    className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">Gurmehar Singh Virdi</h3>
                <p className="text-gray-400">Lead Developer</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes slideInLeft {
          from { transform: translateX(-50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @keyframes slideInRight {
          from { transform: translateX(50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 6s ease infinite;
        }

        .animate-slide-up {
          animation: slideUp 1s ease forwards;
          animation-delay: 0.5s;
        }

        .animate-slide-in-left {
          animation: slideInLeft 1s ease forwards;
          animation-delay: 0.3s;
        }

        .animate-slide-in-right {
          animation: slideInRight 1s ease forwards;
          animation-delay: 0.3s;
        }

        .animate-fade-in {
          animation: fadeIn 1s ease forwards;
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
};

export default AboutUs;