import { useState, useEffect } from "react";
import { useUser } from "@clerk/react";

const ANON_KEY = "pressbox.clientId";

function getAnonId(): string {
  let id = localStorage.getItem(ANON_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(ANON_KEY, id);
  }
  return id;
}

/**
 * Returns the identifier used to key preferences.
 * - Signed in: Clerk user ID (persistent across devices)
 * - Signed out: anonymous UUID from localStorage
 */
export function useClientId() {
  const { user, isLoaded } = useUser();
  const [anonId, setAnonId] = useState<string | null>(null);

  useEffect(() => {
    setAnonId(getAnonId());
  }, []);

  if (!isLoaded) return null;
  if (user) return user.id;
  return anonId;
}
