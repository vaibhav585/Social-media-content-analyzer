// =============================================================================
// Analysis Store (Zustand)
// Manages current analysis state, uploaded files, and results.
// =============================================================================

import { create } from 'zustand';
import type { Platform, Analysis, UploadedFile } from '../types';

interface AnalysisStore {
  // Upload State
  uploadedFile: UploadedFile | null;
  selectedPlatform: Platform;
  manualText: string;

  // Analysis State
  currentAnalysis: Analysis | null;
  isAnalyzing: boolean;
  analysisError: string | null;

  // Actions
  setUploadedFile: (file: UploadedFile | null) => void;
  setSelectedPlatform: (platform: Platform) => void;
  setManualText: (text: string) => void;
  setExtractedText: (text: string) => void;
  setExtractionProgress: (progress: number) => void;
  setExtractionStatus: (status: UploadedFile['extractionStatus']) => void;
  setExtractionError: (error: string | null) => void;
  setCurrentAnalysis: (analysis: Analysis | null) => void;
  setIsAnalyzing: (value: boolean) => void;
  setAnalysisError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  uploadedFile: null,
  selectedPlatform: 'instagram' as Platform,
  manualText: '',
  currentAnalysis: null,
  isAnalyzing: false,
  analysisError: null,
};

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  ...initialState,

  setUploadedFile: (file) => set({ uploadedFile: file }),
  setSelectedPlatform: (platform) => set({ selectedPlatform: platform }),
  setManualText: (text) => set({ manualText: text }),

  setExtractedText: (text) =>
    set((state) => ({
      uploadedFile: state.uploadedFile
        ? { ...state.uploadedFile, extractedText: text }
        : null,
    })),

  setExtractionProgress: (progress) =>
    set((state) => ({
      uploadedFile: state.uploadedFile
        ? { ...state.uploadedFile, extractionProgress: progress }
        : null,
    })),

  setExtractionStatus: (status) =>
    set((state) => ({
      uploadedFile: state.uploadedFile
        ? { ...state.uploadedFile, extractionStatus: status }
        : null,
    })),

  setExtractionError: (error) =>
    set((state) => ({
      uploadedFile: state.uploadedFile
        ? { ...state.uploadedFile, extractionError: error }
        : null,
    })),

  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  setIsAnalyzing: (value) => set({ isAnalyzing: value }),
  setAnalysisError: (error) => set({ analysisError: error }),

  reset: () => set(initialState),
}));
