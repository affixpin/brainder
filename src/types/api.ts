export interface Topic {
  id: string;
  category: string;
  title: string;
  teaser: string;
}

export interface TextReel {
  type: 'text';
  content: string;
}

export interface QuestionReel {
  type: 'question';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export type Reel = TextReel | QuestionReel; 