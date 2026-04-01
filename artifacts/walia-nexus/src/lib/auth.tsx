import { createContext, useContext, ReactNode, useState } from "react";
import { UserProfile } from "@workspace/api-client-react";

interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("walia_token");
  });
  
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem("walia_user");
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const login = (newToken: string, newUser: UserProfile) => {
    localStorage.setItem("walia_token", newToken);
    localStorage.setItem("walia_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("walia_token");
    localStorage.removeItem("walia_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
