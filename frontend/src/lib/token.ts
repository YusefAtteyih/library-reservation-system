import { LOCAL_STORAGE_KEYS } from '@/config';

interface Tokens {
  accessToken: string | null;
  refreshToken: string | null;
}

export const getTokens = (): Tokens => {
  if (typeof window === 'undefined') {
    return { accessToken: null, refreshToken: null };
  }

  try {
    const tokens = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH);
    return tokens ? JSON.parse(tokens) : { accessToken: null, refreshToken: null };
  } catch (error) {
    console.error('Error getting auth tokens:', error);
    return { accessToken: null, refreshToken: null };
  }
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.AUTH,
      JSON.stringify({ accessToken, refreshToken })
    );
  } catch (error) {
    console.error('Error setting auth tokens:', error);
  }
};

export const clearTokens = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH);
  } catch (error) {
    console.error('Error clearing auth tokens:', error);
  }
};

export const isAuthenticated = (): boolean => {
  const { accessToken } = getTokens();
  return !!accessToken;
};

export const getAccessToken = (): string | null => {
  const { accessToken } = getTokens();
  return accessToken;
};

export const getRefreshToken = (): string | null => {
  const { refreshToken } = getTokens();
  return refreshToken;
};
