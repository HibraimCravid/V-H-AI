export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  isThinking?: boolean;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  model: string;
  category: "chat" | "content" | "image" | "video" | "voice";
  messages: Message[];
  updatedAt: string;
}

export interface UserPreferences {
  theme: "light" | "dark" | "cyberpunk";
  wallpaper: string;
  aiModel: string;
  voiceName: string;
  language: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoUrl: string;
  preferences: UserPreferences;
  age?: number;
  behaviorInstruction?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface Wallpaper {
  id: string;
  name: string;
  value: string; // Tailwind class background gradient or URL
  preview: string; // preview coloring
}
