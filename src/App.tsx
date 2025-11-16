import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { Dashboard } from "./components/Dashboard";
import api from "./utils/api";
import LoadingProvider from "./components/LoadingProvider";
import GlobalAlert from "./components/GlobalAlert";

type Screen = "landing" | "login" | "signup" | "dashboard";

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // alertModal was not rendering anything; use global event `show-alert` instead.

  const handleLogin = async (email: string, password: string) => {
    const result = await api.post("auth/login", {
      email,
      password,
    });

    // Condition to login failure
    if (result.error) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("show-alert", {
            detail: {
              title: "Erro",
              message: result.error || result.message || "Falha no login",
            },
          })
        );
      }
      return;
    }

    sessionStorage.setItem("token", result.data.token);
    setIsAuthenticated(true);
    setCurrentScreen("dashboard");
  };

  const handleSignup = (name: string, email: string, password: string) => {
    console.log("Signup:", { name, email, password });
    setIsAuthenticated(true);
    setCurrentScreen("dashboard");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentScreen("landing");
  };

  let content = null as any;

  if (currentScreen === "landing") {
    content = (
      <LandingPage
        onLogin={() => setCurrentScreen("login")}
        onSignup={() => setCurrentScreen("signup")}
      />
    );
  } else if (currentScreen === "login") {
    content = (
      <LoginPage
        onLogin={handleLogin}
        onBackToLanding={() => setCurrentScreen("landing")}
        onGoToSignup={() => setCurrentScreen("signup")}
      />
    );
  } else if (currentScreen === "signup") {
    content = (
      <SignupPage
        onSignup={handleSignup}
        onBackToLanding={() => setCurrentScreen("landing")}
        onGoToLogin={() => setCurrentScreen("login")}
      />
    );
  } else if (currentScreen === "dashboard" && isAuthenticated) {
    content = <Dashboard onLogout={handleLogout} />;
  }

  return (
    <LoadingProvider>
      {content}
      <GlobalAlert />
    </LoadingProvider>
  );
}

export default App;
