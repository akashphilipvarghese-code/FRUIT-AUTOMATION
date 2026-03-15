/**
 * ClearScan AI - Fruit Quality Grading System
 *
 * DEMO MODE:
 * To view this app with desktop/mobile preview toggle,
 * import and use the Demo component from './demo.tsx'
 *
 * FONTS:
 * - Body: Inter (clean, modern)
 * - Headings: Poppins (bold, distinctive)
 *
 * LOGIN CREDENTIALS:
 * Email: demo@clearscan.ai
 * Password: demo123 (or any password)
 */

import { useState } from "react";
import { LoginPage } from "./components/login-page";
import { UploadZone } from "./components/upload-zone";
import { ScanningAnimation } from "./components/scanning-animation";
import { GradeResult, type GradeData } from "./components/grade-result";
import { GradingHistory } from "./components/grading-history";
import { ClearScanLogo } from "./components/clearscan-logo";
import { User, Settings, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "./components/ui/button";
import type { FruitType } from "./types/fruit-types";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentGrade, setCurrentGrade] = useState<GradeData | null>(null);
  const [history, setHistory] = useState<GradeData[]>([]);
  const [isGrading, setIsGrading] = useState(false);
  const [selectedFruitType, setSelectedFruitType] = useState<FruitType>("auto");
  const [showHistory, setShowHistory] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [lastImageFile, setLastImageFile] = useState<File | undefined>(undefined);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentGrade(null);
    setHistory([]);
    setShowHistory(false);
  };

  const gradeImage = async (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setUploadedImageUrl(imageUrl);
    setLastImageFile(file);
    setIsGrading(true);

    await new Promise((resolve) => setTimeout(resolve, 2500));

    let detectedFruitType = selectedFruitType;
    if (selectedFruitType === "auto") {
      const fruitTypes: FruitType[] = ["apple", "mango", "orange", "banana", "strawberry", "grape"];
      detectedFruitType = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
    }

    const size = Math.floor(Math.random() * 20) + 80;
    const color = Math.floor(Math.random() * 25) + 75;
    const ripeness = Math.floor(Math.random() * 30) + 70;
    const defects = Math.floor(Math.random() * 25) + 75;
    const overallScore = Math.round((size + color + ripeness + defects) / 4);

    let grade: "A" | "B" | "C" | "D";
    if (overallScore >= 90) grade = "A";
    else if (overallScore >= 80) grade = "B";
    else if (overallScore >= 70) grade = "C";
    else grade = "D";

    const gradeData: GradeData = {
      grade,
      overallScore,
      size,
      color,
      ripeness,
      defects,
      imageUrl,
      timestamp: new Date(),
      fruitType: detectedFruitType,
      surfaceDefectPercentage: Math.floor(Math.random() * 15) + 2,
      area: Math.floor(Math.random() * 50) + 25,
      perimeter: Math.floor(Math.random() * 30) + 15,
      location: undefined, // Set below if geolocation available
    };
    // Capture device GPS for proximity queries (GeoPoint in Firestore)
    if (navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 })
        );
        gradeData.location = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
      } catch {
        /* ignore */
      }
    }

    setCurrentGrade(gradeData);
    setHistory((prev) => [gradeData, ...prev]);
    setIsGrading(false);
  };

  const handleFileSelect = (file: File) => {
    gradeImage(file);
  };

  const handleReset = () => {
    setCurrentGrade(null);
    setUploadedImageUrl("");
    setLastImageFile(undefined);
  };

  const handleHistorySelect = (item: GradeData) => {
    setCurrentGrade(item);
    setLastImageFile(undefined);
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div 
      className="min-h-screen bg-black relative"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(26, 26, 26, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(26, 26, 26, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
      }}
    >
      {/* Header - Only show on landing page */}
      {!currentGrade && !isGrading && !showHistory && (
        <header className="border-b border-gray-800/50 bg-black/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex flex-col items-center">
              <ClearScanLogo size="medium" showTagline={true} className="scale-75 sm:scale-100" />
            </div>
          </div>
        </header>
      )}

      {/* Compact header for other states */}
      {(currentGrade || isGrading || showHistory) && (
        <header className="border-b border-gray-800 bg-black sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <ClearScanLogo size="small" showTagline={false} className="scale-75 sm:scale-100" />
              
              <div className="flex items-center gap-2 sm:gap-4">
                {history.length > 0 && (
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="px-3 sm:px-4 py-2 rounded-lg border border-gray-800 text-gray-400 hover:text-[#FF8C00] hover:border-[#FF8C00] transition-all text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">History ({history.length})</span>
                    <span className="sm:hidden">{history.length}</span>
                  </button>
                )}
                <button className="p-2 hover:bg-gray-900 rounded-lg transition-colors" title="User Profile">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF8C00]" />
                </button>
                <button className="p-2 hover:bg-gray-900 rounded-lg transition-colors" title="Settings">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF8C00]" />
                </button>
                <button 
                  onClick={handleLogout}
                  className="p-2 hover:bg-gray-900 rounded-lg transition-colors" 
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {showHistory ? (
          <div className="space-y-6">
            <Button
              onClick={() => setShowHistory(false)}
              variant="outline"
              className="border-gray-800 text-gray-400 hover:text-white hover:border-[#FF8C00] bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Upload
            </Button>
            <GradingHistory history={history} onSelectItem={handleHistorySelect} isAdmin={true} />
          </div>
        ) : isGrading ? (
          <ScanningAnimation imageUrl={uploadedImageUrl} />
        ) : currentGrade ? (
          <GradeResult
            data={currentGrade}
            imageFile={lastImageFile}
            onAnalyzeNewSample={handleReset}
            onFindBuyers={() => setShowHistory(true)}
            onExport={() => window.print?.() ?? alert("Export: save or print this report.")}
          />
        ) : (
          <UploadZone 
            onFileSelect={handleFileSelect}
            selectedFruitType={selectedFruitType}
            onFruitTypeChange={setSelectedFruitType}
            onCameraScan={() => alert("Camera scan feature would be implemented here")}
          />
        )}
      </main>

      <footer className="border-t border-gray-800 mt-10 sm:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 text-xs sm:text-sm">
            <div className="text-gray-500 text-center sm:text-left">
              © 2026 ClearScan AI
            </div>
            <div className="flex items-center gap-3 sm:gap-6">
              <span className="text-gray-500 text-xs">v2.0.1</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-gray-500 text-xs">Online</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
