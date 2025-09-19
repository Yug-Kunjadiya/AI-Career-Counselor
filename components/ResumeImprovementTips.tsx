import React, { useState } from 'react';
import { ResumeImprovementTip } from '../types';
import { getResumeImprovementTips } from '../services/geminiService';

interface ResumeImprovementTipsProps {
  resumeText: string;
}

const ResumeImprovementTips: React.FC<ResumeImprovementTipsProps> = ({ resumeText }) => {
  const [tips, setTips] = useState<ResumeImprovementTip[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleGetTips = async () => {
    if (!resumeText.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await getResumeImprovementTips(resumeText);
      if (result) {
        setTips(result);
      } else {
        setError('Failed to generate improvement tips. Please try again.');
      }
    } catch (err) {
      setError('Error generating improvement tips. Please check your connection and try again.');
      console.error('Resume improvement tips error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold theme-text-primary mb-2">Resume Improvement Tips</h1>
        <p className="theme-text-secondary">Get personalized suggestions to enhance your resume</p>
      </div>

      {!resumeText && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Please upload your resume first to get improvement tips.</p>
        </div>
      )}

      {resumeText && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <button
              onClick={handleGetTips}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? 'Analyzing...' : 'Get Improvement Tips'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {tips.length > 0 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Your Resume Improvement Plan</h2>
                <p className="text-gray-600">Here are {tips.length} specific suggestions to improve your resume</p>
              </div>

              {tips.map((tip, index) => (
                <div key={index} className={`border rounded-lg p-4 ${getSeverityColor(tip.severity)}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <span className="text-lg">{getSeverityIcon(tip.severity)}</span>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold capitalize">{tip.section} Section</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getSeverityColor(tip.severity)}`}>
                          {tip.severity} Priority
                        </span>
                      </div>

                      <div className="mb-3">
                        <h4 className="font-medium text-gray-800 mb-1">Issue:</h4>
                        <p className="text-gray-700">{tip.issue}</p>
                      </div>

                      <div className="mb-3">
                        <h4 className="font-medium text-gray-800 mb-1">Suggestion:</h4>
                        <p className="text-gray-700">{tip.suggestion}</p>
                      </div>

                      {tip.rewrittenExample && (
                        <div className="bg-white/50 rounded p-3 border">
                          <h4 className="font-medium text-gray-800 mb-1">Example Rewrite:</h4>
                          <p className="text-gray-700 italic">"{tip.rewrittenExample}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">💡 Pro Tips</h3>
                <ul className="text-blue-800 space-y-1">
                  <li>• Start with the highest priority items first</li>
                  <li>• Use quantifiable achievements (numbers, percentages, metrics)</li>
                  <li>• Keep your resume to 1-2 pages for most positions</li>
                  <li>• Use action verbs at the beginning of bullet points</li>
                  <li>• Tailor your resume for each job application</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeImprovementTips;
