import React, { useState, useEffect } from 'react';
import { CareerRoadmap as CareerRoadmapType, RoadmapMilestone, ResumeData } from '../types';
import { generateCareerRoadmap } from '../services/geminiService';

interface CareerRoadmapProps {
  resumeData: ResumeData | null;
}

const CareerRoadmap: React.FC<CareerRoadmapProps> = ({ resumeData }) => {
  const [roadmap, setRoadmap] = useState<CareerRoadmapType | null>(null);
  const [targetCareer, setTargetCareer] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleGenerateRoadmap = async () => {
    if (!resumeData || !targetCareer.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await generateCareerRoadmap(resumeData, targetCareer);
      if (result) {
        setRoadmap(result);
      } else {
        setError('Failed to generate roadmap. Please try again.');
      }
    } catch (err) {
      setError('Error generating roadmap. Please check your connection and try again.');
      console.error('Roadmap generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMilestone = (milestoneId: string, isSixMonth: boolean) => {
    if (!roadmap) return;

    const updatedRoadmap = { ...roadmap };
    const milestones = isSixMonth ? updatedRoadmap.sixMonthRoadmap : updatedRoadmap.oneYearRoadmap;
    const milestone = milestones.find(m => m.id === milestoneId);
    if (milestone) {
      milestone.completed = !milestone.completed;
      setRoadmap(updatedRoadmap);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div className="text-center">
        <h1 className="text-2xl lg:text-3xl font-bold theme-text-primary mb-2">Career Roadmap</h1>
        <p className="text-sm lg:text-base theme-text-secondary">Get a personalized roadmap to achieve your career goals</p>
      </div>

      {!resumeData && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 lg:p-4">
          <p className="text-sm lg:text-base text-yellow-800">Please upload and analyze your resume first to generate a personalized roadmap.</p>
        </div>
      )}

      {resumeData && (
        <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex-grow">
              <label htmlFor="targetCareer" className="block text-sm font-medium text-gray-700 mb-2">
                Target Career Path
              </label>
              <input
                type="text"
                id="targetCareer"
                value={targetCareer}
                onChange={(e) => setTargetCareer(e.target.value)}
                placeholder="e.g., Software Engineer, Data Scientist, Product Manager"
                className="w-full p-3 text-sm lg:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>
            <div className="w-full">
              <button
                onClick={handleGenerateRoadmap}
                disabled={isLoading || !targetCareer.trim()}
                className="w-full lg:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm lg:text-base"
              >
                {isLoading ? 'Generating...' : 'Generate Roadmap'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {roadmap && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{roadmap.careerPath} Roadmap</h2>
                <p className="text-gray-600">Estimated time to job: {roadmap.estimatedTimeToJob}</p>
              </div>

              {/* Skill Gaps */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-orange-800 mb-3">Key Skill Gaps to Address</h3>
                <div className="flex flex-wrap gap-2">
                  {roadmap.skillGaps.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* 6-Month Roadmap */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">6-Month Roadmap</h3>
                <div className="space-y-3 lg:space-y-4">
                  {roadmap.sixMonthRoadmap.map((milestone, index) => (
                    <div key={milestone.id} className="bg-white border border-gray-200 rounded-lg p-3 lg:p-4 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-grow">
                          <div className="flex items-start gap-3 mb-2">
                            <input
                              type="checkbox"
                              checked={milestone.completed}
                              onChange={() => toggleMilestone(milestone.id, true)}
                              className="w-4 h-4 mt-1 text-blue-600 rounded focus:ring-blue-500 flex-shrink-0"
                            />
                            <div className="flex-grow">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                <h4 className="text-base lg:text-lg font-medium text-gray-800">{milestone.title}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium self-start ${getPriorityColor(milestone.priority)}`}>
                                  {milestone.priority}
                                </span>
                              </div>
                              <p className="text-sm lg:text-base text-gray-600 mb-3">{milestone.description}</p>
                              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-gray-700">Duration:</span> {milestone.duration}
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Skills:</span>{' '}
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {milestone.skills.map((skill, i) => (
                                      <span key={i} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <span className="font-medium text-gray-700">Resources:</span>
                            <ul className="list-disc list-inside text-gray-600 mt-1">
                              {milestone.resources.map((resource, i) => (
                                <li key={i} className="text-sm">{resource}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 1-Year Roadmap */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">1-Year Roadmap</h3>
                <div className="space-y-3 lg:space-y-4">
                  {roadmap.oneYearRoadmap.map((milestone) => (
                    <div key={milestone.id} className="bg-white border border-gray-200 rounded-lg p-3 lg:p-4 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-grow">
                          <div className="flex items-start gap-3 mb-2">
                            <input
                              type="checkbox"
                              checked={milestone.completed}
                              onChange={() => toggleMilestone(milestone.id, false)}
                              className="w-4 h-4 mt-1 text-blue-600 rounded focus:ring-blue-500 flex-shrink-0"
                            />
                            <div className="flex-grow">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                <h4 className="text-base lg:text-lg font-medium text-gray-800">{milestone.title}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium self-start ${getPriorityColor(milestone.priority)}`}>
                                  {milestone.priority}
                                </span>
                              </div>
                              <p className="text-sm lg:text-base text-gray-600 mb-3">{milestone.description}</p>
                              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-gray-700">Duration:</span> {milestone.duration}
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Skills:</span>{' '}
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {milestone.skills.map((skill, i) => (
                                      <span key={i} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <span className="font-medium text-gray-700">Resources:</span>
                            <ul className="list-disc list-inside text-gray-600 mt-1">
                              {milestone.resources.map((resource, i) => (
                                <li key={i} className="text-sm">{resource}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CareerRoadmap;
