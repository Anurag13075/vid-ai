// VidRush Auth — Real Google OAuth via @react-oauth/google
// Requires VITE_GOOGLE_CLIENT_ID in .env.local

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  GoogleOAuthProvider,
  useGoogleLogin,
  googleLogout,
} from "@react-oauth/google";

export interface AuthUser {
  name: string;
  email: string;
  avatar: string;
  accessToken: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: false,
  signIn: () => {},
  signOut: () => {},
});

const STORAGE_KEY = "vidrush_auth_user";
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

// Inner provider that has access to Google hooks
function AuthContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      return s ? (JSON.parse(s) as AuthUser) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const signIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const info = await res.json() as {
          name: string;
          email: string;
          picture: string;
        };
        const u: AuthUser = {
          name: info.name,
          email: info.email,
          avatar: info.picture,
          accessToken: tokenResponse.access_token,
        };
        setUser(u);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      } catch (err) {
        console.error("Failed to fetch user info", err);
      } finally {
        setIsLoading(false);
      }
    },
    onError: (err) => {
      console.error("Google login error", err);
      setIsLoading(false);
    },
  });

  function signOut() {
    googleLogout();
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Outer provider — wraps with GoogleOAuthProvider if CLIENT_ID is set
export function AuthProvider({ children }: { children: ReactNode }) {
  if (!CLIENT_ID) {
    // No client ID: run in demo-only mode with a warning
    console.warn(
      "[VidRush] VITE_GOOGLE_CLIENT_ID not set. " +
        "Google Auth is disabled. Add it to .env.local to enable real sign-in."
    );
    return (
      <AuthContext.Provider
        value={{
          user: null,
          isLoading: false,
          signIn: () =>
            alert(
              "Add VITE_GOOGLE_CLIENT_ID to .env.local to enable Google sign-in.\n\n" +
                "See .env.example for instructions."
            ),
          signOut: () => {},
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <AuthContextProvider>{children}</AuthContextProvider>
    </GoogleOAuthProvider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
