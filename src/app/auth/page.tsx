/* eslint-disable react/no-children-prop */
'use client';

import { useState, useEffect } from 'react';
import { account, createUserDocument, databases } from '@/lib/appwrite';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ID, OAuthProvider } from 'appwrite';
import { BackgroundLines } from '@/components/ui/background-lines';
import SecondaryLoader from '@/components/ui/SecondaryLoader';

const AuthPage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const checkSession = async () => {
            try {
                const session = await account.getSession('current');
                if (session) {
                    router.push('/');
                } else {
                    setIsLoading(false);
                }
            } catch (error) {
                setIsLoading(false);
            }
        };
        checkSession();
    }, [router]);

    const handleGoogleLogin = async () => {
        try {
            await account.createOAuth2Session(
                'google' as OAuthProvider,
                process.env.NEXT_PUBLIC_AUTH_CALLBACK_URL!,
                process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL!
            );
        } catch (error: any) {
            console.error('Google login error:', error);
            setError('Failed to login with Google');
        }
    };

    const handleDiscordLogin = async () => {
        try {
            await account.createOAuth2Session(
                'discord'as OAuthProvider,
                process.env.NEXT_PUBLIC_AUTH_CALLBACK_URL!,
                process.env.NEXT_PUBLIC_APP_URL!
            );
        } catch (error: any) {
            console.error('Discord login error:', error);
            setError('Failed to login with Discord');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
    <SecondaryLoader />
  </div>
        );
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-black">
            {/* Background with lines */}
            <div className="absolute inset-0 bg-black">
                <BackgroundLines children={undefined} />
            </div>
            
            {/* Glowing gradient effect */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 animate-pulse" />
            </div>
            
            {/* Main content */}
            <div className="relative z-10 w-full max-w-md mx-4">
                <div className="bg-gray-900/70 backdrop-blur-xl rounded-xl p-6 shadow-2xl border border-gray-800">
                    {/* Profile GIF container */}
                    <div className="mb-6 rounded-lg overflow-hidden bg-gray-800/50">
                        <div className="relative w-full h-48">
                            <Image
                                src="/profile-gif.gif"
                                alt="Profile Animation"
                                layout="fill"
                                objectFit="cover"
                                className="w-full"
                            />
                        </div>
                    </div>
                    
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 bg-clip-text text-transparent">
                            Welcome to RecipeRover
                        </h2>
                        <p className="mt-2 text-gray-400">Sign in to continue</p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center px-4 py-3 rounded-lg 
                                     bg-gray-800/80 hover:bg-gray-700/80 transition-all duration-200
                                     border border-gray-700/50 text-gray-200 font-medium
                                     shadow-lg hover:shadow-purple-500/20 group"
                        >
                            <Image
                                src="/google-icon.png"
                                alt="Google"
                                width={20}
                                height={20}
                                className="mr-2 group-hover:scale-110 transition-transform"
                            />
                            Continue with Google
                        </button>

                        <button
                            onClick={handleDiscordLogin}
                            className="w-full flex items-center justify-center px-4 py-3 rounded-lg 
                                     bg-gray-800/80 hover:bg-gray-700/80 transition-all duration-200
                                     border border-gray-700/50 text-gray-200 font-medium
                                     shadow-lg hover:shadow-blue-500/20 group"
                        >
                            <Image
                                src="/discord-icon.png"
                                alt="Discord"
                                width={20}
                                height={20}
                                className="mr-2 group-hover:scale-110 transition-transform"
                            />
                            Continue with Discord
                        </button>
                    </div>

                    {error && (
                        <p className="mt-4 text-red-400 text-sm text-center">
                            {error}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;