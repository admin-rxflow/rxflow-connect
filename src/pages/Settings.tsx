import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Settings as SettingsIcon, Building2, Users, MessageCircle, Crown,
  Save, Plus, Trash2, Shield, RefreshCw, Copy, CheckCircle,
  XCircle, Truck, Phone, Eye, EyeOff, ExternalLink, Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTenantSettings, useUpdateTenantSettings } from '@/hooks/useTenantSettings';
import { useDeliveryAgents, useCreateDeliveryAgent, useDeleteDeliveryAgent, useToggleDeliveryAgent } from '@/hooks/useDeliveryAgents';
import { toast } from 'sonner';

const demoMembers = [
  { id: '1', email: 'admin@farmacia.com', role: 'admin', active: true, joined: '2026-01-15' },
  { id: '2', email: 'gerente@farmacia.com', role: 'manager', active: true, joined: '2026-02-10' },
  { id: '3', email: 'operador@farmacia.com', role: 'operator', active: true, joined: '2026-03-01' },
];

const roleLabels: Record<string, string> = { admin: 'Administrador', manager: 'Gerente', operator: 'Operador' };
const roleColors: Record<string, string> = {
  admin: 'bg-blue-500/10 text-blue-600',
  manager: 'bg-emerald-500/10 text-emerald-600',
  operator: 'bg-amber-500/10 text-amber-600',
};

const Settings = () => {
  const { user, tenantId } = useAuth();
  const { data: settings, isLoading } = useTenantSettings(tenantId);
  const updateSettings = useUpdateTenantSettings();
  const { data: deliveryAgents = [], isLoading: agentsLoading } = useDeliveryAgents(tenantId);
  const createAgent = useCreateDeliveryAgent();
  const deleteAgent = useDeleteDeliveryAgent();
  const toggleAgent = useToggleDeliveryAgent();

  // WhatsApp / Evolution API form state
  const [evoUrl, setEvoUrl] = useState('');
  const [evoKey, setEvoKey] = useState('');
  const [evoInstance, setEvoInstance] = useState('');
  const [n8nUrl, setN8nUrl] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connected' | 'failed'>('idle');

  // Delivery agent dialog state
  const [agentDialog, setAgentDialog] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [agentPhone, setAgentPhone] = useState('');

  // Pharmacy form state
  const [pharmacyName, setPharmacyName] = useState('');
  const [pharmacyPhone, setPharmacyPhone] = useState('');
  const [pharmacyAddress, setPharmacyAddress] = useState('');
  const [pharmacyCity, setPharmacyCity] = useState('');
  const [pharmacyState, setPharmacyState] = useState('');
  const [pharmacyPostal, setPharmacyPostal] = useState('');

  useEffect(() => {
    if (settings) {
      setEvoUrl(settings.evolution_api_url ?? '');
      setEvoKey(settings.evolution_api_key ?? '');
      setEvoInstance(settings.evolution_instance ?? '');
      setN8nUrl(settings.n8n_webhook_url ?? '');
      setPharmacyName(settings.name ?? '');
      setPharmacyPhone(settings.phone ?? '');
      setPharmacyAddress(settings.address ?? '');
      setPharmacyCity(settings.city ?? '');
      setPharmacyState(settings.state ?? '');
      setPharmacyPostal(settings.postal_code ?? '');
    }
  }, [settings]);

  const webhookUrl = evoInstance
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/evolution-webhook`
    : '';

  const handleSaveWhatsApp = async () => {
    if (!tenantId) return;
    try {
      await updateSettings.mutateAsync({
        tenantId,
        data: {
          evolution_api_url: evoUrl || null,
          evolution_api_key: evoKey || null,
          evolution_instance: evoInstance || null,
          n8n_webhook_url: n8nUrl || null,
        },
      });
      toast.success('Configurações do WhatsApp salvas!');
    } catch {
      toast.error('Erro ao salvar configurações.');
    }
  };

  const handleSavePharmacy = async () => {
    if (!tenantId) return;
    try {
      await updateSettings.mutateAsync({
        tenantId,
        data: {
          name: pharmacyName,
          phone: pharmacyPhone,
          address: pharmacyAddress,
          city: pharmacyCity,
          state: pharmacyState,
          postal_code: pharmacyPostal,
        },
      });
      toast.success('Dados da farmácia atualizados!');
    } catch {
      toast.error('Erro ao salvar dados.');
    }
  };

  const handleTestConnection = async () => {
    if (!evoUrl || !evoInstance) {
      toast.error('Preencha a URL da API e o nome da instância primeiro.');
      return;
    }
    setTestingConnection(true);
    setConnectionStatus('idle');
    try {
      const res = await fetch(`${evoUrl}/instance/connectionState/${evoInstance}`, {
        headers: { apikey: evoKey },
      });
      if (res.ok) {
        setConnectionStatus('connected');
        toast.success('Conexão com Evolution API bem-sucedida!');
      } else {
        setConnectionStatus('failed');
        toast.error(`Falha na conexão: HTTP ${res.status}`);
      }
    } catch {
      setConnectionStatus('failed');
      toast.error('Não foi possível conectar. Verifique a URL e a chave.');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleCopyWebhook = () => {
    if (webhookUrl) {
      navigator.clipboard.writeText(webhookUrl);
      toast.success('URL copiada!');
    }
  };

  const handleCreateAgent = async () => {
    if (!tenantId || !agentName || !agentPhone) {
      toast.error('Preencha nome e telefone do entregador.');
      return;
    }
    try {
      await createAgent.mutateAsync({ tenant_id: tenantId, name: agentName, phone: agentPhone });
      toast.success('Entregador cadastrado!');
      setAgentName('');
      setAgentPhone('');
      setAgentDialog(false);
    } catch {
      toast.error('Erro ao cadastrar entregador.');
    }
  };

  const handleDeleteAgent = async (id: string) => {
    if (!tenantId) return;
    try {
      await deleteAgent.mutateAsync({ id, tenantId });
      toast.success('Entregador removido.');
    } catch {
      toast.error('Erro ao remover entregador.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-primary" /> Configurações
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Gerencie os dados da farmácia, equipe e integrações</p>
      </div>

      <Tabs defaultValue="pharmacy" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pharmacy" className="text-xs gap-1"><Building2 className="w-3.5 h-3.5" /> Farmácia</TabsTrigger>
          <TabsTrigger value="team" className="text-xs gap-1"><Users className="w-3.5 h-3.5" /> Equipe</TabsTrigger>
          <TabsTrigger value="whatsapp" className="text-xs gap-1"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</TabsTrigger>
          <TabsTrigger value="delivery" className="text-xs gap-1"><Truck className="w-3.5 h-3.5" /> Entregadores</TabsTrigger>
          <TabsTrigger value="plan" className="text-xs gap-1"><Crown className="w-3.5 h-3.5" /> Plano</TabsTrigger>
        </TabsList>

        {/* ── Farmácia ── */}
        <TabsContent value="pharmacy">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Dados da Farmácia</CardTitle>
              <CardDescription>Informações usadas no atendimento e pedidos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">Carregando...</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Nome</Label><Input value={pharmacyName} onChange={(e) => setPharmacyName(e.target.value)} className="h-11" /></div>
                    <div className="space-y-2"><Label>Telefone</Label><Input value={pharmacyPhone} onChange={(e) => setPharmacyPhone(e.target.value)} className="h-11" /></div>
                  </div>
                  <div className="space-y-2"><Label>Endereço</Label><Textarea value={pharmacyAddress} onChange={(e) => setPharmacyAddress(e.target.value)} className="min-h-[60px]" /></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2"><Label>Cidade</Label><Input value={pharmacyCity} onChange={(e) => setPharmacyCity(e.target.value)} className="h-11" /></div>
                    <div className="space-y-2"><Label>UF</Label><Input value={pharmacyState} onChange={(e) => setPharmacyState(e.target.value)} className="h-11" maxLength={2} /></div>
                    <div className="space-y-2"><Label>CEP</Label><Input value={pharmacyPostal} onChange={(e) => setPharmacyPostal(e.target.value)} className="h-11" /></div>
                  </div>
                  <Button onClick={handleSavePharmacy} disabled={updateSettings.isPending} className="gradient-primary border-0 gap-2">
                    <Save className="w-4 h-4" /> {updateSettings.isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Equipe ── */}
        <TabsContent value="team">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle className="text-base">Equipe</CardTitle><CardDescription>Membros com acesso ao dashboard</CardDescription></div>
                <Button className="gradient-primary border-0 gap-2 text-sm"><Plus className="w-4 h-4" /> Convidar</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Membro</TableHead>
                    <TableHead className="text-xs">Papel</TableHead>
                    <TableHead className="text-xs">Desde</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demoMembers.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8"><AvatarFallback className="text-xs gradient-primary text-white">{m.email.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                          <span className="text-sm">{m.email}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary" className={`text-[10px] ${roleColors[m.role]}`}>{roleLabels[m.role]}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{m.joined}</TableCell>
                      <TableCell><Badge variant="secondary" className={`text-[10px] ${m.active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-gray-500/10 text-gray-500'}`}>{m.active ? 'Ativo' : 'Inativo'}</Badge></TableCell>
                      <TableCell><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── WhatsApp / Evolution API ── */}
        <TabsContent value="whatsapp">
          <div className="space-y-4">
            {/* Status badge */}
            {connectionStatus !== 'idle' && (
              <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium ${connectionStatus === 'connected' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-red-500/10 text-red-700'}`}>
                {connectionStatus === 'connected' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {connectionStatus === 'connected' ? 'Instância conectada ao WhatsApp' : 'Falha na conexão — verifique os dados'}
              </div>
            )}

            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10"><Zap className="w-4 h-4 text-emerald-600" /></div>
                  <div>
                    <CardTitle className="text-base">Evolution API</CardTitle>
                    <CardDescription>Configure o gateway de WhatsApp</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">Carregando...</div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>URL Base da API</Label>
                      <Input
                        value={evoUrl}
                        onChange={(e) => setEvoUrl(e.target.value)}
                        placeholder="https://sua-evolution-api.com"
                        className="h-11 font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <div className="relative">
                        <Input
                          value={evoKey}
                          onChange={(e) => setEvoKey(e.target.value)}
                          type={showKey ? 'text' : 'password'}
                          placeholder="Sua API Key da Evolution"
                          className="h-11 font-mono text-sm pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKey((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Nome da Instância</Label>
                      <Input
                        value={evoInstance}
                        onChange={(e) => setEvoInstance(e.target.value)}
                        placeholder="ex: farmacia-saude-vida"
                        className="h-11 font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">Nome exato da instância criada na Evolution API</p>
                    </div>

                    <Separator />

                    {/* Webhook URL gerado */}
                    <div className="space-y-2">
                      <Label>URL do Webhook (configurar na Evolution API)</Label>
                      <div className="flex gap-2">
                        <Input
                          value={webhookUrl || 'Preencha a URL da API acima para gerar'}
                          readOnly
                          className="h-11 font-mono text-xs bg-muted text-muted-foreground"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-11 w-11 flex-shrink-0"
                          onClick={handleCopyWebhook}
                          disabled={!webhookUrl}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Configure este webhook na Evolution API com o evento <code className="bg-muted px-1 rounded">messages.upsert</code>
                      </p>
                    </div>

                    <Separator />

                    {/* n8n */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5" /> n8n Webhook URL
                      </Label>
                      <Input
                        value={n8nUrl}
                        onChange={(e) => setN8nUrl(e.target.value)}
                        placeholder="https://seu-n8n.com/webhook/..."
                        className="h-11 font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">URL do webhook do workflow do agente IA no n8n</p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={handleTestConnection}
                        disabled={testingConnection}
                        className="gap-2"
                      >
                        <RefreshCw className={`w-4 h-4 ${testingConnection ? 'animate-spin' : ''}`} />
                        {testingConnection ? 'Testando...' : 'Testar Conexão'}
                      </Button>
                      <Button
                        onClick={handleSaveWhatsApp}
                        disabled={updateSettings.isPending}
                        className="gradient-primary border-0 gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {updateSettings.isPending ? 'Salvando...' : 'Salvar'}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Entregadores ── */}
        <TabsContent value="delivery">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2"><Truck className="w-4 h-4" /> Entregadores</CardTitle>
                  <CardDescription>Entregadores que o agente IA pode acionar automaticamente</CardDescription>
                </div>
                <Dialog open={agentDialog} onOpenChange={setAgentDialog}>
                  <DialogTrigger asChild>
                    <Button className="gradient-primary border-0 gap-2 text-sm"><Plus className="w-4 h-4" /> Adicionar</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Novo Entregador</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input value={agentName} onChange={(e) => setAgentName(e.target.value)} placeholder="Nome completo" className="h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label>WhatsApp</Label>
                        <Input value={agentPhone} onChange={(e) => setAgentPhone(e.target.value)} placeholder="5511999999999" className="h-11 font-mono" />
                        <p className="text-xs text-muted-foreground">Número com DDI e DDD, sem espaços ou traços</p>
                      </div>
                      <Button
                        className="w-full gradient-primary border-0"
                        onClick={handleCreateAgent}
                        disabled={createAgent.isPending}
                      >
                        {createAgent.isPending ? 'Cadastrando...' : 'Cadastrar Entregador'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {agentsLoading ? (
                <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">Carregando...</div>
              ) : deliveryAgents.length === 0 ? (
                <div className="h-24 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Truck className="w-8 h-8 opacity-30" />
                  <p className="text-sm">Nenhum entregador cadastrado</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Nome</TableHead>
                      <TableHead className="text-xs">WhatsApp</TableHead>
                      <TableHead className="text-xs">Ativo</TableHead>
                      <TableHead className="text-xs w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveryAgents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                              {agent.name.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium">{agent.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Phone className="w-3.5 h-3.5" /> {agent.phone}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={agent.is_active}
                            onCheckedChange={(checked) =>
                              toggleAgent.mutate({ id: agent.id, tenantId: agent.tenant_id, is_active: checked })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteAgent(agent.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Plano ── */}
        <TabsContent value="plan">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Básico', price: 'R$ 99', convs: '1.000', features: ['10 conversas simultâneas', 'Dashboard básico', 'Relatórios simples'], active: false },
              { name: 'Profissional', price: 'R$ 249', convs: '5.000', features: ['25 conversas simultâneas', 'Dashboard completo', 'Relatórios avançados', 'Knowledge Base', 'Sugestões IA'], active: true },
              { name: 'Enterprise', price: 'R$ 499', convs: 'Ilimitado', features: ['Conversas ilimitadas', 'Tudo do Profissional', 'Suporte prioritário', 'API dedicada', 'SLA garantido'], active: false },
            ].map((plan) => (
              <Card key={plan.name} className={`border-0 shadow-md relative overflow-hidden ${plan.active ? 'ring-2 ring-primary' : ''}`}>
                {plan.active && <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />}
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    {plan.active && <Badge className="mb-2 gradient-primary border-0 text-[10px]">Plano atual</Badge>}
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                    <p className="text-3xl font-bold mt-2">{plan.price}<span className="text-sm text-muted-foreground font-normal">/mês</span></p>
                    <p className="text-xs text-muted-foreground mt-1">{plan.convs} conversas/mês</p>
                  </div>
                  <Separator className="my-4" />
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm"><Shield className="w-3.5 h-3.5 text-primary flex-shrink-0" />{f}</li>
                    ))}
                  </ul>
                  {!plan.active && <Button variant="outline" className="w-full mt-4">Mudar para {plan.name}</Button>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
