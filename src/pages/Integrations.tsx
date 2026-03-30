import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Puzzle, Plus, CheckCircle, XCircle, RefreshCw, Trash2, ExternalLink, Zap, Database, Globe } from 'lucide-react';
import { toast } from 'sonner';

const demoIntegrations = [
  { id: '1', name: 'Sistema Farmácia - REST API', type: 'rest', base_url: 'https://api.farmacia.com/v1', auth_type: 'bearer_token', is_active: true, last_test_status: 'success', last_tested_at: '2026-03-29T10:00:00' },
  { id: '2', name: 'ERP Legado - SOAP', type: 'soap', base_url: 'https://erp.farmacia.com/soap', auth_type: 'basic_auth', is_active: true, last_test_status: 'failed', last_tested_at: '2026-03-28T14:00:00' },
  { id: '3', name: 'Base Medicamentos - GraphQL', type: 'graphql', base_url: 'https://meds.api.com/graphql', auth_type: 'api_key', is_active: false, last_test_status: 'success', last_tested_at: '2026-03-25T09:00:00' },
  { id: '4', name: 'Fornecedor Distribuidora', type: 'rest', base_url: 'https://distribuidor.com/api', auth_type: 'oauth2', is_active: true, last_test_status: 'success', last_tested_at: '2026-03-30T08:00:00' },
];

const typeIcons: Record<string, React.ReactNode> = {
  rest: <Globe className="w-5 h-5" />,
  soap: <Zap className="w-5 h-5" />,
  graphql: <Database className="w-5 h-5" />,
  database: <Database className="w-5 h-5" />,
  custom: <Puzzle className="w-5 h-5" />,
};

const typeColors: Record<string, string> = {
  rest: 'from-blue-500 to-indigo-600',
  soap: 'from-violet-500 to-purple-600',
  graphql: 'from-pink-500 to-rose-600',
  database: 'from-emerald-500 to-teal-600',
  custom: 'from-amber-500 to-orange-600',
};

const Integrations = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('rest');
  const [newUrl, setNewUrl] = useState('');
  const [newAuth, setNewAuth] = useState('bearer_token');

  const handleTest = (name: string) => {
    toast.info(`Testando conexão com ${name}...`);
    setTimeout(() => toast.success(`Conexão com ${name} bem-sucedida!`), 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Puzzle className="w-5 h-5 text-primary" /> Integrações
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Configure as conexões com sistemas externos da farmácia</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 gap-2"><Plus className="w-4 h-4" /> Nova Integração</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Integração</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2"><Label>Nome</Label><Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex: API do Sistema de Estoque" className="h-11" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={newType} onValueChange={setNewType}><SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rest">REST API</SelectItem>
                      <SelectItem value="soap">SOAP</SelectItem>
                      <SelectItem value="graphql">GraphQL</SelectItem>
                      <SelectItem value="database">Banco de dados</SelectItem>
                      <SelectItem value="custom">Customizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Autenticação</Label>
                  <Select value={newAuth} onValueChange={setNewAuth}><SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bearer_token">Bearer Token</SelectItem>
                      <SelectItem value="basic_auth">Basic Auth</SelectItem>
                      <SelectItem value="api_key">API Key</SelectItem>
                      <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                      <SelectItem value="none">Nenhuma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label>URL Base</Label><Input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://api.exemplo.com/v1" className="h-11 font-mono text-sm" /></div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => toast.info('Testando conexão...')}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Testar
                </Button>
                <Button className="flex-1 gradient-primary border-0" onClick={() => { setShowDialog(false); toast.success('Integração salva!'); }}>
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {demoIntegrations.map((integration) => (
          <Card key={integration.id} className="border-0 shadow-md hover:shadow-lg transition-all group">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${typeColors[integration.type]} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  {typeIcons[integration.type]}
                  <span className="sr-only">{integration.type}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm truncate">{integration.name}</h3>
                    <Switch checked={integration.is_active} />
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate">{integration.base_url}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="outline" className="text-[10px] uppercase">{integration.type}</Badge>
                    <Badge variant="outline" className="text-[10px]">{integration.auth_type.replace('_', ' ')}</Badge>
                    {integration.last_test_status === 'success' ? (
                      <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 gap-0.5">
                        <CheckCircle className="w-3 h-3" /> OK
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] bg-red-500/10 text-red-600 gap-0.5">
                        <XCircle className="w-3 h-3" /> Falha
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => handleTest(integration.name)}>
                      <RefreshCw className="w-3 h-3" /> Testar
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-destructive hover:text-destructive">
                      <Trash2 className="w-3 h-3" /> Remover
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info section */}
      <Card className="border-0 shadow-md bg-primary/5 border border-primary/10">
        <CardContent className="p-5 flex items-start gap-3">
          <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Sistema Agnóstico</p>
            <p className="text-xs text-muted-foreground mt-1">
              O RxFlow se conecta a qualquer sistema de farmácia via REST, SOAP, GraphQL ou acesso direto ao banco. 
              Configure os endpoints e mapeamento de campos para cada integração.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Integrations;
