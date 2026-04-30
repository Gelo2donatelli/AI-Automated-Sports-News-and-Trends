import { useState, useEffect } from "react";

export function useClientId() {
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem("gridiron.clientId");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("gridiron.clientId", id);
    }
    setClientId(id);
  }, []);

  return clientId;
}
