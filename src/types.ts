export interface SlideInput {
  label: string;
  placeholder: string;
  type: 'number' | 'text';
  key: string;
  defaultValue?: string;
}

export interface SlideSimulation {
  title: string;
  inputs: SlideInput[];
  run: (inputs: Record<string, string>) => string;
}

export interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  section?: string;
  type: 'title' | 'intro' | 'types' | 'code-simulation' | 'location' | 'comparison' | 'flow' | 'summary';
  bullets?: string[];
  code?: string;
  diagramId: string;
  presenterNotes: string[];
  simulation?: SlideSimulation;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}
