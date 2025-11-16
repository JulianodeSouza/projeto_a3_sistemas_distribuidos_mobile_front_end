import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { Dashboard } from "./components/Dashboard";
import api from "./utils/api";
import { AlertDialog } from "./components/ui/alert-dialog";
import LoadingProvider from "./components/LoadingProvider";

type Screen = "landing" | "login" | "signup" | "dashboard";

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    const result = await api.post("auth/login", {
      email,
      password,
    });

    // Condition to login failure
    if (result.error) {
      // Retornar msg com o erro
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

  return <LoadingProvider>{content}</LoadingProvider>;
}

export default App;
