import React, { useState } from 'react';
import { ATSScoreResult } from '../types';
import { analyzeATSScore } from '../services/geminiService';

interface ATSScoreProps {
  resumeText: string;
}

const ATSScore: React.FC<ATSScoreProps> = ({ resumeText }) => {
  const [atsScore, setAtsScore] = useState<ATSScoreResult | null>(null);
  const [targetJob, setTargetJob] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleAnalyzeATS = async () => {
    if (!resumeText.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await analyzeATSScore(resumeText, targetJob || undefined);
      if (result) {
        setAtsScore(result);
      } else {
        setError('Failed to analyze ATS score. Please try again.');
      }
    } catch (err) {
      setError('Error analyzing ATS score. Please check your connection and try again.');
      console.error('ATS analysis error:', err);
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

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'F': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">ATS Score Analysis</h1>
        <p className="text-gray-600">Check how well your resume performs with Applicant Tracking Systems</p>
      </div>

      {!resumeText && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Please upload your resume first to analyze ATS compatibility.</p>
        </div>
      )}

      {resumeText && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-grow">
              <label htmlFor="targetJob" className="block text-sm font-medium text-gray-700 mb-2">
                Target Job (Optional)
              </label>
              <input
                type="text"
                id="targetJob"
                value={targetJob}
                onChange={(e) => setTargetJob(e.target.value)}
                placeholder="e.g., Software Engineer, Data Analyst"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAnalyzeATS}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? 'Analyzing...' : 'Analyze ATS Score'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {atsScore && (
            <div className="space-y-6">
              {/* Score Overview */}
              <div className="text-center">
                <div className="inline-flex items-center gap-4 mb-4">
                  <div className={`px-6 py-3 rounded-full text-2xl font-bold ${getScoreColor(atsScore.score)}`}>
                    {atsScore.score}/100
                  </div>
                  <div className={`px-4 py-2 rounded-full text-lg font-semibold ${getGradeColor(atsScore.grade)}`}>
                    Grade {atsScore.grade}
                  </div>
                </div>
                <p className="text-gray-600">
                  Keywords Found: {atsScore.keywordMatches} / {atsScore.totalKeywords}
                </p>
              </div>

              {/* Strengths */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-3">Strengths</h3>
                <ul className="space-y-2">
                  {atsScore.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="text-green-800">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-800 mb-3">Areas for Improvement</h3>
                <ul className="space-y-2">
                  {atsScore.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-600 mr-2">⚠</span>
                      <span className="text-red-800">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvement Suggestions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Improvement Suggestions</h3>
                <ul className="space-y-3">
                  {atsScore.improvementSuggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 font-bold">{index + 1}.</span>
                      <span className="text-blue-800">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Keyword Progress */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Keyword Optimization</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Keywords Found</span>
                    <span>{atsScore.keywordMatches} / {atsScore.totalKeywords}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(atsScore.keywordMatches / atsScore.totalKeywords) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600">
                    {Math.round((atsScore.keywordMatches / atsScore.totalKeywords) * 100)}% keyword match rate
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ATSScore;
