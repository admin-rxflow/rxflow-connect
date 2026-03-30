import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Search, Filter, Eye, CheckCircle, XCircle, Truck, Package, DollarSign } from 'lucide-react';

const demoOrders = Array.from({ length: 15 }, (_, i) => ({
  id: `ord_${i}`,
  order_number: `RX-${String(100000 + i).slice(1)}`,
  customer_name: ['Maria Silva', 'João Santos', 'Ana Oliveira', 'Carlos Lima', 'Beatriz Souza'][i % 5],
  customer_phone: `(11) 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
  status: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'][i % 6] as string,
  payment_status: ['pending', 'completed', 'completed', 'completed', 'completed', 'failed'][i % 6] as string,
  items: [
    { name: 'Dipirona 500mg', quantity: 2, price: 8.90, subtotal: 17.80 },
    { name: 'Paracetamol 750mg', quantity: 1, price: 6.50, subtotal: 6.50 },
  ],
  total_value: 24.30 + i * 12,
  final_value: 29.30 + i * 12,
  shipping_cost: 5.00,
  created_at: new Date(Date.now() - i * 86400000).toISOString(),
  delivery_address: 'Rua das Flores, 123 - São Paulo/SP',
  scheduled_delivery_date: new Date(Date.now() + (3 - i) * 86400000).toISOString().split('T')[0],
  payment_method: ['PIX', 'Cartão de Crédito', 'Boleto'][i % 3],
}));

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pendente', color: 'bg-amber-500/10 text-amber-600', icon: <Package className="w-3 h-3" /> },
  confirmed: { label: 'Confirmado', color: 'bg-blue-500/10 text-blue-600', icon: <CheckCircle className="w-3 h-3" /> },
  processing: { label: 'Processando', color: 'bg-indigo-500/10 text-indigo-600', icon: <Package className="w-3 h-3" /> },
  shipped: { label: 'Enviado', color: 'bg-violet-500/10 text-violet-600', icon: <Truck className="w-3 h-3" /> },
  delivered: { label: 'Entregue', color: 'bg-emerald-500/10 text-emerald-600', icon: <CheckCircle className="w-3 h-3" /> },
  cancelled: { label: 'Cancelado', color: 'bg-red-500/10 text-red-600', icon: <XCircle className="w-3 h-3" /> },
};

const paymentColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600',
  completed: 'bg-emerald-500/10 text-emerald-600',
  failed: 'bg-red-500/10 text-red-600',
};

const Orders = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<typeof demoOrders[0] | null>(null);

  const filtered = demoOrders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (search && !o.customer_name.toLowerCase().includes(search.toLowerCase()) && !o.order_number.includes(search)) return false;
    return true;
  });

  const kpis = [
    { title: 'Total Pedidos', value: demoOrders.length, icon: ShoppingCart, color: 'from-blue-500 to-indigo-600' },
    { title: 'Receita', value: `R$ ${demoOrders.reduce((a, o) => a + o.final_value, 0).toFixed(2)}`, icon: DollarSign, color: 'from-emerald-500 to-teal-600' },
    { title: 'Pendentes', value: demoOrders.filter((o) => o.status === 'pending').length, icon: Package, color: 'from-amber-500 to-orange-600' },
    { title: 'Entregues', value: demoOrders.filter((o) => o.status === 'delivered').length, icon: CheckCircle, color: 'from-green-500 to-emerald-600' },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="border-0 shadow-md">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${kpi.color}`}>
                <kpi.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{kpi.title}</p>
                <p className="text-xl font-bold">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orders Table */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-base font-semibold">Pedidos</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar pedido..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-40 text-xs">
                  <Filter className="w-3 h-3 mr-1" /><SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="confirmed">Confirmados</SelectItem>
                  <SelectItem value="processing">Processando</SelectItem>
                  <SelectItem value="shipped">Enviados</SelectItem>
                  <SelectItem value="delivered">Entregues</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Pedido</TableHead>
                <TableHead className="text-xs">Cliente</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Pagamento</TableHead>
                <TableHead className="text-xs text-right">Valor</TableHead>
                <TableHead className="text-xs">Data</TableHead>
                <TableHead className="text-xs w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => (
                <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedOrder(order)}>
                  <TableCell className="font-mono text-xs font-semibold">{order.order_number}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{order.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-[10px] gap-1 ${statusConfig[order.status].color}`}>
                      {statusConfig[order.status].icon}
                      {statusConfig[order.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-[10px] ${paymentColors[order.payment_status]}`}>
                      {order.payment_status === 'completed' ? 'Pago' : order.payment_status === 'pending' ? 'Pendente' : 'Falhou'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-sm">R$ {order.final_value.toFixed(2)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Pedido {selectedOrder?.order_number}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Cliente</p>
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Telefone</p>
                  <p className="font-medium">{selectedOrder.customer_phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Pagamento</p>
                  <p className="font-medium">{selectedOrder.payment_method}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Entrega</p>
                  <p className="font-medium">{selectedOrder.scheduled_delivery_date}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Itens</p>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 text-sm">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.quantity}x R$ {item.price.toFixed(2)}</p>
                    </div>
                    <p className="font-semibold">R$ {item.subtotal.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>R$ {selectedOrder.total_value.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Frete</span><span>R$ {selectedOrder.shipping_cost.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-primary">R$ {selectedOrder.final_value.toFixed(2)}</span></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
