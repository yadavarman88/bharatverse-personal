import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Toaster } from "react-hot-toast";
import { Scroll } from "lucide-react"; // Make sure lucide-react is installed

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import LoadingSpinner from "./components/LoadingSpinner";

// Pages
import HomePage from "./pages/HomePage";
import StatesPage from "./pages/StatesPage";
import HeritagePage from "./pages/HeritagePage";
import HeritageDetailPage from "./pages/HeritageDetailPage";
import FestivalsPage from "./pages/FestivalsPage";
import ArtsPage from "./pages/ArtsPage";
import HiddenGemsPage from "./pages/HiddenGemsPage";
import QuizPage from "./pages/QuizPage";
import ChatPage from "./pages/ChatPage";
import MapPage from "./pages/MapPage";
import AccountPage from "./pages/AccountPage";
import UploadPage from "./pages/UploadPage";
import TourPage360 from "./pages/TourPage360"; // Adjust path as per your structure
import StoryTellingPage from "./pages/StoryTellingPage";
import TripPlannerPage from "./pages/TripPlannerPage";

// Hooks and Utils
import { useAuth } from "./hooks/useAuth";
import { useLocalStorage } from "./hooks/useLocalStorage";
import {
  heritageData,
  festivalsData,
  artsData,
  statesData,
  hiddenGemsData,
} from "./utils/data";

const dummyUser = {
  id: "550e8400-e29b-41c4-a716-446655440000", // valid UUID string
  name: "Heritage Explorer",
  email: "explorer@bharatverse.com",
};

// Create react-query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes stale time
      cacheTime: 10 * 60 * 1000, // 10 minutes cache time
    },
  },
});

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // User authentication management
  const { user, login, logout, isAuthenticated } = useAuth();

  // User bookmarks saved in localStorage
  const [bookmarks, setBookmarks] = useLocalStorage(
    "bharatverse_bookmarks",
    []
  );

  // User progress saved in localStorage
  const [userProgress, setUserProgress] = useLocalStorage(
    "bharatverse_progress",
    {
      sitesVisited: [],
      quizzesTaken: [],
      badgesEarned: [],
      totalPoints: 0,
    }
  );

  // App initialization logic with simulated loading and auto-login
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await new Promise((res) => setTimeout(res, 2000)); // Simulate loading
        login(dummyUser); // Always log in as dummy user for now
      } catch (error) {
        console.error("App initialization failed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initializeApp();
  }, [login]);

  // Handle page changes including selected item, scroll to top smoothly
  const handlePageChange = (page, item = null) => {
    setCurrentPage(page);
    setSelectedItem(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Add an item to bookmarks if not already present
  const addBookmark = (item) => {
    if (!bookmarks.find((b) => b.id === item.id && b.type === item.type)) {
      const newBookmarks = [
        ...bookmarks,
        { ...item, bookmarkedAt: new Date().toISOString() },
      ];
      setBookmarks(newBookmarks);
      return true;
    }
    return false;
  };

  // Remove an item from bookmarks
  const removeBookmark = (itemId, itemType) => {
    const filtered = bookmarks.filter(
      (b) => !(b.id === itemId && b.type === itemType)
    );
    setBookmarks(filtered);
  };

  // Check if an item is bookmarked
  const isBookmarked = (itemId, itemType) => {
    return bookmarks.some((b) => b.id === itemId && b.type === itemType);
  };

  // Update user progress state
  const updateProgress = (type, data) => {
    setUserProgress((prev) => ({
      ...prev,
      [type]: Array.isArray(prev[type])
        ? [...prev[type], data]
        : typeof prev[type] === "number"
        ? prev[type] + data
        : data,
    }));
  };

  // Renders the current page based on currentPage and selectedItem
  const renderCurrentPage = () => {
    const pageProps = {
      user,
      isAuthenticated,
      bookmarks,
      addBookmark,
      removeBookmark,
      isBookmarked,
      searchQuery,
      onSearchChange: setSearchQuery,
      onPageChange: handlePageChange,
      selectedItem,
      updateProgress,
      userProgress,
      heritageData,
      festivalsData,
      artsData,
      statesData,
      hiddenGemsData,
    };

    switch (currentPage) {
      case "home":
        return <HomePage {...pageProps} />;
      case "360tour":
        return <TourPage360 {...pageProps} onPageChange={handlePageChange} />;
      case "states":
        return <StatesPage {...pageProps} states={statesData} />;
      case "heritage":
        return selectedItem ? (
          <HeritageDetailPage {...pageProps} item={selectedItem} />
        ) : (
          <HeritagePage {...pageProps} />
        );
      case "festivals":
        return <FestivalsPage {...pageProps} />;
      case "arts":
        return <ArtsPage {...pageProps} />;
      case "gems":
        return <HiddenGemsPage {...pageProps} />;
      case "quiz":
        return <QuizPage {...pageProps} />;
      case "chat":
        return <ChatPage {...pageProps} />;
      case "map":
        return <MapPage {...pageProps} />;
      case "account":
        return <AccountPage {...pageProps} />;
      case "upload":
        return <UploadPage {...pageProps} />;
      case "story":
        return <StoryTellingPage onBack={() => handlePageChange("home")} />;
      case "planner":
        return <TripPlannerPage {...pageProps} />;
      default:
        return <HomePage {...pageProps} />;
    }
  };

  // Show loading screen while initializing app
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-white text-4xl">🕌</span>
            </div>
            <h1 className="text-4xl font-heritage font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-500">
              BharatVerse
            </h1>
            <p className="text-gray-600 mt-2">Loading India's Heritage...</p>
          </div>
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
        <Header
          currentPage={currentPage}
          onPageChange={handlePageChange}
          user={user}
          isAuthenticated={isAuthenticated}
          onLogin={login}
          onLogout={logout}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <main className="min-h-screen pt-17">{renderCurrentPage()}</main>
        <Footer onPageChange={handlePageChange} />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#fff",
              color: "#374151",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              borderRadius: "12px",
              padding: "16px",
            },
            success: {
              style: { borderLeft: "4px solid #10b981" },
            },
            error: {
              style: { borderLeft: "4px solid #ef4444" },
            },
          }}
        />

        {/* Floating Stories Button – shows on all pages except Story page */}
        {currentPage !== "story" && (
          <button
            onClick={() => handlePageChange("story")}
            className="story-trigger group relative outline-none focus:outline-none focus:ring-0"
            title="Chronicles of Bharat - Interactive Stories"
          >
            {/* Ethereal Aura - Amber/Purple Mix */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600 to-amber-600 blur-[50px] opacity-30 group-hover:opacity-60 transition-opacity duration-1000 animate-pulse-slow"></div>

            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Outer Rotating Ring - Dashed Gold */}
              <div className="absolute inset-0 border-[2px] border-dashed border-amber-500/30 rounded-full w-full h-full animate-spin-slow group-hover:border-amber-500/60 transition-colors"></div>

              {/* Counter-Rotating Inner Ring */}
              <div className="absolute inset-1 border border-indigo-400/30 rounded-full w-[calc(100%-8px)] h-[calc(100%-8px)] m-auto animate-spin-slow-reverse"></div>

              {/* Main Orb */}
              <div className="relative w-20 h-20 rounded-full bg-[#1a103c] shadow-[0_0_20px_rgba(0,0,0,0.5)] border-2 border-amber-500/40 flex flex-col items-center justify-center transform group-hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden z-20 group-hover:border-amber-400 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                {/* Rich Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-[#2a1b4e] to-[#1a103c]"></div>

                {/* Animated Pattern */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "radial-gradient(#fbbf24 1px, transparent 1px)",
                    backgroundSize: "8px 8px",
                  }}
                ></div>

                {/* Shine */}
                <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 left-full animate-shine" />

                {/* Icon */}
                <Scroll
                  size={32}
                  className="text-amber-200 relative z-20 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover:text-amber-400 transition-colors duration-300"
                  strokeWidth={1.5}
                />

                {/* Text */}
                <span className="relative z-20 font-cinzel text-[8px] text-amber-100/90 mt-1 tracking-[0.2em] uppercase font-bold group-hover:text-white transition-colors">
                  Stories
                </span>
              </div>
            </div>
          </button>
        )}

        {/* 🎨 Advanced CSS for the Button */}
        <style>{`
          .font-cinzel { 
            font-family: 'Cinzel', serif; 
          }
          
          .story-trigger {
            position: fixed;
            bottom: 40px;
            left: 40px;
            z-index: 1000;
            cursor: pointer;
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          
          .story-trigger:hover {
            transform: translateY(-5px);
          }
          
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes spin-slow-reverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }

          .animate-spin-slow {
            animation: spin-slow 8s linear infinite;
          }
          
          @keyframes shine {
            0% { left: -125%; }
            100% { left: 125%; }
          }
          
          .animate-shine {
            animation: shine 4s linear infinite;
          }
          
          .animate-spin-slow-reverse {
            animation: spin-slow-reverse 12s linear infinite;
          }
          
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.05); }
          }

          .animate-pulse-slow {
            animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
        `}</style>
      </div>
    </QueryClientProvider>
  );
}

export default App;
