import React, { useState } from 'react';
import { InterviewQuestion, InterviewFeedback, ResumeData } from '../types';
import { generateInterviewQuestions, analyzeInterviewAnswer } from '../services/geminiService';

interface InterviewPreparationProps {
  resumeData: ResumeData | null;
}

const InterviewPreparation: React.FC<InterviewPreparationProps> = ({ resumeData }) => {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [targetCareer, setTargetCareer] = useState<string>('');
  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(false);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleGenerateQuestions = async () => {
    if (!resumeData || !targetCareer.trim()) return;

    setIsLoadingQuestions(true);
    setError('');

    try {
      const result = await generateInterviewQuestions(resumeData, targetCareer);
      if (result) {
        setQuestions(result);
        setSelectedQuestion(null);
        setUserAnswer('');
        setFeedback(null);
      } else {
        setError('Failed to generate interview questions. Please try again.');
      }
    } catch (err) {
      setError('Error generating interview questions. Please check your connection and try again.');
      console.error('Interview questions generation error:', err);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleAnalyzeAnswer = async () => {
    if (!selectedQuestion || !userAnswer.trim()) return;

    setIsLoadingFeedback(true);
    setError('');

    try {
      const result = await analyzeInterviewAnswer(
        selectedQuestion.question,
        userAnswer,
        selectedQuestion.category
      );
      if (result) {
        setFeedback(result);
      } else {
        setError('Failed to analyze answer. Please try again.');
      }
    } catch (err) {
      setError('Error analyzing answer. Please check your connection and try again.');
      console.error('Answer analysis error:', err);
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Technical': 'bg-blue-100 text-blue-800',
      'Behavioral': 'bg-purple-100 text-purple-800',
      'Situational': 'bg-orange-100 text-orange-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold theme-text-primary mb-2">Interview Preparation</h1>
        <p className="theme-text-secondary">Practice with personalized interview questions and get feedback</p>
      </div>

      {!resumeData && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Please upload and analyze your resume first to get personalized interview questions.</p>
        </div>
      )}

      {resumeData && (
        <div className="space-y-6">
          {/* Question Generation Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Generate Interview Questions</h2>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-grow">
                <label htmlFor="targetCareer" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Career Path
                </label>
                <input
                  type="text"
                  id="targetCareer"
                  value={targetCareer}
                  onChange={(e) => setTargetCareer(e.target.value)}
                  placeholder="e.g., Software Engineer, Product Manager"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleGenerateQuestions}
                  disabled={isLoadingQuestions || !targetCareer.trim()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoadingQuestions ? 'Generating...' : 'Generate Questions'}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Questions List */}
          {questions.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Interview Questions</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      selectedQuestion?.id === question.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setSelectedQuestion(question);
                      setUserAnswer('');
                      setFeedback(null);
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Q{index + 1}</span>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(question.category)}`}>
                          {question.category}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-800 font-medium mb-2">{question.question}</p>
                    {question.expectedAnswer && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Expected:</span> {question.expectedAnswer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Answer Analysis Section */}
          {selectedQuestion && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Practice Your Answer</h2>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedQuestion.difficulty)}`}>
                    {selectedQuestion.difficulty}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedQuestion.category)}`}>
                    {selectedQuestion.category}
                  </span>
                </div>
                <p className="text-lg font-medium text-gray-800">{selectedQuestion.question}</p>
              </div>

              <div className="mb-4">
                <label htmlFor="userAnswer" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Answer
                </label>
                <textarea
                  id="userAnswer"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={6}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                />
              </div>

              <div className="text-center">
                <button
                  onClick={handleAnalyzeAnswer}
                  disabled={isLoadingFeedback || !userAnswer.trim()}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoadingFeedback ? 'Analyzing...' : 'Get Feedback'}
                </button>
              </div>
            </div>
          )}

          {/* Feedback Display */}
          {feedback && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Feedback on Your Answer</h2>

              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{feedback.score}/10</div>
                    <div className="text-sm text-gray-600">Overall Score</div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-semibold text-green-800 mb-3">Strengths</h3>
                  <ul className="space-y-2">
                    {feedback.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span className="text-green-800">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-red-800 mb-3">Areas for Improvement</h3>
                  <ul className="space-y-2">
                    {feedback.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-600 mr-2">⚠</span>
                        <span className="text-red-800">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Suggestions</h3>
                <ul className="space-y-2">
                  {feedback.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 font-bold">{index + 1}.</span>
                      <span className="text-blue-800">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Overall Feedback</h3>
                <p className="text-gray-700">{feedback.overallFeedback}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InterviewPreparation;
