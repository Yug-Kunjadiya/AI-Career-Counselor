import React, { useRef, useState, useEffect } from 'react';
import { AnalyzeIcon, UploadIcon } from './icons'; 
import LoadingSpinner from './LoadingSpinner';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, TextItem } from 'pdfjs-dist/types/src/display/api';


// Configure pdf.js worker source globally for this component/module.
// This points to the worker file that pdf.js uses for offloading tasks.
// Ensure this URL is correct based on how you're serving/importing pdf.js worker.
// Using esm.sh for worker as well, matching the main library import.
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.4.168/build/pdf.worker.min.js';


interface ResumeInputProps {
  resumeText: string;
  setResumeText: (text: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  error: string | null;
}

const ResumeInput: React.FC<ResumeInputProps> = ({ resumeText, setResumeText, onAnalyze, isLoading, error }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isReadingFile, setIsReadingFile] = useState<boolean>(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setFileError(null);
    setFileName(null);
    setIsReadingFile(true);

    const allowedTextTypes = ['text/plain', 'text/markdown'];
    const isTextFile = allowedTextTypes.includes(file.type) || file.name.endsWith('.txt') || file.name.endsWith('.md');
    const isPdfFile = file.type === 'application/pdf' || file.name.endsWith('.pdf');

    if (!isTextFile && !isPdfFile) {
      setFileError('Invalid file type. Please upload a .txt, .md, or .pdf file.');
      setIsReadingFile(false);
      if(fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
      return;
    }

    try {
      if (isPdfFile) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            if (!arrayBuffer) {
              setFileError('Could not read PDF file data.');
              setIsReadingFile(false);
              return;
            }
            
            const pdf: PDFDocumentProxy = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              fullText += textContent.items.map((item) => (item as TextItem).str).join(' ') + '\n';
            }
            setResumeText(fullText.trim());
            setFileName(file.name);
          } catch (pdfError) {
            console.error('Error parsing PDF:', pdfError);
            setFileError(`Could not parse PDF: ${pdfError instanceof Error ? pdfError.message : 'Unknown PDF error'}. Ensure it's not encrypted or corrupted.`);
          } finally {
            setIsReadingFile(false);
            if(fileInputRef.current) fileInputRef.current.value = ""; 
          }
        };
        reader.onerror = () => {
            setFileError('Error reading file for PDF processing.');
            setIsReadingFile(false);
            if(fileInputRef.current) fileInputRef.current.value = "";
        };
        reader.readAsArrayBuffer(file);
      } else { // Handle .txt, .md
        const text = await file.text();
        setResumeText(text);
        setFileName(file.name);
        setIsReadingFile(false);
        if(fileInputRef.current) fileInputRef.current.value = ""; 
      }
    } catch (e) {
      console.error('Error reading file:', e);
      setFileError(`Could not read file content. ${e instanceof Error ? e.message : ''}`);
      setIsReadingFile(false);
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <p className="text-md text-neutral-dark/80">
        Paste your resume content below, or summarize your skills, experience, and education. 
        Alternatively, upload a plain text (.txt), markdown (.md), or PDF (.pdf) file.
        The AI will analyze it to provide personalized career suggestions.
      </p>
      <textarea
        className="w-full h-48 p-3 border border-neutral/50 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 resize-none text-neutral-dark bg-white"
        placeholder="Paste your resume text here, or upload a .txt, .md, or .pdf file..."
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
        disabled={isLoading || isReadingFile}
        aria-label="Resume text input"
      />
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".txt,.md,text/plain,text/markdown,application/pdf,.pdf"
        className="hidden"
        aria-hidden="true"
      />
      
      <button
        onClick={handleUploadClick}
        disabled={isLoading || isReadingFile}
        className="w-full flex items-center justify-center px-6 py-3 bg-secondary hover:bg-secondary-dark text-white font-semibold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-secondary-light focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Upload resume file"
      >
        {isReadingFile ? (
          <>
            <LoadingSpinner className="w-5 h-5 mr-2" />
            Reading File...
          </>
        ) : (
          <>
            <UploadIcon className="w-5 h-5 mr-2" />
            Upload Resume File (.txt, .md, .pdf)
          </>
        )}
      </button>

      {fileError && <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md" role="alert">{fileError}</p>}
      {fileName && !fileError && <p className="text-sm text-green-700 bg-green-100 p-2 rounded-md">Loaded: {fileName}</p>}
      {error && <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md" role="alert">{error}</p>}

      <button
        onClick={onAnalyze}
        disabled={isLoading || isReadingFile || !resumeText.trim()}
        className="w-full flex items-center justify-center px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Analyze resume content"
      >
        {isLoading ? (
          <>
            <LoadingSpinner className="w-5 h-5 mr-2" />
            Analyzing...
          </>
        ) : (
          <>
            <AnalyzeIcon className="w-5 h-5 mr-2" /> 
            Analyze Resume
          </>
        )}
      </button>
    </div>
  );
};

export default ResumeInput;