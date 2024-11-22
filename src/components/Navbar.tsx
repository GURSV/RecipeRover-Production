'use client';
import React, { useEffect, useState, useRef } from "react";
import { HoveredLink, Menu, MenuItem } from "./ui/navbar-menu";
import { account, databases } from '@/lib/appwrite'; 
import { Query } from 'appwrite';
import { cn } from "@/components/utils/cn";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();
  const [bgColor, setBgColor] = useState("transparent");
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: { target: any; }) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // First check if there's an active session
        const promise = account.get();
        promise.then(
          async (response) => {
            // User is logged in, fetch additional data
            const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
            const collectionId = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || '';
            
            const userDocs = await databases.listDocuments(
              databaseId,
              collectionId,
              [Query.equal('userId', response.$id)]
            );
  
            if (userDocs.documents.length > 0) {
              const user = userDocs.documents[0];
              setCurrentUser({
                name: user.name,
                email: user.email,
                avatar: user.avatar
              });
            }
          },
          (error) => {
            // User is not logged in, just set currentUser to null
            setCurrentUser(null);
          }
        );
      } catch (error) {
        // Handle any other errors
        console.error('Error checking authentication status:', error);
        setCurrentUser(null);
      }
    };
  
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await account.deleteSessions();
      setCurrentUser(null);
      router.push("/");
      setIsProfileOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
      setCurrentUser(null);
      setIsProfileOpen(false);
    }
  };

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    setVisible(currentScrollY <= lastScrollY || currentScrollY < 10);
    setBgColor(currentScrollY > 0 ? "bg-black/80" : "transparent");
    setLastScrollY(currentScrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div className={cn(
        "fixed top-0 right-0 w-full transition-all duration-300",
        "z-50",
        visible ? "translate-y-0" : "-translate-y-full",
        bgColor,
        className
      )}>
        <Menu setActive={setActive}>
          {/* Rest of the desktop menu structure remains the same */}
          <div className="relative flex justify-between items-center w-full px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/" className="flex-shrink-0 z-50">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-8 sm:h-10 lg:h-12 transition-transform duration-200 hover:scale-105" 
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8 xl:space-x-14">
              <Link href="/" className="relative group py-2">
                <span className="text-white transition-transform duration-200 group-hover:-translate-y-1">
                  Home
                </span>
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-white/50 transition-all duration-300 origin-center group-hover:w-full group-hover:left-0"></span>
              </Link>
              <Link href="/about" className="relative group py-2">
                <span className="text-white transition-transform duration-200 group-hover:-translate-y-1">
                  About
                </span>
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-white/50 transition-all duration-300 origin-center group-hover:w-full group-hover:left-0"></span>
              </Link>
              <Link href="/form" className="relative group py-2">
                <span className="text-white transition-transform duration-200 group-hover:-translate-y-1">
                  Search
                </span>
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-white/50 transition-all duration-300 origin-center group-hover:w-full group-hover:left-0"></span>
              </Link>
              <Link href="/contact" className="relative group py-2">
                <span className="text-white transition-transform duration-200 group-hover:-translate-y-1">
                  Contact Us
                </span>
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-white/50 transition-all duration-300 origin-center group-hover:w-full group-hover:left-0"></span>
              </Link>
            </div>

            {/* Desktop Profile Menu */}
            <div className="hidden lg:flex items-center" ref={profileRef}>
              {currentUser ? (
                <div className="relative profile-menu">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-3 focus:outline-none transition-transform duration-200 hover:scale-105"
                  >
                    {currentUser.avatar ? (
                      <Image
                        src={currentUser.avatar}
                        alt="Avatar"
                        width={40}
                        height={40}
                        className="rounded-full border-2 border-white"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white border-2 border-white text-lg">
                        {currentUser.name[0].toUpperCase()}
                      </div>
                    )}
                    <span className="text-white">{currentUser.name}</span>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-sm rounded-lg shadow-lg py-1 border border-white/10">
                      <Link href="/dashboard">
                        <div className="relative group px-4 py-2 hover:bg-white/10">
                          <span className="block text-white transition-transform duration-200 group-hover:-translate-y-1">
                            Dashboard
                          </span>
                        </div>
                      </Link>
                      <div className="border-t border-white/10 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="relative group w-full text-left px-4 py-2 hover:bg-white/10"
                      >
                        <span className="block text-white transition-transform duration-200 group-hover:-translate-y-1">
                          Sign out
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="group">
                  <Link href="/auth" className="relative inline-block py-2">
                    <span className="text-white transition-transform duration-200 group-hover:-translate-y-1">
                      Login
                    </span>
                    <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-white/50 transition-all duration-300 origin-center group-hover:w-full group-hover:left-0"></span>
                  </Link>
                </div>
              )}
            </div>
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors z-50"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          {/* Modified Mobile Menu */}
          <div 
            className={cn(
              "lg:hidden fixed inset-0 z-50 h-screen",
              "transition-transform duration-300 ease-in-out",
              isOpen ? "translate-x-0" : "translate-x-full"
            )}
          >
            <div className="absolute inset-0 backdrop-blur-md flex flex-col">
              {/* Header with close button - Modified positioning */}
              <div className="flex justify-end p-4 relative z-50">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors relative z-50"
                  aria-label="Close menu"
                >
                  <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modified Content container */}
              <div className="flex-1 flex flex-col items-center justify-center min-h-0 px-6 py-12">
                {/* User Profile Section */}
                {currentUser && (
                  <div className="py-4 flex items-center space-x-4 border-b border-white/30">
                    {currentUser.avatar ? (
                      <Image
                        src={currentUser.avatar}
                        alt="Avatar"
                        width={48}
                        height={48}
                        className="rounded-full border-2 border-white"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white border-2 border-white text-xl">
                        {currentUser.name[0].toUpperCase()}
                      </div>
                    )}
                    <span className="text-white font-medium">{currentUser.name}</span>
                  </div>
                )}

                {/* Navigation Links - Modified container */}
                <nav className="flex-1 flex flex-col items-center justify-center space-y-6">
                  <Link href="/" className="relative group text-center">
                    <span className="inline-block text-white transition-transform duration-200 group-hover:-translate-y-1">
                      Home
                    </span>
                    <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-white/50 transition-all duration-300 origin-center group-hover:w-full group-hover:left-0"></span>
                  </Link>
                  <Link href="/about" className="relative group text-center">
                    <span className="inline-block text-white transition-transform duration-200 group-hover:-translate-y-1">
                      About
                    </span>
                    <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-white/50 transition-all duration-300 origin-center group-hover:w-full group-hover:left-0"></span>
                  </Link>
                  <Link href="/form" className="relative group text-center">
                    <span className="inline-block text-white transition-transform duration-200 group-hover:-translate-y-1">
                      Search
                    </span>
                    <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-white/50 transition-all duration-300 origin-center group-hover:w-full group-hover:left-0"></span>
                  </Link>
                  <Link href="/contact" className="relative group text-center">
                    <span className="inline-block text-white transition-transform duration-200 group-hover:-translate-y-1">
                      Contact Us
                    </span>
                    <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-white/50 transition-all duration-300 origin-center group-hover:w-full group-hover:left-0"></span>
                  </Link>
                </nav>

                {/* Auth Section */}
                <div className="mt-0 mb-60 pt-6 border-t border-white/20 px-6">
                  {currentUser ? (
                    <div className="space-y-6 text-center">
                      <Link href="/dashboard" className="relative group pt-1 w-full block">
                        <span className="inline-block text-white transition-transform duration-200 group-hover:-translate-y-1">
                          Dashboard
                        </span>
                        <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-white/50 transition-all duration-300 origin-center group-hover:w-full group-hover:left-0"></span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="relative group py-0 w-full text-center"
                      >
                        <span className="inline-block text-white transition-transform duration-200 group-hover:-translate-y-1">
                          Sign out
                        </span>
                        <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-white/50 transition-all duration-300 origin-center group-hover:w-full group-hover:left-0"></span>
                      </button>
                    </div>
                  ) : (
                    <Link href="/auth" className="relative group py-0 w-full flex items-center justify-center">
                      <span className="inline-block text-white transition-transform duration-200 group-hover:-translate-y-1">
                        Login
                      </span>
                      <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-white/50 transition-all duration-300 origin-center group-hover:w-full group-hover:left-0"></span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Menu>
      </div>
    </>
  );
}

export default Navbar;