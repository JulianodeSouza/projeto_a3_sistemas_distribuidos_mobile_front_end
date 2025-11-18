import { useState, useEffect } from "react";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { Dashboard } from "./components/Dashboard";
import api, { ApiError } from "./utils/api";
import LoadingProvider from "./components/LoadingProvider";
import { Toaster, toast } from 'sonner';

// Removido "reset-password" do tipo
type Screen = "landing" | "login" | "signup" | "dashboard";

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      setCurrentScreen("dashboard");
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await api.post<{ token: string }>("auth/login", {
        email: email,
        password: password,
      });

      sessionStorage.setItem("token", result.token);
      setIsAuthenticated(true);
      setCurrentScreen("dashboard");

    } catch (error: any) {
      if (error?.status === 401) {
        toast.error("Falha no Login", {
          description: "E-mail ou senha incorretos. Verifique seus dados."
        });
      } else {
        toast.error("Erro de Conexão", {
          description: "Não foi possível conectar ao servidor."
        });
      }
    };
  }

  const handleSignup = async (name: string, email: string, password: string) => {
    try {
      await api.post("users", {
        name: name,
        email: email,
        password: password,
      });

      toast.success("Conta criada com sucesso!", {
        description: "Por favor, faça o login."
      });

      setCurrentScreen("login");

    } catch (error: any) {
      if (error?.status === 409) { 
        toast.error("Erro no Cadastro", {
          description: "Este e-mail já está cadastrado."
        });
      } else {
        toast.error("Erro de Conexão", {
          description: "Não foi possível criar a conta."
        });
      }
    };
  }

  const handleLogout = () => {
    sessionStorage.removeItem("token");
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
      <Toaster position="top-right" richColors />
      {content}
    </LoadingProvider>
  );
}

export default App;