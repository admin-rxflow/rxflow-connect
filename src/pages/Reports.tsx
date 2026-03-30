import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3, Download, Calendar, MessageSquare, ShoppingCart,
  Package, DollarSign, Users, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { toast } from 'sonner';

const monthlyData = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][i],
  conversas: Math.floor(Math.random() * 500) + 200,
  pedidos: Math.floor(Math.random() * 150) + 50,
  receita: Math.floor(Math.random() * 50000) + 10000,
  clientes: Math.floor(Math.random() * 300) + 100,
}));

const intentData = [
  { name: 'Pedidos', value: 35, color: '#10B981' },
  { name: 'Dúvidas', value: 30, color: '#3B82F6' },
  { name: 'Estoque', value: 20, color: '#F59E0B' },
  { name: 'Entrega', value: 10, color: '#8B5CF6' },
  { name: 'Outros', value: 5, color: '#6B7280' },
];

const weeklyConversions = Array.from({ length: 7 }, (_, i) => ({
  day: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][i],
  consultas: Math.floor(Math.random() * 80) + 30,
  pedidos: Math.floor(Math.random() * 30) + 10,
  taxa: Math.floor(Math.random() * 30) + 20,
}));

const Reports = () => {
  const [period, setPeriod] = useState('30d');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> Relatórios
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Análise detalhada do desempenho da sua farmácia</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="h-9 w-44 text-xs"><Calendar className="w-3 h-3 mr-1" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="12m">Últimos 12 meses</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-9 gap-2 text-xs" onClick={() => toast.info('Exportação em desenvolvimento...')}>
            <Download className="w-3.5 h-3.5" /> Exportar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="conversations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="conversations" className="text-xs gap-1"><MessageSquare className="w-3.5 h-3.5" /> Conversas</TabsTrigger>
          <TabsTrigger value="sales" className="text-xs gap-1"><ShoppingCart className="w-3.5 h-3.5" /> Vendas</TabsTrigger>
          <TabsTrigger value="inventory" className="text-xs gap-1"><Package className="w-3.5 h-3.5" /> Estoque</TabsTrigger>
          <TabsTrigger value="executive" className="text-xs gap-1"><TrendingUp className="w-3.5 h-3.5" /> Executivo</TabsTrigger>
        </TabsList>

        {/* Conversations Report */}
        <TabsContent value="conversations" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Conversas', value: '1.284', change: '+12%', up: true, icon: MessageSquare },
              { label: 'Resolvidas pela IA', value: '1.089', change: '+15%', up: true, icon: TrendingUp },
              { label: 'Escaladas', value: '195', change: '-8%', up: true, icon: Users },
              { label: 'Tempo Médio', value: '2.5 min', change: '-18%', up: true, icon: Calendar },
            ].map((kpi) => (
              <Card key={kpi.label} className="border-0 shadow-md">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                  <div className={`flex items-center gap-1 text-xs font-medium mt-1 ${kpi.up ? 'text-emerald-600' : 'text-red-500'}`}>
                    {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />} {kpi.change}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="border-0 shadow-md lg:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Volume de Conversas por Mês</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <defs><linearGradient id="rConv" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10B981" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }} />
                    <Area type="monotone" dataKey="conversas" stroke="#10B981" fill="url(#rConv)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Intenções Detectadas</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart><Pie data={intentData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value">
                    {intentData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                  </Pie><Tooltip /></PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">{intentData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />{d.name}</div>
                    <span className="font-semibold">{d.value}%</span>
                  </div>
                ))}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sales Report */}
        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Receita Total', value: 'R$ 48.250', change: '+12%', up: true },
              { label: 'Total Pedidos', value: '342', change: '+5%', up: true },
              { label: 'Ticket Médio', value: 'R$ 141', change: '+7%', up: true },
              { label: 'Cancelados', value: '12', change: '+2', up: false },
            ].map((kpi) => (
              <Card key={kpi.label} className="border-0 shadow-md">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                  <div className={`flex items-center gap-1 text-xs font-medium mt-1 ${kpi.up ? 'text-emerald-600' : 'text-red-500'}`}>
                    {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />} {kpi.change}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Receita Mensal</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }} formatter={(v: number) => [`R$ ${v.toLocaleString()}`, 'Receita']} />
                  <Bar dataKey="receita" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Report */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Itens', value: '170', icon: Package },
              { label: 'Valor Total', value: 'R$ 45.890', icon: DollarSign },
              { label: 'Estoque Baixo', value: '23', icon: TrendingDown },
              { label: 'Alertas Ativos', value: '7', icon: BarChart3 },
            ].map((kpi) => (
              <Card key={kpi.label} className="border-0 shadow-md">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Conversão: Consulta → Pedido (semana)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyConversions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }} />
                  <Legend />
                  <Bar dataKey="consultas" name="Consultas" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pedidos" name="Pedidos" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Executive Report */}
        <TabsContent value="executive" className="space-y-4">
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Evolução Anual - Principais KPIs</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="conversas" name="Conversas" stroke="#3B82F6" strokeWidth={2} dot={false} />
                  <Line yAxisId="left" type="monotone" dataKey="pedidos" name="Pedidos" stroke="#10B981" strokeWidth={2} dot={false} />
                  <Line yAxisId="left" type="monotone" dataKey="clientes" name="Clientes" stroke="#F59E0B" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
