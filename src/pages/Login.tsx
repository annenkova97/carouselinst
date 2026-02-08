import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import { signInWithEmail, signUpWithEmail } from "@/lib/supabase-auth";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) {
        toast.error("Ошибка входа через Google", {
          description: error.message,
        });
      }
      // Redirect handled by OAuth flow
    } catch (error: any) {
      toast.error("Ошибка входа через Google", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Заполните все поля");
      return;
    }
    
    setIsLoading(true);
    try {
      await signInWithEmail(loginEmail, loginPassword);
      toast.success("Вход выполнен успешно!");
      navigate("/editor");
    } catch (error: any) {
      toast.error("Ошибка входа", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerEmail || !registerPassword) {
      toast.error("Заполните все поля");
      return;
    }
    
    if (registerPassword.length < 8) {
      toast.error("Пароль должен быть не менее 8 символов");
      return;
    }
    
    setIsLoading(true);
    try {
      await signUpWithEmail(registerEmail, registerPassword, registerName);
      toast.success("Регистрация успешна!", {
        description: "Проверьте email для подтверждения",
      });
    } catch (error: any) {
      toast.error("Ошибка регистрации", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Вход</TabsTrigger>
                <TabsTrigger value="register">Регистрация</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card className="shadow-soft">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Добро пожаловать!</CardTitle>
                    <CardDescription>
                      Войдите, чтобы продолжить работу над проектами
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            className="pl-10"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Пароль</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      <Button 
                        type="submit"
                        className="w-full bg-gradient-brand hover:opacity-90 transition-opacity"
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Войти
                      </Button>
                    </form>
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">или</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleGoogleAuth}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                      )}
                      Войти через Google
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                      <Link to="/forgot-password" className="text-primary hover:underline">
                        Забыли пароль?
                      </Link>
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="register">
                <Card className="shadow-soft">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Создать аккаунт</CardTitle>
                    <CardDescription>
                      Зарегистрируйтесь для сохранения проектов
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form onSubmit={handleEmailRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-name">Имя</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="register-name"
                            type="text"
                            placeholder="Ваше имя"
                            className="pl-10"
                            value={registerName}
                            onChange={(e) => setRegisterName(e.target.value)}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="register-email"
                            type="email"
                            placeholder="you@example.com"
                            className="pl-10"
                            value={registerEmail}
                            onChange={(e) => setRegisterEmail(e.target.value)}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-password">Пароль</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="register-password"
                            type="password"
                            placeholder="Минимум 8 символов"
                            className="pl-10"
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      <Button 
                        type="submit"
                        className="w-full bg-gradient-brand hover:opacity-90 transition-opacity"
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Создать аккаунт
                      </Button>
                    </form>
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">или</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleGoogleAuth}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                      )}
                      Регистрация через Google
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      Регистрируясь, вы соглашаетесь с{" "}
                      <Link to="/terms" className="text-primary hover:underline">
                        условиями использования
                      </Link>
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
