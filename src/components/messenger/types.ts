import { UserProfile } from '../../types';

export interface Connection {
  id?: string;
  users: string[]; // [uid1, uid2]
  connectedAt: string;
}

export interface ConnectionRequest {
  id?: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: string;
}

export interface PrivateChat {
  id?: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCounts?: Record<string, number>;
}

export interface PrivateMessage {
  id?: string;
  chatId: string;
  senderId: string;
  text: string;
  messageType: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  seen: boolean;
  delivered: boolean;
  edited: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Group {
  id?: string;
  name: string;
  description: string;
  photoUrl?: string;
  code: string;
  createdAt: string;
}

export interface GroupMember {
  id?: string;
  groupId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export interface GroupMessage {
  id?: string;
  groupId: string;
  senderId: string;
  text: string;
  messageType: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  createdAt: string;
}
