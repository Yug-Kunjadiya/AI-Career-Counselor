import React, { useState, useRef } from 'react';
import { LinkedInProfileAnalysis } from '../types';
import { analyzeLinkedInProfile } from '../services/geminiService';

const ProfileBooster: React.FC = () => {
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profileText, setProfileText] = useState<string>('');
  const [analysis, setAnalysis] = useState<LinkedInProfileAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file of your LinkedIn profile.');
      return;
    }

    setProfileFile(file);
    setError('');

    // Extract text from PDF (simplified - in real implementation, use pdf-parse or similar)
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setProfileText(text);
    };
    reader.readAsText(file);
  };

  const handleAnalyzeProfile = async () => {
    if (!profileText.trim()) {
      setError('Please upload your LinkedIn profile PDF first.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await analyzeLinkedInProfile(profileText);
      if (result) {
        setAnalysis(result);
      } else {
        setError('Failed to analyze LinkedIn profile. Please try again.');
      }
    } catch (err) {
      setError('Error analyzing LinkedIn profile. Please check your connection and try again.');
      console.error('LinkedIn analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 border-red-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      case 'low': return 'text-green-600 bg-green-100 border-green-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Profile Booster</h1>
        <p className="text-white">AI-powered LinkedIn profile optimization with actionable insights</p>
      </div>

      {/* About Section */}
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">How to Generate Your LinkedIn Profile PDF</h2>
        <div className="space-y-4 text-gray-700">
          <p className="text-lg font-semibold text-blue-600">Follow these simple steps to export your LinkedIn profile:</p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">Method 1: LinkedIn Export</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to your LinkedIn profile page</li>
                <li>Click on "More" button (three dots)</li>
                <li>Select "Save to PDF"</li>
                <li>Choose your preferred language</li>
                <li>Click "Generate PDF"</li>
                <li>Download the generated PDF file</li>
              </ol>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">Method 2: Browser Print</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Open your LinkedIn profile in browser</li>
                <li>Go to Resources menu </li>
                <li>select "Save as PDF"</li>
    
                <li>Download the generated PDF file</li>
              </ol>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
            <p className="text-blue-800">
              <strong>💡 Pro Tip:</strong> Make sure your LinkedIn profile is complete before generating the PDF. Include a professional photo, detailed summary, work experience, skills, and recommendations for the best analysis results.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload Your LinkedIn Profile</h2>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf"
            className="hidden"
          />
          
          {!profileFile ? (
            <div className="space-y-4">
              <div className="text-6xl text-gray-400">📄</div>
              <div>
                <p className="text-lg font-medium text-gray-700">Upload your LinkedIn profile PDF</p>
                <p className="text-sm text-gray-500">Click to browse or drag and drop your file here</p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Choose PDF File
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-6xl text-green-500">✅</div>
              <div>
                <p className="text-lg font-medium text-gray-700">File uploaded successfully!</p>
                <p className="text-sm text-gray-500">{profileFile.name}</p>
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleAnalyzeProfile}
                  disabled={isLoading}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoading ? 'Analyzing Profile...' : 'Analyze Profile'}
                </button>
                <button
                  onClick={() => {
                    setProfileFile(null);
                    setProfileText('');
                    setAnalysis(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Upload Different File
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Analysis Results</h2>
              <div className="flex justify-center items-center gap-6 mb-6">
                <div className={`px-8 py-4 rounded-full text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                  {analysis.overallScore}/100
                </div>
                <div className={`px-6 py-3 rounded-full text-xl font-semibold ${getScoreColor(analysis.overallScore)}`}>
                  Grade {analysis.grade}
                </div>
              </div>
            </div>
          </div>

          {/* Section Scores */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Section Breakdown</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(analysis.sections).map(([sectionName, sectionData]) => (
                <div key={sectionName} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-700 capitalize">{sectionName}</h4>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${getScoreColor(sectionData.score)}`}>
                      {sectionData.score}/100
                    </span>
                  </div>
                  {sectionData.suggestions && sectionData.suggestions.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">Top suggestion:</p>
                      <p>{sectionData.suggestions[0]}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Keyword Optimization */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Keyword Optimization</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Keyword Density</span>
                  <span>{analysis.keywordOptimization.keywordDensity}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(analysis.keywordOptimization.keywordDensity, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              {analysis.keywordOptimization.missingKeywords.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Missing Industry Keywords:</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywordOptimization.missingKeywords.map((keyword, index) => (
                      <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step-by-Step Improvements */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Step-by-Step Improvement Plan</h3>
            <div className="space-y-4">
              {analysis.improvementSteps.map((step, index) => (
                <div key={index} className={`border-l-4 p-4 rounded-r-lg ${getPriorityColor(step.priority)}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">#{index + 1}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${getPriorityColor(step.priority)}`}>
                        {step.priority} Priority
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{step.timeToComplete}</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">{step.section}</h4>
                  <p className="text-gray-700 mb-2">{step.action}</p>
                  <p className="text-sm text-gray-600">
                    <strong>Expected Impact:</strong> {step.impact}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileBooster;
