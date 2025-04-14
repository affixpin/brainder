export type TopicCategory =
  | 'Space & Astronomy'
  | 'Biology & Human Body'
  | 'Psychology & Emotions'
  | 'Artificial Intelligence & Computers'
  | 'Everyday Physics'
  | 'History of Ideas'
  | 'Internet Culture & Society'
  | 'Brain & Memory'
  | 'Animals & Evolution'
  | 'Food & Chemistry'
  | 'Money, Economics & Cryptocurrencies';

export interface Topic {
  id: string;
  title: string;
  category: TopicCategory;
  teaser: string;
  reels: Reel[];
}

export interface TextBlock {
  type: 'text';
  content: string;
}

export interface QuestionBlock {
  type: 'question';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export type Reel = TextBlock | QuestionBlock;

export interface UserProgress {
  completedTopics: string[];
  currentTopic?: string;
  currentReelIndex?: number;
} 