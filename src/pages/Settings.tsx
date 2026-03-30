import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Settings as SettingsIcon, Building2, Users, MessageCircle, Crown, Save, Plus, Trash2, Shield, Key } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const demoMembers = [
  { id: '1', email: 'admin@farmacia.com', role: 'admin', active: true, joined: '2026-01-15' },
  { id: '2', email: 'gerente@farmacia.com', role: 'manager', active: true, joined: '2026-02-10' },
  { id: '3', email: 'operador@farmacia.com', role: 'operator', active: true, joined: '2026-03-01' },
  { id: '4', email: 'atendente@farmacia.com', role: 'operator', active: false, joined: '2026-02-20' },
];

const roleLabels: Record<string, string> = { admin: 'Administrador', manager: 'Gerente', operator: 'Operador' };
const roleColors: Record<string, string> = { admin: 'bg-violet-500/10 text-violet-600', manager: 'bg-blue-500/10 text-blue-600', operator: 'bg-emerald-500/10 text-emerald-600' };

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-primary" /> Configurações
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Gerencie os dados da farmácia, equipe e integrações</p>
      </div>

      <Tabs defaultValue="pharmacy" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pharmacy" className="text-xs gap-1"><Building2 className="w-3.5 h-3.5" /> Farmácia</TabsTrigger>
          <TabsTrigger value="team" className="text-xs gap-1"><Users className="w-3.5 h-3.5" /> Equipe</TabsTrigger>
          <TabsTrigger value="whatsapp" className="text-xs gap-1"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</TabsTrigger>
          <TabsTrigger value="plan" className="text-xs gap-1"><Crown className="w-3.5 h-3.5" /> Plano</TabsTrigger>
        </TabsList>

        {/* Pharmacy Info */}
        <TabsContent value="pharmacy">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Dados da Farmácia</CardTitle>
              <CardDescription>Informações usadas no atendimento e pedidos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nome</Label><Input defaultValue="Farmácia Saúde & Vida" className="h-11" /></div>
                <div className="space-y-2"><Label>CNPJ</Label><Input defaultValue="12.345.678/0001-90" className="h-11" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>E-mail</Label><Input defaultValue="contato@farmaciasaude.com" className="h-11" /></div>
                <div className="space-y-2"><Label>Telefone</Label><Input defaultValue="(11) 3456-7890" className="h-11" /></div>
              </div>
              <div className="space-y-2"><Label>Endereço</Label><Textarea defaultValue="Rua das Flores, 123 - Centro, São Paulo/SP - 01234-567" className="min-h-[60px]" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Cidade</Label><Input defaultValue="São Paulo" className="h-11" /></div>
                <div className="space-y-2"><Label>UF</Label><Input defaultValue="SP" className="h-11" maxLength={2} /></div>
                <div className="space-y-2"><Label>CEP</Label><Input defaultValue="01234-567" className="h-11" /></div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Horário de Funcionamento</Label><Input defaultValue="Seg-Sáb: 8h-22h, Dom: 9h-18h" className="h-11" /></div>
                <div className="space-y-2"><Label>Raio de Entrega</Label><Input defaultValue="10 km" className="h-11" /></div>
              </div>
              <Button onClick={() => toast.success('Dados atualizados!')} className="gradient-primary border-0 gap-2"><Save className="w-4 h-4" /> Salvar</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team */}
        <TabsContent value="team">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle className="text-base">Equipe</CardTitle><CardDescription>Gerencie os membros da sua farmácia</CardDescription></div>
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
                    <TableHead className="text-xs w-10"></TableHead>
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
                      <TableCell>
                        <Badge variant="secondary" className={`text-[10px] ${m.active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-gray-500/10 text-gray-500'}`}>
                          {m.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WhatsApp */}
        <TabsContent value="whatsapp">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">WhatsApp Business</CardTitle>
              <CardDescription>Configure a integração com WhatsApp Business API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Business Account ID</Label><Input placeholder="Seu WhatsApp Business Account ID" className="h-11 font-mono text-sm" /></div>
              <div className="space-y-2"><Label>Token de acesso</Label><Input type="password" placeholder="Bearer token do WhatsApp" className="h-11 font-mono text-sm" /></div>
              <div className="space-y-2"><Label>Phone Number ID</Label><Input placeholder="ID do número de telefone" className="h-11 font-mono text-sm" /></div>
              <div className="space-y-2"><Label>Webhook Verify Token</Label><Input placeholder="Token de verificação do webhook" className="h-11 font-mono text-sm" /></div>
              <Separator />
              <div className="space-y-2">
                <Label>Credenciais n8n</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="URL base do n8n" className="h-11 font-mono text-sm" />
                  <Input placeholder="Webhook URL do n8n" className="h-11 font-mono text-sm" />
                </div>
              </div>
              <Button onClick={() => toast.success('Configurações salvas!')} className="gradient-primary border-0 gap-2"><Save className="w-4 h-4" /> Salvar</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plan */}
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
