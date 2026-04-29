// hooks/useSession.ts
import { useState, useEffect } from "react";

export function useSession() {
  const [userId,    setUserId]    = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    fetch("/api/session")
      .then(res => res.json())
      .then(data => {
        if (data.userId) {
          setUserId(data.userId);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      })
      .catch(() => setIsLoggedIn(false))
      .finally(() => setLoading(false));
  }, []);

  return { userId, isLoggedIn, loading };
}