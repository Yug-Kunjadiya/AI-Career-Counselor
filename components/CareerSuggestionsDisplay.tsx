
import React from 'react';
import { CareerSuggestion } from '../types';
import { BriefcaseIcon, ChevronDownIcon, ChevronUpIcon, LightBulbIcon, SparklesIcon, ChartBarIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';

interface CareerSuggestionsDisplayProps {
  suggestions: CareerSuggestion[];
  isLoading: boolean;
  error: string | null;
}

const CareerSuggestionCard: React.FC<{ suggestion: CareerSuggestion }> = ({ suggestion }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="bg-gradient-to-r from-secondary/10 to-accent/10 p-4 rounded-lg shadow-lg border border-secondary/30 mb-4 transition-all duration-300 hover:shadow-xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left"
      >
        <div className="flex items-center">
          <BriefcaseIcon className="w-6 h-6 text-secondary mr-3 flex-shrink-0" />
          <h3 className="text-lg font-semibold text-secondary-dark">{suggestion.careerName}</h3>
        </div>
        {isOpen ? <ChevronUpIcon className="w-5 h-5 text-secondary-dark" /> : <ChevronDownIcon className="w-5 h-5 text-secondary-dark" />}
      </button>

      {suggestion.estimatedDemand && (
        <p className="text-sm text-neutral-dark/70 mt-1 ml-9">
            <ChartBarIcon className="w-4 h-4 inline mr-1"/>
            Estimated Demand: <span className="font-medium">{suggestion.estimatedDemand}</span>
        </p>
      )}

      {isOpen && (
        <div className="mt-3 pl-9 space-y-3">
          <div>
            <h4 className="font-medium text-neutral-dark/90 flex items-center"><SparklesIcon className="w-4 h-4 mr-1 text-accent"/>Why it fits:</h4>
            <p className="text-sm text-neutral-dark/80">{suggestion.reason}</p>
          </div>
          <div>
            <h4 className="font-medium text-neutral-dark/90 flex items-center"><LightBulbIcon className="w-4 h-4 mr-1 text-accent"/>Skills to develop:</h4>
            <ul className="list-disc list-inside text-sm text-neutral-dark/80 space-y-0.5">
              {suggestion.skillsToDevelop.map((skill, i) => <li key={i}>{skill}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-neutral-dark/90 flex items-center"><SparklesIcon className="w-4 h-4 mr-1 text-accent"/>Roadmap steps:</h4>
            <ul className="list-decimal list-inside text-sm text-neutral-dark/80 space-y-0.5">
              {suggestion.roadmapSteps.map((step, i) => <li key={i}>{step}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const CareerSuggestionsDisplay: React.FC<CareerSuggestionsDisplayProps> = ({ suggestions, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-neutral-dark/80 p-4">
        <LoadingSpinner className="w-8 h-8 mb-2 text-secondary" />
        <p>Finding the best career paths for you...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>;
  }

  if (suggestions.length === 0) {
    return <p className="text-neutral-dark/70 italic">No career suggestions available yet. Analyze your resume to see recommendations.</p>;
  }

  return (
    <div className="space-y-4">
      {suggestions.map((suggestion, index) => (
        <CareerSuggestionCard key={index} suggestion={suggestion} />
      ))}
    </div>
  );
};

export default CareerSuggestionsDisplay;
    