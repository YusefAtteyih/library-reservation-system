import axios from 'axios';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

// Base API URL - would be configured from environment in production
const API_BASE_URL = 'http://localhost:3001/api';

// Type definitions
export interface ApiResponse<T> {
  data: T;
  isLoading: boolean;
  isError: any;
  mutate: () => void;
}

// Generic hooks for CRUD operations
export function useGetAll<T>(endpoint: string): ApiResponse<T[]> {
  const { data, error, mutate } = useSWR<T[]>(`${API_BASE_URL}/${endpoint}`);
  
  return {
    data: data || [],
    isLoading: !error && !data,
    isError: error,
    mutate
  };
}

export function useGetById<T>(endpoint: string, id: string | null): ApiResponse<T | null> {
  const { data, error, mutate } = useSWR<T>(
    id ? `${API_BASE_URL}/${endpoint}/${id}` : null
  );
  
  return {
    data: data || null,
    isLoading: !error && !data && id !== null,
    isError: error,
    mutate
  };
}

export function useSearch<T>(endpoint: string, query: string): ApiResponse<T[]> {
  const { data, error, mutate } = useSWR<T[]>(
    query ? `${API_BASE_URL}/${endpoint}/search?q=${encodeURIComponent(query)}` : null
  );
  
  return {
    data: data || [],
    isLoading: !error && !data && query !== '',
    isError: error,
    mutate
  };
}

// Create, Update, Delete operations (not using SWR directly)
export async function createItem<T, U>(endpoint: string, item: U): Promise<T> {
  const response = await axios.post<T>(`${API_BASE_URL}/${endpoint}`, item);
  return response.data;
}

export async function updateItem<T, U>(endpoint: string, id: string, item: U): Promise<T> {
  const response = await axios.patch<T>(`${API_BASE_URL}/${endpoint}/${id}`, item);
  return response.data;
}

export async function deleteItem<T>(endpoint: string, id: string): Promise<T> {
  const response = await axios.delete<T>(`${API_BASE_URL}/${endpoint}/${id}`);
  return response.data;
}

// Resource-specific hooks
export function useRooms() {
  return useGetAll<Room>('rooms');
}

export function useRoom(id: string | null) {
  return useGetById<Room>('rooms', id);
}

export function useSeats() {
  return useGetAll<Seat>('seats');
}

export function useSeatsByRoom(roomId: string | null) {
  const { data, error, mutate } = useSWR<Seat[]>(
    roomId ? `${API_BASE_URL}/seats/room/${roomId}` : null
  );
  
  return {
    data: data || [],
    isLoading: !error && !data && roomId !== null,
    isError: error,
    mutate
  };
}

export function useSeat(id: string | null) {
  return useGetById<Seat>('seats', id);
}

export function useBooks() {
  return useGetAll<Book>('books');
}

export function useBook(id: string | null) {
  return useGetById<Book>('books', id);
}

export function useBookSearch(query: string) {
  return useSearch<Book>('books', query);
}

// Mock data implementation for development
// This will be used until the backend API is accessible
export function useMockData<T>(mockData: T[], delay = 500): ApiResponse<T[]> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setData(mockData);
      setIsLoading(false);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [mockData, delay]);
  
  return {
    data,
    isLoading,
    isError: null,
    mutate: () => {} // No-op for mock data
  };
}
