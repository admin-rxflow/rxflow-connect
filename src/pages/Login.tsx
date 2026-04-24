import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email, password);

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Acesso Bloqueado', {
          description: 'Senha incorreta OU você ainda não confirmou seu e-mail! Por favor, vá na sua caixa de e-mail e clique no link de confirmação antes de tentar logar.',
          duration: 6000,
        });
      } else {
        toast.error('Erro ao fazer login', {
          description: 'Verifique suas credenciais e tente novamente.',
        });
      }
      setIsLoading(false);
      return;
    }

    toast.success('Login realizado com sucesso!');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background image side */}
      <div className="hidden lg:flex lg:w-3/5 relative">
        <img
          src="/login-bg.png"
          alt="Farmácia moderna"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Overlay content */}
        <div className="relative z-10 flex flex-col justify-end p-12 pb-20">
          <div className="max-w-lg animate-fade-in">
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Automatize o atendimento da sua farmácia
            </h2>
            <p className="text-white/80 text-lg leading-relaxed">
              Gerencie conversas, pedidos, estoque e muito mais com inteligência artificial integrada ao WhatsApp.
            </p>
            <div className="flex gap-6 mt-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-white/70 text-sm">IA Integrada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-white/70 text-sm">WhatsApp Business</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-white/70 text-sm">Multi-tenant</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login form side */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-background relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="w-full max-w-md relative z-10">
          {/* Logo */}
          <div className="flex items-center justify-center mb-10 animate-fade-in">
            <img src="/rxflow-logo.png" alt="RxFlow" className="h-24 w-auto" />
          </div>

          {/* Welcome text */}
          <div className="text-center mb-8 animate-fade-in delay-75">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Bem-vindo de volta
            </h1>
            <p className="text-muted-foreground">
              Acesse sua conta para gerenciar sua farmácia
            </p>
          </div>

          {/* Login Card */}
          <Card className="border-0 shadow-xl shadow-black/5 glass-card animate-scale-in delay-150">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Senha
                    </Label>
                    <button
                      type="button"
                      className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-colors pr-12"
                      autoComplete="current-password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold gradient-primary hover:opacity-90 transition-all duration-300 glow-primary border-0"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Entrar
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Register link */}
          <div className="text-center mt-6 animate-fade-in delay-300">
            <p className="text-sm text-muted-foreground">
              Não tem uma conta?{' '}
              <Link
                to="/register"
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Cadastre sua farmácia
              </Link>
            </p>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 animate-fade-in delay-375">
            <p className="text-xs text-muted-foreground/60">
              © 2026 RxFlow. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
