import { useEffect, useState } from "react";

/** True after client hydration — safe to run entrance motion without SSR flash. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
