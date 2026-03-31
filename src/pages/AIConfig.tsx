import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Brain, Shield, MessageSquare, Sparkles, Save, Eye, EyeOff, Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useAuth } from '@/contexts/AuthContext';
import { useAIConfig, useUpdateAIConfig } from '@/hooks/useAIConfig';

const models: Record<string, { label: string; models: { value: string; label: string }[] }> = {
  openai: {
    label: 'OpenAI',
    models: [
      { value: 'gpt-4o', label: 'GPT-4o' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    ],
  },
  anthropic: {
    label: 'Anthropic',
    models: [
      { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
      { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
    ],
  },
  google: {
    label: 'Google',
    models: [
      { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
      { value: 'gemini-2.5-pro-preview-05-06', label: 'Gemini 2.5 Pro' },
    ],
  },
};

const defaultPrompt = `Você é um assistente de atendimento ao cliente de uma farmácia.\nSua responsabilidade é:\n- Responder dúvidas sobre medicamentos com precisão\n- Consultar disponibilidade e preços\n- Auxiliar na compra e agendamento de entrega\n- Ser cordial e profissional\n\nGUARDRAILS:\n- Nunca recomende medicamentos sem consultar o sistema\n- Não forneça diagnósticos médicos\n- Se medicamento requer receita, avise ao cliente\n- Se cliente solicitar algo fora de seu escopo, escale para humano\n\nResponda sempre em português, de forma clara e concisa.`;

const defaultEscalation = "receita controlada\nemergência\nalergia grave\nefeito colateral\nfalar com atendente";

const AIConfig = () => {
  const { tenantId } = useAuth();
  const { data: config, isLoading } = useAIConfig(tenantId);
  const { mutate: saveConfig, isPending } = useUpdateAIConfig();

  // Local state
  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState('gpt-4o');
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([500]);
  const [tone, setTone] = useState('professional');
  const [enableSuggestions, setEnableSuggestions] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [systemPrompt, setSystemPrompt] = useState(defaultPrompt);

  // Guardrails local state
  const [validatePrescription, setValidatePrescription] = useState(true);
  const [ageRestriction, setAgeRestriction] = useState(true);
  const [escalateToHuman, setEscalateToHuman] = useState(true);
  const [maxOrderValue, setMaxOrderValue] = useState(5000);
  const [escalationKeywords, setEscalationKeywords] = useState(defaultEscalation);

  // Sync DB to local state on load or change
  useEffect(() => {
    if (config) {
      setProvider(config.llm_provider || 'openai');
      setModel(config.llm_model || 'gpt-4o');
      setTemperature([config.llm_temperature ?? 0.7]);
      setMaxTokens([config.llm_max_tokens ?? 500]);
      setTone(config.tone || 'professional');
      setEnableSuggestions(config.enable_suggestions ?? true);
      setSystemPrompt(config.system_prompt || defaultPrompt);

      if (config.guardrails && typeof config.guardrails === 'object') {
        const g = config.guardrails as any;
        setValidatePrescription(g.require_prescription_validation ?? true);
        setAgeRestriction(g.require_age_validation ?? true);
        setEscalateToHuman(g.escalate_to_human ?? true);
        setMaxOrderValue(g.max_order_value ?? 5000);
        if (g.escalation_keywords && Array.isArray(g.escalation_keywords)) {
          setEscalationKeywords(g.escalation_keywords.join('\n'));
        }
      }
    }
  }, [config]);

  // Handle Provider Change & load correct API key
  useEffect(() => {
    if (config) {
      if (provider === 'openai') setApiKey(config.openai_api_key || '');
      else if (provider === 'anthropic') setApiKey(config.anthropic_api_key || '');
      else if (provider === 'google') setApiKey(config.google_api_key || '');
    } else {
      setApiKey('');
    }
  }, [provider, config]);

  const handleSave = () => {
    if (!tenantId) {
      toast.error('O seu usuário não tem uma farmácia vinculada (tenant_id).');
      return;
    }

    const guardrailsJSON = {
      require_prescription_validation: validatePrescription,
      require_age_validation: ageRestriction,
      escalate_to_human: escalateToHuman,
      max_order_value: Number(maxOrderValue),
      escalation_keywords: escalationKeywords.split('\n').map(k => k.trim()).filter(Boolean)
    };

    saveConfig({
      id: config?.id,
      tenant_id: tenantId,
      llm_provider: provider,
      llm_model: model,
      llm_temperature: temperature[0],
      llm_max_tokens: maxTokens[0],
      tone,
      enable_suggestions: enableSuggestions,
      system_prompt: systemPrompt,
      guardrails: guardrailsJSON,
      openai_api_key: provider === 'openai' ? apiKey : config?.openai_api_key,
      anthropic_api_key: provider === 'anthropic' ? apiKey : config?.anthropic_api_key,
      google_api_key: provider === 'google' ? apiKey : config?.google_api_key,
    }, {
      onSuccess: () => {
        toast.success('Configurações salvas com sucesso no banco de dados!');
      },
      onError: (err) => {
        toast.error(`Erro ao salvar: ${err.message}`);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-10 h-full">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" /> Configuração do Agente IA
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 ml-1 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10">
                  <Info className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" /> Manual Prático: Configurando seu Farmacêutico IA
                  </DialogTitle>
                  <DialogDescription className="text-sm mt-2">
                    Nesta tela de configurações, você define a "personalidade" e as regras de negócio do seu atendente virtual inteligente. Entenda como preencher cada campo abaixo:
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 mt-4 text-sm">
                  <div className="rounded-lg border bg-card p-4">
                    <h3 className="font-semibold text-base mb-2 flex items-center gap-2 text-primary">
                      <Brain className="w-4 h-4" /> 1. Aba LLM (O Cérebro)
                    </h3>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li><strong>Provedor e Modelo:</strong> Aqui você escolhe marca (ex: OpenAI) e versão da IA. Recomendamos o <strong>GPT-4o Mini</strong> por ser extremamente rápido e inteligente o suficiente para atendimentos de farmácia.</li>
                      <li><strong>Temperatura:</strong> É o nível de criatividade da IA. Valores baixos (0.2) deixam as respostas robóticas. Valores altos (1.0+) fazem a IA alucinar. Recomendamos manter em <strong>0.7</strong>, que traz um tom natural e amigável sem perder o foco.</li>
                      <li><strong>Max Tokens:</strong> O limite de tamanho das respostas. 500 costuma ser suficiente para não gerar blocos de texto gigantescos no WhatsApp do seu cliente.</li>
                      <li><strong>Chave de API:</strong> Necessário! É a "senha" fornecida pela IA (OpenAI, Anthropic ou Google) que permite nosso sistema a acessar o cérebro deles em seu nome. Crie sua conta na plataforma deles, gere a chave, e cole aqui.</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border bg-card p-4">
                    <h3 className="font-semibold text-base mb-2 flex items-center gap-2 text-primary">
                      <MessageSquare className="w-4 h-4" /> 2. Aba Prompt (O Manual de Conduta)
                    </h3>
                    <p className="text-muted-foreground">
                      O System Prompt é o "crachá" do seu bot. É aqui que você explica para a IA quem ela é. O texto padrão já é otimizado, mas você pode adicionar regras como o nome da sua loja e como ela deve saudar os clientes ("Olá, sou o Zé, seu assistente da Farmácia Central!").
                    </p>
                  </div>

                  <div className="rounded-lg border bg-card p-4">
                    <h3 className="font-semibold text-base mb-2 flex items-center gap-2 text-primary">
                      <Shield className="w-4 h-4" /> 3. Aba Guardrails (As Regras Invioláveis)
                    </h3>
                    <p className="text-muted-foreground mb-2">
                      São travas absolutas de segurança. A IA nunca desobedecerá isso:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li><strong>Validar receita e Idade:</strong> Bloqueia o robô de sugerir antibióticos sem atestar retenção de receita ou de vender tarja preta para pacientes bloqueados.</li>
                      <li><strong>Limite de Valor:</strong> Impede fechamento de compras acima do teto estipulado (ex: 5.000 reais) em um fluxo sem conferência humana para evitar fraudes.</li>
                      <li><strong>Palavras-chave de escalação:</strong> Caso o cliente escreva alguma delas (ex: "emergência", "humano"), o robô trava instantaneamente e apita vermelho na tela de Conversas para que um de seus atendentes assuma o volante.</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border bg-card p-4">
                    <h3 className="font-semibold text-base mb-2 flex items-center gap-2 text-primary">
                      <Sparkles className="w-4 h-4" /> 4. Aba Sugestões (O Vendedor de Balcão)
                    </h3>
                    <p className="text-muted-foreground">
                      Aumente automaticamente seu Ticket Médio. Deixando ativo, se o cliente pedir "Loratadina", o bot de forma muito natural e leve vai avaliar o carrinho e dizer: <em>"Aproveitando, não deseja levar também um soro fisiológico ou colírio que indicamos bem nessa época seca?"</em>
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Configure o comportamento do assistente virtual da sua farmácia</p>
        </div>
        <Button onClick={handleSave} disabled={isPending} className="gradient-primary border-0 gap-2">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
          {isPending ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      <Tabs defaultValue="llm" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="llm" className="text-xs gap-1"><Brain className="w-3.5 h-3.5" /> LLM</TabsTrigger>
          <TabsTrigger value="prompt" className="text-xs gap-1"><MessageSquare className="w-3.5 h-3.5" /> Prompt</TabsTrigger>
          <TabsTrigger value="guardrails" className="text-xs gap-1"><Shield className="w-3.5 h-3.5" /> Guardrails</TabsTrigger>
          <TabsTrigger value="suggestions" className="text-xs gap-1"><Sparkles className="w-3.5 h-3.5" /> Sugestões</TabsTrigger>
        </TabsList>

        {/* LLM Config */}
        <TabsContent value="llm">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Configuração do LLM</CardTitle>
              <CardDescription>Selecione o provedor e modelo de IA para o agente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Provedor</Label>
                  <Select value={provider} onValueChange={(v) => { setProvider(v); setModel(models[v].models[0].value); }}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(models).map(([key, val]) => (
                        <SelectItem key={key} value={key}>{val.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Modelo</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {models[provider].models.map((m) => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Temperatura: {temperature[0]}</Label>
                    <span className="text-xs text-muted-foreground">Mais preciso ← → Mais criativo</span>
                  </div>
                  <Slider value={temperature} onValueChange={setTemperature} min={0} max={2} step={0.1} className="[&_[role=slider]]:bg-primary" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Max Tokens: {maxTokens[0]}</Label>
                    <span className="text-xs text-muted-foreground">Tamanho máximo da resposta</span>
                  </div>
                  <Slider value={maxTokens} onValueChange={setMaxTokens} min={100} max={4000} step={50} className="[&_[role=slider]]:bg-primary" />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Chave de API ({models[provider].label})</Label>
                  <Button variant="ghost" size="sm" onClick={() => setShowApiKey(!showApiKey)} className="h-8 text-xs gap-1">
                    {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showApiKey ? 'Ocultar' : 'Mostrar'}
                  </Button>
                </div>
                <Input 
                  type={showApiKey ? 'text' : 'password'} 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..." 
                  className="h-11 bg-background/50 font-mono text-sm" 
                />
                <p className="text-[10px] text-muted-foreground mt-1">A chave é protegida no banco de dados e enviada criptografada da sua farmácia para a API escolhida.</p>
              </div>

              <div className="space-y-2">
                <Label>Tom de voz</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="professional">Profissional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="friendly">Amigável</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Prompt */}
        <TabsContent value="prompt">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">System Prompt</CardTitle>
              <CardDescription>Instruções base do agente de IA para atendimento</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="min-h-[400px] font-mono text-sm bg-background/50"
                placeholder="Insira as instruções do agente..."
              />
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Info className="w-3 h-3" /> {systemPrompt.length} caracteres
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guardrails */}
        <TabsContent value="guardrails">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Guardrails & Regras</CardTitle>
              <CardDescription>Limites e restrições de segurança do agente de IA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-transparent hover:border-border transition-colors">
                  <div><Label className="text-sm">Validar receita médica</Label><p className="text-xs text-muted-foreground mt-0.5">Avisar quando medicamento requer prescrição</p></div>
                  <Switch checked={validatePrescription} onCheckedChange={setValidatePrescription} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-transparent hover:border-border transition-colors">
                  <div><Label className="text-sm">Restrição de idade</Label><p className="text-xs text-muted-foreground mt-0.5">Verificar idade para medicamentos restritos</p></div>
                  <Switch checked={ageRestriction} onCheckedChange={setAgeRestriction} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-transparent hover:border-border transition-colors">
                  <div><Label className="text-sm">Escalar para humano</Label><p className="text-xs text-muted-foreground mt-0.5">Oferecer transferência urgente quando fora do escopo</p></div>
                  <Switch checked={escalateToHuman} onCheckedChange={setEscalateToHuman} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-transparent hover:border-border transition-colors">
                  <div><Label className="text-sm">Limite de valor por pedido (R$)</Label><p className="text-xs text-muted-foreground mt-0.5">Valor máximo financeiro permitido em um único fechamento</p></div>
                  <Input type="number" value={maxOrderValue} onChange={e => setMaxOrderValue(Number(e.target.value) || 0)} className="w-32 h-9 text-right" />
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Palavras-chave de escalação imediata</Label>
                <Textarea 
                  value={escalationKeywords}
                  onChange={(e) => setEscalationKeywords(e.target.value)}
                  placeholder='Uma por linha: "receita controlada", "emergência"...' 
                  className="min-h-[120px] font-mono text-sm bg-background/50 leading-relaxed" 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suggestions */}
        <TabsContent value="suggestions">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Sugestões Inteligentes</CardTitle>
              <CardDescription>Configure como a IA deve realizar ofertas e recomendações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div>
                  <Label className="text-sm font-semibold text-primary">Ativar motor de sugestões</Label>
                  <p className="text-xs text-primary/70 mt-0.5">A IA vai tentar vender proativamente usando as regras abaixo</p>
                </div>
                <Switch checked={enableSuggestions} onCheckedChange={setEnableSuggestions} />
              </div>
              
              {enableSuggestions && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { type: 'Upsell', desc: 'Sugerir caixas maiores ou marcas', active: true },
                      { type: 'Complementar', desc: 'Ex: Soro com Descongestionante', active: true },
                      { type: 'Alternativa Genérica', desc: 'Sugerir genérico mais barato', active: false },
                      { type: 'Desconto Progressivo', desc: 'Ofertas por quantidade', active: true },
                    ].map((s) => (
                      <div key={s.type} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                        <div>
                          <p className="text-sm font-medium">{s.type}</p>
                          <p className="text-xs text-muted-foreground">{s.desc}</p>
                        </div>
                        <Switch defaultChecked={s.active} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIConfig;
