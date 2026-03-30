import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowRight, ArrowLeft, Building2, UserPlus, CheckCircle2, Info } from 'lucide-react';
import { toast } from 'sonner';

const Register = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  // Step 1: User data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2: Pharmacy data
  const [pharmacyName, setPharmacyName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [plan, setPlan] = useState('basic');

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/^(\d{2})(\d{4})(\d{4}).*/, '($1) $2-$3');
    }
    return numbers.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
  };

  const handleStep1 = () => {
    if (!email || !password || !confirmPassword) {
      toast.error('Preencha todos os campos');
      return;
    }
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pharmacyName) {
      toast.error('Preencha o nome da farmácia');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create user account
      const { error: signUpError, data } = await signUp(email, password, {
        pharmacy_name: pharmacyName,
      });

      if (signUpError) {
        toast.error('Erro ao criar conta', { description: signUpError.message });
        setIsLoading(false);
        return;
      }

      if (!data?.user) {
        toast.error('Erro ao criar conta');
        setIsLoading(false);
        return;
      }

      // 2. Create tenant (pharmacy)
      const { data: tenant, error: tenantError } = await supabase
        .from('rx_tenants')
        .insert({
          name: pharmacyName,
          cnpj: cnpj || null,
          email,
          phone: phone || null,
          address: address || null,
          city: city || null,
          state: state || null,
          postal_code: postalCode || null,
          plan,
          created_by: data.user.id,
        })
        .select()
        .single();

      if (tenantError) {
        console.error('Tenant creation error:', tenantError);
        toast.error('Erro ao criar farmácia', { description: tenantError.message });
        setIsLoading(false);
        return;
      }

      // 3. Create tenant_user linking
      const { error: tuError } = await supabase
        .from('rx_tenant_users')
        .insert({
          tenant_id: tenant.id,
          user_id: data.user.id,
          role: 'admin',
        });

      if (tuError) {
        console.error('Tenant user error:', tuError);
      }

      // 4. Create default AI config
      await supabase.from('rx_ai_configs').insert({
        tenant_id: tenant.id,
        pharmacy_name: pharmacyName,
      });

      toast.success('Conta criada com sucesso!', {
        description: 'Verifique seu e-mail para confirmar a conta.',
      });

      navigate('/login');
    } catch (err) {
      console.error(err);
      toast.error('Erro inesperado');
    }

    setIsLoading(false);
  };

  const plans = [
    { value: 'basic', label: 'Básico', price: 'R$ 99/mês', features: '1.000 conversas', color: 'border-emerald-500/30' },
    { value: 'professional', label: 'Profissional', price: 'R$ 249/mês', features: '5.000 conversas', color: 'border-blue-500/30' },
    { value: 'enterprise', label: 'Enterprise', price: 'R$ 499/mês', features: 'Ilimitado', color: 'border-amber-500/30' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-background">
      {/* Decorative backgrounds */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8 animate-fade-in">
          <img src="/rxflow-logo.png" alt="RxFlow" className="h-12 w-auto" />
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center mb-8 gap-3 animate-fade-in delay-75">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${step === 1 ? 'gradient-primary text-white' : 'bg-primary/10 text-primary'}`}>
            <UserPlus className="w-4 h-4" />
            Conta
          </div>
          <div className="w-8 h-0.5 bg-border" />
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${step === 2 ? 'gradient-primary text-white' : 'bg-muted text-muted-foreground'}`}>
            <Building2 className="w-4 h-4" />
            Farmácia
          </div>
        </div>

        <Card className="border-0 shadow-xl shadow-black/5 glass-card animate-scale-in delay-150">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl font-bold">
              {step === 1 ? 'Crie sua conta' : 'Dados da farmácia'}
            </CardTitle>
            <CardDescription>
              {step === 1 ? 'Preencha seus dados de acesso' : 'Informe os dados da sua farmácia'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-4">
            {step === 1 ? (
                <div className="space-y-4">
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex gap-3 text-sm animate-fade-in mt-2 mb-4">
                    <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-muted-foreground leading-snug">
                      <strong className="text-foreground">Importante:</strong> Este e-mail será o <strong className="text-primary">Proprietário (Admin)</strong> da conta da farmácia. Ele terá privilégio total para convidar sua equipe e gerenciar o sistema.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">E-mail do Proprietário</Label>
                    <Input id="reg-email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 bg-background/50" />
                  </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Senha</Label>
                  <Input id="reg-password" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-confirm">Confirmar senha</Label>
                  <Input id="reg-confirm" type="password" placeholder="Repita a senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-11 bg-background/50" />
                </div>
                <Button onClick={handleStep1} className="w-full h-11 gradient-primary border-0 font-semibold mt-2">
                  Continuar <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pharmacy-name">Nome da farmácia *</Label>
                  <Input id="pharmacy-name" placeholder="Farmácia Exemplo" value={pharmacyName} onChange={(e) => setPharmacyName(e.target.value)} className="h-11 bg-background/50" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input id="cnpj" placeholder="00.000.000/0000-00" value={cnpj} onChange={(e) => setCnpj(formatCNPJ(e.target.value))} maxLength={18} className="h-11 bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-phone">Telefone</Label>
                    <Input id="reg-phone" placeholder="(00) 00000-0000" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} maxLength={15} className="h-11 bg-background/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-address">Endereço</Label>
                  <Textarea id="reg-address" placeholder="Rua, número, bairro" value={address} onChange={(e) => setAddress(e.target.value)} className="bg-background/50 min-h-[60px]" rows={2} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="reg-city">Cidade</Label>
                    <Input id="reg-city" placeholder="São Paulo" value={city} onChange={(e) => setCity(e.target.value)} className="h-11 bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-state">UF</Label>
                    <Input id="reg-state" placeholder="SP" value={state} onChange={(e) => setState(e.target.value.toUpperCase())} maxLength={2} className="h-11 bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-cep">CEP</Label>
                    <Input id="reg-cep" placeholder="00000-000" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} maxLength={9} className="h-11 bg-background/50" />
                  </div>
                </div>

                {/* Plan selection */}
                <div className="space-y-2">
                  <Label>Plano</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {plans.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPlan(p.value)}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          plan === p.value
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                            : `border-border hover:${p.color}`
                        }`}
                      >
                        <div className="text-sm font-semibold">{p.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">{p.price}</div>
                        <div className="text-[10px] text-muted-foreground/70 mt-0.5">{p.features}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="h-11">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                  </Button>
                  <Button type="submit" className="flex-1 h-11 gradient-primary border-0 font-semibold" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Criar conta
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Login link */}
        <div className="text-center mt-6 animate-fade-in delay-300">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
