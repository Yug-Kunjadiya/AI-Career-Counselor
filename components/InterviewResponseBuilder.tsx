import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LightBulbIcon, CheckCircleIcon, XCircleIcon, PlayIcon, RefreshIcon } from './icons';

interface ResponseComponent {
  id: string;
  text: string;
  type: 'opener' | 'situation' | 'action' | 'result';
  quality: 'excellent' | 'good' | 'poor';
}

interface Question {
  id: string;
  question: string;
  category: 'behavioral' | 'situational' | 'strengths';
  difficulty: 'easy' | 'medium' | 'hard';
}

const InterviewResponseBuilder: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedComponents, setSelectedComponents] = useState<ResponseComponent[]>([]);
  const [availableComponents, setAvailableComponents] = useState<ResponseComponent[]>([]);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTooltips, setShowTooltips] = useState(true);

  // Sample questions
  const questions: Question[] = [
    {
      id: '1',
      question: "Tell me about a time when you faced a challenging deadline.",
      category: 'behavioral',
      difficulty: 'medium'
    },
    {
      id: '2',
      question: "Describe a situation where you had to work with a difficult team member.",
      category: 'behavioral',
      difficulty: 'hard'
    },
    {
      id: '3',
      question: "What would you do if you disagreed with your manager's decision?",
      category: 'situational',
      difficulty: 'medium'
    },
    {
      id: '4',
      question: "Tell me about your greatest professional achievement.",
      category: 'strengths',
      difficulty: 'easy'
    },
    {
      id: '5',
      question: "How do you handle stress and pressure at work?",
      category: 'behavioral',
      difficulty: 'easy'
    }
  ];

  // Sample response components for the first question
  const responseComponents: { [key: string]: ResponseComponent[] } = {
    '1': [
      { id: 'o1', text: "In my previous role as a marketing coordinator,", type: 'opener', quality: 'good' },
      { id: 'o2', text: "Well, you know, there was this one time when", type: 'opener', quality: 'poor' },
      { id: 'o3', text: "I'd like to share a specific example from my experience at XYZ Company,", type: 'opener', quality: 'excellent' },
      { id: 's1', text: "we received a last-minute request from our biggest client to deliver a campaign in 3 days instead of 2 weeks.", type: 'situation', quality: 'excellent' },
      { id: 's2', text: "my boss gave me a really tight deadline that seemed impossible.", type: 'situation', quality: 'poor' },
      { id: 's3', text: "the team was facing a compressed timeline due to client requirements.", type: 'situation', quality: 'good' },
      { id: 'a1', text: "I immediately created a detailed project plan, prioritized tasks, and coordinated with cross-functional teams.", type: 'action', quality: 'excellent' },
      { id: 'a2', text: "I worked really hard and stayed late every night.", type: 'action', quality: 'poor' },
      { id: 'a3', text: "I organized the team and made sure everyone knew their responsibilities.", type: 'action', quality: 'good' },
      { id: 'r1', text: "We delivered the campaign on time, which resulted in a 25% increase in client satisfaction and a contract renewal.", type: 'result', quality: 'excellent' },
      { id: 'r2', text: "We finished the project and the client was happy.", type: 'result', quality: 'poor' },
      { id: 'r3', text: "The project was completed successfully and met all requirements.", type: 'result', quality: 'good' }
    ]
  };

  const startGame = () => {
    setGameStarted(true);
    setQuestionsAnswered(0);
    setTotalScore(0);
    loadNewQuestion();
  };

  const loadNewQuestion = () => {
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    setCurrentQuestion(randomQuestion);
    setSelectedComponents([]);
    setAvailableComponents(responseComponents[randomQuestion.id] || responseComponents['1']);
    setShowFeedback(false);
  };

  const addComponent = (component: ResponseComponent) => {
    if (selectedComponents.length < 4) {
      setSelectedComponents([...selectedComponents, component]);
      setAvailableComponents(availableComponents.filter(c => c.id !== component.id));
    }
  };

  const removeComponent = (componentId: string) => {
    const component = selectedComponents.find(c => c.id === componentId);
    if (component) {
      setSelectedComponents(selectedComponents.filter(c => c.id !== componentId));
      setAvailableComponents([...availableComponents, component]);
    }
  };

  const calculateScore = () => {
    let currentScore = 0;
    const typeOrder = ['opener', 'situation', 'action', 'result'];
    
    // Check structure (STAR method)
    let structureBonus = 0;
    selectedComponents.forEach((component, index) => {
      if (typeOrder.includes(component.type)) {
        structureBonus += 10;
      }
    });

    // Check quality
    selectedComponents.forEach(component => {
      switch (component.quality) {
        case 'excellent': currentScore += 25; break;
        case 'good': currentScore += 15; break;
        case 'poor': currentScore += 5; break;
      }
    });

    currentScore += structureBonus;
    return Math.min(currentScore, 100);
  };

  const submitResponse = () => {
    const currentScore = calculateScore();
    setScore(currentScore);
    setTotalScore(totalScore + currentScore);
    setQuestionsAnswered(questionsAnswered + 1);
    setShowFeedback(true);
  };

  const nextQuestion = () => {
    if (questionsAnswered < 3) {
      loadNewQuestion();
    } else {
      // Game complete
      setGameStarted(false);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setCurrentQuestion(null);
    setSelectedComponents([]);
    setAvailableComponents([]);
    setScore(0);
    setShowFeedback(false);
    setQuestionsAnswered(0);
    setTotalScore(0);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreFeedback = (score: number) => {
    if (score >= 80) return "Excellent response! You've mastered the STAR method.";
    if (score >= 60) return "Good response! Consider adding more specific details.";
    return "Needs improvement. Focus on structure and specific examples.";
  };

  if (!gameStarted) {
    return (
      <motion.div 
        className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-2xl text-neutral-dark max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full mb-6"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <LightBulbIcon className="w-8 h-8 text-white" />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-neutral-dark mb-4">
            Interview Response Builder Game
          </h2>
          
          <p className="text-lg text-neutral-dark/70 mb-6 max-w-2xl mx-auto">
            🎯 <strong>Your Mission:</strong> Build perfect interview answers by selecting the right response parts!
          </p>

          {/* How to Play Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
              <LightBulbIcon className="w-6 h-6 mr-2" />
              How to Play (It's Easy!)
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">📝 Step 1: Read the Question</h4>
                <p className="text-sm text-blue-700 mb-4">You'll see an interview question like "Tell me about a challenge you faced"</p>
                
                <h4 className="font-semibold text-blue-800 mb-2">🎯 Step 2: Build Your Answer</h4>
                <p className="text-sm text-blue-700">Click on sentence pieces from the left side to add them to your response</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">⭐ Step 3: Use STAR Method</h4>
                <p className="text-sm text-blue-700 mb-4">Pick pieces in this order: Situation → Action → Result</p>
                
                <h4 className="font-semibold text-blue-800 mb-2">🏆 Step 4: Get Scored</h4>
                <p className="text-sm text-blue-700">Submit to see your score and learn how to improve!</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>💡 Pro Tip:</strong> Look for <span className="text-green-600">●</span> green components (excellent), 
                <span className="text-yellow-600">●</span> yellow (good), and avoid <span className="text-red-600">●</span> red (poor) ones!
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <motion.div 
              className="p-6 bg-primary/10 rounded-lg border border-primary/20"
              whileHover={{ scale: 1.05 }}
            >
              <h3 className="font-semibold text-primary mb-2">Build Responses</h3>
              <p className="text-sm text-neutral-dark/70">Drag and drop components to craft perfect interview answers</p>
            </motion.div>
            
            <motion.div 
              className="p-6 bg-secondary/10 rounded-lg border border-secondary/20"
              whileHover={{ scale: 1.05 }}
            >
              <h3 className="font-semibold text-secondary mb-2">Get Scored</h3>
              <p className="text-sm text-neutral-dark/70">Receive instant feedback and improvement suggestions</p>
            </motion.div>
            
            <motion.div 
              className="p-6 bg-accent/10 rounded-lg border border-accent/20"
              whileHover={{ scale: 1.05 }}
            >
              <h3 className="font-semibold text-accent mb-2">Learn & Improve</h3>
              <p className="text-sm text-neutral-dark/70">Practice with various question types and difficulties</p>
            </motion.div>
          </div>

          {questionsAnswered > 0 && (
            <motion.div 
              className="mb-6 p-4 bg-accent/10 rounded-lg border border-accent/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h3 className="font-semibold text-accent mb-2">Previous Session Results</h3>
              <p className="text-neutral-dark/70">
                Questions Answered: {questionsAnswered} | Average Score: {Math.round(totalScore / questionsAnswered)}%
              </p>
            </motion.div>
          )}

          <div className="flex gap-4 justify-center">
            <motion.button
              onClick={startGame}
              className="flex items-center px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PlayIcon className="w-5 h-5 mr-2" />
              Start Interview Challenge
            </motion.button>
            
            {questionsAnswered > 0 && (
              <motion.button
                onClick={resetGame}
                className="flex items-center px-6 py-3 bg-neutral-200 hover:bg-neutral-300 text-neutral-dark font-semibold rounded-lg transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshIcon className="w-5 h-5 mr-2" />
                Reset Progress
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-2xl text-neutral-dark max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Game Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-dark">Interview Response Builder</h2>
          <p className="text-neutral-dark/70">Question {questionsAnswered + 1} of 3</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-neutral-dark/70">Total Score</p>
          <p className="text-2xl font-bold text-primary">{totalScore}pts</p>
        </div>
      </div>

      {/* Current Question */}
      {currentQuestion && (
        <motion.div 
          className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium mr-3 ${
              currentQuestion.category === 'behavioral' ? 'bg-blue-100 text-blue-800' :
              currentQuestion.category === 'situational' ? 'bg-green-100 text-green-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {currentQuestion.category}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
              currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {currentQuestion.difficulty}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-neutral-dark">{currentQuestion.question}</h3>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Available Components */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-dark">📦 Response Parts to Choose From</h3>
            <div className="text-xs text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
              Click to add →
            </div>
          </div>
          
          {/* Legend */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
            <p className="text-xs font-medium text-gray-700 mb-2">Quality Guide:</p>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center"><div className="w-3 h-3 bg-green-200 rounded mr-1"></div>Best Choice</span>
              <span className="flex items-center"><div className="w-3 h-3 bg-yellow-200 rounded mr-1"></div>Good Choice</span>
              <span className="flex items-center"><div className="w-3 h-3 bg-red-200 rounded mr-1"></div>Avoid</span>
            </div>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto component-scroll">
            <AnimatePresence>
              {availableComponents.map((component) => (
                <motion.div
                  key={component.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                    component.quality === 'excellent' ? 'border-green-200 bg-green-50 hover:border-green-300' :
                    component.quality === 'good' ? 'border-yellow-200 bg-yellow-50 hover:border-yellow-300' :
                    'border-red-200 bg-red-50 hover:border-red-300'
                  }`}
                  onClick={() => addComponent(component)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        component.type === 'opener' ? 'bg-blue-100 text-blue-800' :
                        component.type === 'situation' ? 'bg-green-100 text-green-800' :
                        component.type === 'action' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {component.type === 'opener' ? '🚀 Opener' :
                         component.type === 'situation' ? '📍 Situation' :
                         component.type === 'action' ? '⚡ Action' :
                         '🎯 Result'}
                      </span>
                      {component.quality === 'excellent' && (
                        <span className="text-xs text-green-600 font-medium">⭐ Best</span>
                      )}
                      {component.quality === 'good' && (
                        <span className="text-xs text-yellow-600 font-medium">👍 Good</span>
                      )}
                      {component.quality === 'poor' && (
                        <span className="text-xs text-red-600 font-medium">⚠️ Weak</span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-400">
                      Click to add
                    </div>
                  </div>
                  <p className="text-sm text-neutral-dark">{component.text}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Selected Response */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-dark">🏗️ Your Interview Answer</h3>
            <div className="text-xs text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
              {selectedComponents.length}/4 parts
            </div>
          </div>
          
          {/* STAR Method Guide */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-medium text-blue-800 mb-2">📋 Perfect Answer Structure (STAR Method):</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
              <span>1️⃣ <strong>Situation:</strong> Set the scene</span>
              <span>2️⃣ <strong>Action:</strong> What you did</span>
              <span>3️⃣ <strong>Result:</strong> The outcome</span>
              <span>4️⃣ <strong>Opener:</strong> Nice introduction</span>
            </div>
          </div>
          
          <div className="min-h-96 p-6 bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-300 drag-zone">
            {selectedComponents.length === 0 ? (
              <div className="text-center text-neutral-400 py-12">
                <div className="text-6xl mb-4">👆</div>
                <p className="text-lg font-medium">Start Building Your Answer!</p>
                <p className="text-sm mt-2">Click any sentence part from the left side</p>
                <p className="text-xs mt-4 text-neutral-500">💡 Tip: Try to include all STAR components for the best score</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {selectedComponents.map((component, index) => (
                    <motion.div
                      key={component.id}
                      className="p-4 bg-white rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-all duration-300"
                      onClick={() => removeComponent(component.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-neutral-600">Step {index + 1}</span>
                          {component.quality === 'excellent' && (
                            <span className="text-xs text-green-600 font-medium">⭐ Excellent choice!</span>
                          )}
                          {component.quality === 'good' && (
                            <span className="text-xs text-yellow-600 font-medium">👍 Good choice</span>
                          )}
                          {component.quality === 'poor' && (
                            <span className="text-xs text-red-600 font-medium">🤔 Could be better</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            component.type === 'opener' ? 'bg-blue-100 text-blue-800' :
                            component.type === 'situation' ? 'bg-green-100 text-green-800' :
                            component.type === 'action' ? 'bg-purple-100 text-purple-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {component.type === 'opener' ? '🚀 Opener' :
                             component.type === 'situation' ? '📍 Situation' :
                             component.type === 'action' ? '⚡ Action' :
                             '🎯 Result'}
                          </span>
                          <span className="text-xs text-neutral-400">Click to remove</span>
                        </div>
                      </div>
                      <p className="text-sm text-neutral-dark">{component.text}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            {selectedComponents.length === 0 && (
              <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  👆 Select at least one response part to continue
                </p>
              </div>
            )}
            
            <div className="flex gap-4">
              <motion.button
                onClick={submitResponse}
                disabled={selectedComponents.length === 0}
                className="flex-1 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
                whileHover={{ scale: selectedComponents.length > 0 ? 1.02 : 1 }}
                whileTap={{ scale: selectedComponents.length > 0 ? 0.98 : 1 }}
              >
                {selectedComponents.length === 0 ? (
                  <>🔒 Add parts first</>
                ) : (
                  <>🎯 Get My Score ({selectedComponents.length} parts)</>
                )}
              </motion.button>
              
              <motion.button
                onClick={resetGame}
                className="px-6 py-3 bg-neutral-200 hover:bg-neutral-300 text-neutral-dark font-semibold rounded-lg transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🏠 Back to Menu
              </motion.button>
            </div>
            
            {selectedComponents.length > 0 && (
              <div className="text-center">
                <p className="text-xs text-neutral-600">
                  💡 Tip: You can click on any part in your answer to remove it
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-8 max-w-lg w-full shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4 text-neutral-dark">Response Feedback</h3>
                
                <div className={`text-6xl font-bold mb-4 ${getScoreColor(score)}`}>
                  {score}%
                </div>
                
                <p className="text-lg mb-6 text-neutral-dark/70">
                  {getScoreFeedback(score)}
                </p>

                <div className="bg-neutral-50 rounded-lg p-4 mb-6 text-left">
                  <h4 className="font-semibold mb-2 text-neutral-dark">Tips for Improvement:</h4>
                  <ul className="text-sm text-neutral-dark/70 space-y-1">
                    <li>• Use specific examples with measurable results</li>
                    <li>• Follow the STAR method structure</li>
                    <li>• Include relevant details about your actions</li>
                    <li>• Quantify your achievements when possible</li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  {questionsAnswered < 3 ? (
                    <motion.button
                      onClick={nextQuestion}
                      className="flex-1 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Next Question
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={() => setGameStarted(false)}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Complete Challenge
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default InterviewResponseBuilder;