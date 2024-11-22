'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { account, createUserDocument } from '@/lib/appwrite';
import { DEFAULT_AVATAR } from '@/lib/constants';
import SecondaryLoader from '@/components/ui/SecondaryLoader';

export default function CallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const handleOAuthCallback = async () => {
            try {
                // Get current session and user
                const session = await account.getSession('current');
                const user = await account.get();
    
                // Try to create user document
                try {
                    await createUserDocument(
                        user.$id,
                        user.name || 'Google User',
                        user.email,
                        DEFAULT_AVATAR
                    );
                } catch (error: any) {
                    if (!error?.message?.includes('Document already exists')) {
                        console.error('Error creating user document:', error);
                        throw error;
                    }
                }
    
                // Get the return URL from sessionStorage
                const returnUrl = sessionStorage.getItem('returnUrl');
                // Clean up
                sessionStorage.removeItem('returnUrl');
                // Redirect to the return URL or home
                router.push(returnUrl || '/');
            } catch (error) {
                console.error('OAuth callback error:', error);
                router.push('/auth');
            }
        };
    
        handleOAuthCallback();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
    <SecondaryLoader />
  </div>
    );
}