import axios from 'axios';
import { API_BASE_URL } from '@/config';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'ADMIN' | 'LIBRARIAN';
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
  expires_in: number;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(
    `${API_BASE_URL}/auth/login`,
    { email, password },
    { withCredentials: true }
  );
  return response.data;
};

export const register = async (data: RegisterData): Promise<User> => {
  const response = await axios.post<User>(
    `${API_BASE_URL}/auth/register`,
    data,
    { withCredentials: true }
  );
  return response.data;
};

export const logout = async (): Promise<void> => {
  await axios.post(
    `${API_BASE_URL}/auth/logout`,
    {},
    { withCredentials: true }
  );
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await axios.get<User>(`${API_BASE_URL}/auth/me`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    return null;
  }
};

export const refreshToken = async (): Promise<{ access_token: string }> => {
  const response = await axios.post<{ access_token: string }>(
    `${API_BASE_URL}/auth/refresh`,
    {},
    { withCredentials: true }
  );
  return response.data;
};
