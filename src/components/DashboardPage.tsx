/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useEffect, useState } from 'react';
import { account, databases } from '@/lib/appwrite';
import { useRouter } from 'next/navigation';
import { Query, Models } from 'appwrite';
import { formatDistanceToNow } from 'date-fns';
import { PencilIcon, SearchIcon, DownloadIcon } from 'lucide-react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface SearchHistory {
  _id: string;
  userId: string;
  searchDate: string;
  searchData: any;
}

interface UserData extends Models.Document {
  name: string;
  email: string;
  avatar: string;
  createdAt: string;
  lastLogin: string;
  userId: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={`p-6 rounded-lg shadow-lg ${className || ''}`}>{children}</div>
);

const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mt-4">{children}</div>
);

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mb-4">{children}</div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <h2 className={`text-2xl font-semibold ${className || ''}`}>{children}</h2>
);

const DashboardPage: React.FC = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const avatarOptions = [
    'https://cloud.appwrite.io/v1/storage/buckets/67276e2d002916c92b37/files/67276e7d0035c9e0947a/view?project=67269999000b28be9b29',
    'https://cloud.appwrite.io/v1/storage/buckets/67276e2d002916c92b37/files/67276e860028420623a1/view?project=67269999000b28be9b29',
    'https://cloud.appwrite.io/v1/storage/buckets/67276e2d002916c92b37/files/67276e8b002c46925d68/view?project=67269999000b28be9b29',
    'https://cloud.appwrite.io/v1/storage/buckets/67276e2d002916c92b37/files/67276e91001dc42e4b9a/view?project=67269999000b28be9b29',
    'https://cloud.appwrite.io/v1/storage/buckets/67276e2d002916c92b37/files/67276e960029bc41a4bb/view?project=67269999000b28be9b29',
    'https://cloud.appwrite.io/v1/storage/buckets/67276e2d002916c92b37/files/67276e9c0021b7c2e22f/view?project=67269999000b28be9b29',
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const session = await account.getSession('current');
        if (!session) {
          router.push('/auth');
          return;
        }

        const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
        const collectionId = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID;

        if (!databaseId || !collectionId) {
          throw new Error('Database or collection ID not configured');
        }

        const userDocs = await databases.listDocuments(
          databaseId,
          collectionId,
          [Query.equal('userId', session.userId)]
        );

        if (userDocs.documents.length > 0) {
          const user = userDocs.documents[0] as UserData;
          setUserData(user);
          setNewName(user.name);
        }

        const response = await fetch(`/api/search-history?userId=${session.userId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch search history: ${response.status}`);
        }

        const history = await response.json() as SearchHistory[];
        setSearchHistory(history);

      } catch (error) {
        console.error('[Dashboard] Error in fetchUserData:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const filteredHistory = searchHistory.filter(history => {
    const searchDate = new Date(history.searchDate).toLocaleString().toLowerCase();
    return searchDate.includes(searchQuery.toLowerCase());
  });

  const handleUpdate = async () => {
    try {
      if (!userData) return;

      const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
      const collectionId = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID;

      if (!databaseId || !collectionId) {
        throw new Error('Database or collection ID not configured');
      }

      const updatedData = {
        name: newName,
        avatar: selectedAvatar || userData.avatar,
        lastLogin: new Date().toLocaleString('en-US', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }).replace(',', '')
      };

      await databases.updateDocument(
        databaseId,
        collectionId,
        userData.$id,
        updatedData
      );

      setUserData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          ...updatedData
        };
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleSearchHistoryClick = async (historyData: SearchHistory) => {
    sessionStorage.setItem('recommendations', JSON.stringify(historyData.searchData));
    router.push('/recommendations');
  };

  const parseCustomDate = (dateString: string): Date => {
    if (!dateString) return new Date();
    
    const parts = dateString.split(' ');
    if (parts.length !== 4) return new Date(dateString);

    const [datePart, timePart, , period] = parts;
    const [day, month, year] = datePart.split('-');
    const [hours, minutes, seconds] = timePart.split('.');

    let hour = parseInt(hours);
    if (period === 'PM' && hour < 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      hour,
      parseInt(minutes),
      parseInt(seconds.split(' ')[0])
    );
  };

  const downloadJson = (data: SearchHistory) => {
    try {
      console.log('[Dashboard] Attempting to download JSON for document:', data._id);
      const blob = new Blob([JSON.stringify(data.searchData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `search-data-${data._id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('[Dashboard] JSON download completed');
    } catch (error) {
      console.error('[Dashboard] Error downloading JSON:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 bg-black bg-dashboard bg-cover bg-center">
        <div className="max-w-[95%] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-150px)]">
            <Card className="col-span-1 bg-[#1a1919] text-white border-none h-full animate-pulse">
              <CardHeader>
                <CardTitle>
                  <div className="bg-gray-700 w-1/2 h-8 rounded"></div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-6">
                  <div className="bg-gray-700 w-32 h-32 rounded-full mb-4"></div>
                  <div className="bg-gray-700 w-full h-8 rounded"></div>
                  <div className="bg-gray-700 w-full h-8 rounded"></div>
                  <div className="bg-gray-700 w-full h-8 rounded"></div>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-1 lg:col-span-2 bg-[#1a1919] text-white border-none h-full animate-pulse">
              <CardHeader>
                <CardTitle>
                  <div className="bg-gray-700 w-1/2 h-8 rounded"></div>
                </CardTitle>
                <div className="mt-4 relative">
                  <div className="bg-gray-700 w-full h-12 rounded-lg"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[calc(100vh-380px)] overflow-y-auto pr-2">
                  <div className="bg-black p-4 rounded-lg">
                    <div className="flex flex-col space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <div className="bg-gray-700 w-40 h-6 rounded"></div>
                          <div className="bg-gray-700 w-24 h-4 rounded mt-2"></div>
                        </div>
                        <div className="flex space-x-2">
                          <div className="bg-gray-700 w-20 h-8 rounded"></div>
                          <div className="bg-gray-700 w-20 h-8 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 bg-black bg-dashboard bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: "url('/dashboard.jpg')",
      }}
    >
      <div className="max-w-[95%] mx-auto pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="col-span-1 bg-[#1a1919]/90 text-white border-none h-full">
            <CardHeader>
              <CardTitle className="text-center text-cyan-400 text-2xl">Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-6">
                {isEditing ? (
                  <div className="space-y-4 w-full">
                    <div className="flex flex-col items-center">
                      <img
                        src={userData?.avatar}
                        alt="Profile"
                        className="w-32 h-32 rounded-full border-4 border-cyan-400 mb-4"
                      />
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full p-2 rounded bg-gray-700 text-white text-center"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {avatarOptions.map((avatar, index) => (
                        <img
                          key={index}
                          src={avatar}
                          alt={`Avatar option ${index + 1}`}
                          className={`w-16 h-16 rounded-full cursor-pointer border-2 ${
                            selectedAvatar === avatar ? 'border-cyan-400' : 'border-transparent'
                          }`}
                          onClick={() => setSelectedAvatar(avatar)}
                        />
                      ))}
                    </div>
                    <div className="flex space-x-2 justify-center">
                      <button
                        onClick={handleUpdate}
                        className="bg-cyan-400 hover:bg-cyan-200 px-4 py-2 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full space-y-6">
                    <div className="flex flex-col items-center">
                      <img
                        src={userData?.avatar}
                        alt="Profile"
                        className="w-32 h-32 rounded-full border-4 border-cyan-400 mb-4"
                      />
                      <h3 className="text-2xl font-bold text-white text-center break-words max-w-full">
                        {userData?.name}
                      </h3>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="mt-2 text-cyan-400 hover:text-cyan-200 flex items-center gap-2"
                      >
                        <PencilIcon size={16} />
                        Edit Profile
                      </button>
                    </div>
                    
                    <div className="space-y-4 bg-black/50 rounded-lg p-6">
                      <div className="space-y-3 text-center">
                        <div className="text-cyan-400 bg-black/70 px-4 py-2 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-2">
                          <span className="font-bold text-lg">EMAIL</span>
                          <span className="text-white text-sm sm:text-base break-all">
                            {userData?.email}
                          </span>
                        </div>
                        <div className="text-cyan-400 bg-black/70 px-4 py-2 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-2">
                          <span className="font-bold text-lg">JOINED</span>
                          <span className="text-white text-sm sm:text-base">
                            {formatDistanceToNow(parseCustomDate(userData?.createdAt || ''), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="text-cyan-400 bg-black/70 px-4 py-2 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-2">
                          <span className="font-bold text-lg">LAST LOGIN</span>
                          <span className="text-white text-sm sm:text-base">
                            {formatDistanceToNow(parseCustomDate(userData?.lastLogin || ''), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
  
          <Card className="col-span-1 lg:col-span-2 bg-[#1a1919]/90 text-white border-none h-full">
            <CardHeader>
              <CardTitle className="text-center text-cyan-400 text-2xl">Search History</CardTitle>
              <div className="mt-4 relative">
                <input
                  type="text"
                  placeholder="Search by date..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-3 rounded-lg bg-black/70 text-white border border-gray-700 pl-10"
                />
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((history) => (
                    <div
                      key={history._id}
                      className="bg-black/70 p-4 rounded-lg hover:bg-gray-950/90 transition-colors"
                    >
                      <div className="flex flex-col space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex flex-col">
                            <span className="text-white font-medium text-sm sm:text-base">
                              {new Date(history.searchDate).toLocaleString()}
                            </span>
                            <span className="text-gray-400 text-xs sm:text-sm break-all">
                              ID: {history.userId}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                            <button
                              onClick={() => handleSearchHistoryClick(history)}
                              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-400 rounded text-sm font-medium transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
                            >
                              <SearchIcon size={16} />
                              View
                            </button>
                            <button
                              onClick={() => downloadJson(history)}
                              className="px-4 py-2 bg-green-500 hover:bg-green-400 rounded text-sm font-medium transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
                            >
                              <DownloadIcon size={16} />
                              JSON
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px]">
                    <img 
                      src="/search.png" 
                      alt="No search history" 
                      className="w-32 h-32 opacity-70"
                    />
                    <p className="text-xl font-semibold text-gray-400 mt-4">
                      No search history available
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;