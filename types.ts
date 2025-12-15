export interface User {
  name: string;
  email: string;
  avatarUrl?: string;
}

export type Folder = 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam' | 'starred';

export interface Attachment {
  fileName: string;
  fileSize: string;
}

export interface Email {
  id: string;
  from: User;
  to: User[];
  cc?: User[];
  bcc?: User[];
  subject: string;
  body: string;
  date: string;
  read: boolean;
  folder: Folder;
  attachments?: Attachment[];
  starred?: boolean;
}

export interface Toast {
  id: number;
  message: string;
}