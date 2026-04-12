// server/models/User.ts
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  email: string;
  username: string;
  password: string; // Hashed
  binderData: {
    notebooks: any[];
    sections: any[];
    pages: Record<string, any>;
    activeNotebookId: string;
    activeSectionId: string;
  };
  createdAt: string;
  updatedAt: string;
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}