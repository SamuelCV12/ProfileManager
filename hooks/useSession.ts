'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { broadcast, listenSessionChanges } from '@/lib/tab-sync';

export function useSession() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkSession = useCallback(async (retryCount = 0) => {
    try {
      setLoading(true);
      const res = await fetch('/api/session');
      if (res.ok) {
        const data = await res.json();
        setIsLoggedIn(!!data.userId);
        setUserId(data.userId || null);
      } else if (retryCount < 3) {
        // Retry logic
        setTimeout(() => checkSession(retryCount + 1), 500);
        return;
      } else {
        setIsLoggedIn(false);
        setUserId(null);
      }
    } catch (error) {
      console.warn('Session check failed, retry', retryCount + 1, error);
      if (retryCount < 3) {
        setTimeout(() => checkSession(retryCount + 1), 500);
        return;
      }
      setIsLoggedIn(false);
      setUserId(null);
    } finally {
      if (retryCount === 0) setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    const handleTabMessage = (event: string, data?: any) => {
      switch (event) {
        case 'LOGOUT':
          setIsLoggedIn(false);
          setUserId(null);
          if (pathname.startsWith('/dashboard') || pathname.startsWith('/profile')) {
            router.push('/');
            router.refresh();
          }
          break;
        case 'LOGIN':
          setIsLoggedIn(true); // Optimistic
          checkSession();
          break;
        case 'RELOAD_DATA':
          checkSession();
          router.refresh();
          break;
      }
    };

    const cleanup = listenSessionChanges(handleTabMessage);
    return cleanup;
  }, [router, pathname, checkSession]);

  const login = () => broadcast('LOGIN');
  const logout = () => broadcast('LOGOUT');
  const reloadData = () => broadcast('RELOAD_DATA');

  return {
    isLoggedIn,
    userId,
    loading,
    login,
    logout,
    reloadData,
    checkSession,
  };
}

