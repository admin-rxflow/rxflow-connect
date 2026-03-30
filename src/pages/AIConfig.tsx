import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Brain, Shield, MessageSquare, Sparkles, Save, Eye, EyeOff, Info } from 'lucide-react';
import { toast } from 'sonner';

const AIConfig = () => {
  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState('gpt-4o');
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([500]);
  const [tone, setTone] = useState('professional');
  const [enableSuggestions, setEnableSuggestions] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(
    `Você é um assistente de atendimento ao cliente de uma farmácia.\nSua responsabilidade é:\n- Responder dúvidas sobre medicamentos com precisão\n- Consultar disponibilidade e preços\n- Auxiliar na compra e agendamento de entrega\n- Ser cordial e profissional\n\nGUARDRAILS:\n- Nunca recomende medicamentos sem consultar o sistema\n- Não forneça diagnósticos médicos\n- Se medicamento requer receita, avise ao cliente\n- Se cliente solicitar algo fora de seu escopo, escale para humano\n\nResponda sempre em português, de forma clara e concisa.`
  );

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

  const handleSave = () => {
    toast.success('Configurações salvas com sucesso!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" /> Configuração do Agente IA
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Configure o comportamento do assistente virtual da sua farmácia</p>
        </div>
        <Button onClick={handleSave} className="gradient-primary border-0 gap-2">
          <Save className="w-4 h-4" /> Salvar
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
                <Input type={showApiKey ? 'text' : 'password'} placeholder="sk-..." className="h-11 bg-background/50 font-mono text-sm" />
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
              <CardDescription>Limites e restrições do agente de IA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div><Label className="text-sm">Validar receita médica</Label><p className="text-xs text-muted-foreground mt-0.5">Avisar quando medicamento requer receita</p></div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div><Label className="text-sm">Restrição de idade</Label><p className="text-xs text-muted-foreground mt-0.5">Verificar idade para medicamentos restritos</p></div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div><Label className="text-sm">Escalar para humano</Label><p className="text-xs text-muted-foreground mt-0.5">Oferecer transferência quando fora do escopo</p></div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div><Label className="text-sm">Limite de valor por pedido</Label><p className="text-xs text-muted-foreground mt-0.5">Valor máximo permitido em um único pedido</p></div>
                  <Input type="number" defaultValue={5000} className="w-32 h-9 text-right" />
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Palavras-chave de escalação</Label>
                <Textarea placeholder='Uma por linha: "receita controlada", "emergência"...' defaultValue="receita controlada&#10;emergência&#10;alergia grave&#10;efeito colateral&#10;falar com atendente" className="min-h-[120px] font-mono text-sm bg-background/50" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suggestions */}
        <TabsContent value="suggestions">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Sugestões Inteligentes</CardTitle>
              <CardDescription>Configure as sugestões de produtos que a IA pode fazer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div><Label className="text-sm">Ativar sugestões</Label><p className="text-xs text-muted-foreground mt-0.5">A IA sugere produtos complementares durante o atendimento</p></div>
                <Switch checked={enableSuggestions} onCheckedChange={setEnableSuggestions} />
              </div>
              {enableSuggestions && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { type: 'Upsell', desc: 'Sugerir versão superior', active: true },
                      { type: 'Complementar', desc: 'Produtos comprados juntos', active: true },
                      { type: 'Alternativa', desc: 'Opções semelhantes', active: false },
                      { type: 'Desconto', desc: 'Ofertas por quantidade', active: true },
                    ].map((s) => (
                      <div key={s.type} className="flex items-center justify-between p-3 rounded-lg border">
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
