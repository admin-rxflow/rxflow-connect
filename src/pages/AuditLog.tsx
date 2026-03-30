import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Search, Filter, Eye, User, Clock, Shield, AlertTriangle } from 'lucide-react';

const demoAuditLogs = Array.from({ length: 30 }, (_, i) => ({
  id: `audit_${i}`,
  action: ['order_status_change', 'login', 'inventory_update', 'config_change', 'user_created', 'integration_test', 'ai_config_update', 'export_report'][i % 8],
  resource_type: ['order', 'auth', 'inventory', 'config', 'user', 'integration', 'ai_config', 'report'][i % 8],
  resource_id: `res_${Math.floor(Math.random() * 1000)}`,
  actor_email: ['admin@farmacia.com', 'gerente@farmacia.com', 'operador@farmacia.com'][i % 3],
  status: i % 10 === 0 ? 'failed' : 'success',
  old_values: i % 2 === 0 ? { status: 'pending' } : null,
  new_values: i % 2 === 0 ? { status: 'confirmed' } : null,
  created_at: new Date(Date.now() - i * 3600000 * 3).toISOString(),
  ip_address: '192.168.1.' + (i + 1),
}));

const actionLabels: Record<string, string> = {
  order_status_change: 'Status do pedido alterado',
  login: 'Login realizado',
  inventory_update: 'Estoque atualizado',
  config_change: 'Configuração alterada',
  user_created: 'Usuário criado',
  integration_test: 'Integração testada',
  ai_config_update: 'Config IA atualizada',
  export_report: 'Relatório exportado',
};

const actionColors: Record<string, string> = {
  order_status_change: 'bg-blue-500/10 text-blue-600',
  login: 'bg-emerald-500/10 text-emerald-600',
  inventory_update: 'bg-amber-500/10 text-amber-600',
  config_change: 'bg-violet-500/10 text-violet-600',
  user_created: 'bg-green-500/10 text-green-600',
  integration_test: 'bg-indigo-500/10 text-indigo-600',
  ai_config_update: 'bg-pink-500/10 text-pink-600',
  export_report: 'bg-slate-500/10 text-slate-600',
};

const AuditLog = () => {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<typeof demoAuditLogs[0] | null>(null);

  const filtered = demoAuditLogs.filter((log) => {
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    if (search && !log.actor_email.includes(search) && !log.action.includes(search)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" /> Log de Auditoria
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Histórico de todas as ações realizadas no sistema</p>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por email ou ação..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="h-9 w-48 text-xs"><Filter className="w-3 h-3 mr-1" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                <SelectItem value="order_status_change">Pedidos</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="inventory_update">Estoque</SelectItem>
                <SelectItem value="config_change">Configuração</SelectItem>
                <SelectItem value="user_created">Usuários</SelectItem>
                <SelectItem value="integration_test">Integrações</SelectItem>
                <SelectItem value="ai_config_update">Config IA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Ação</TableHead>
                <TableHead className="text-xs">Usuário</TableHead>
                <TableHead className="text-xs">Recurso</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Data/Hora</TableHead>
                <TableHead className="text-xs">IP</TableHead>
                <TableHead className="text-xs w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log) => (
                <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedLog(log)}>
                  <TableCell>
                    <Badge variant="secondary" className={`text-[10px] ${actionColors[log.action] || 'bg-gray-500/10 text-gray-600'}`}>
                      {actionLabels[log.action] || log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm">{log.actor_email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground font-mono">{log.resource_type}/{log.resource_id}</span>
                  </TableCell>
                  <TableCell>
                    {log.status === 'success' ? (
                      <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600">
                        <Shield className="w-3 h-3 mr-0.5" /> OK
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] bg-red-500/10 text-red-600">
                        <AlertTriangle className="w-3 h-3 mr-0.5" /> Falha
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(log.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">{log.ip_address}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="w-3.5 h-3.5" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detalhes da Auditoria</DialogTitle></DialogHeader>
          {selectedLog && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground">Ação</p><p className="font-medium">{actionLabels[selectedLog.action]}</p></div>
                <div><p className="text-xs text-muted-foreground">Usuário</p><p className="font-medium">{selectedLog.actor_email}</p></div>
                <div><p className="text-xs text-muted-foreground">Recurso</p><p className="font-mono text-xs">{selectedLog.resource_type}/{selectedLog.resource_id}</p></div>
                <div><p className="text-xs text-muted-foreground">IP</p><p className="font-mono text-xs">{selectedLog.ip_address}</p></div>
              </div>
              {selectedLog.old_values && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Valores Anteriores</p>
                  <pre className="bg-muted/50 rounded-lg p-3 text-xs font-mono overflow-auto">{JSON.stringify(selectedLog.old_values, null, 2)}</pre>
                </div>
              )}
              {selectedLog.new_values && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Novos Valores</p>
                  <pre className="bg-primary/5 rounded-lg p-3 text-xs font-mono overflow-auto">{JSON.stringify(selectedLog.new_values, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditLog;
