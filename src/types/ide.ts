export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  children?: FileNode[];
}

export interface EditorTab {
  id: string;
  name: string;
  content: string;
  language: string;
  modified: boolean;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
