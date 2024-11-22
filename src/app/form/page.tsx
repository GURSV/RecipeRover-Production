/* eslint-disable react/no-unescaped-entities */
'use client';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RecommendationsForm from "@/components/recommendationsform";
import Preloader from "@/components/ui/Preloader";
import { useState, useEffect } from 'react';

const SearchSection = dynamic(() => import('@/components/SearchSection'), { ssr: false });
const OrDivider = dynamic(() => import('@/components/OrDivider'), { ssr: false });

export default function FormPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const recommendations = sessionStorage.getItem('recommendations');
    if (recommendations) {
      setIsLoading(true);
      router.push('/recommendations');
    }
  }, [router]);

  return (
    <main className="min-h-screen antialiased">
      <Navbar />
      <div 
        className="h-auto min-h-[calc(100vh-4rem)] w-full flex flex-col items-center pt-24 relative overflow-hidden mx-auto pb-10"
        style={{
          backgroundImage: `url('/bg.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black to-transparent h-32"></div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
            Find Your Perfect Recipe
          </h1>
          <p className="text-green-400 text-base text-center mb-12">
            Tell us what you're craving today
          </p>

          <div className="space-y-8">
            <SearchSection />
            <OrDivider />
            <RecommendationsForm />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}