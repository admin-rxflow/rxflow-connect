import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign, MessageSquare, ShoppingCart, Users,
  TrendingUp, TrendingDown, AlertTriangle, Package,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

// Demo data
const kpis = [
  { title: 'Receita Total', value: 'R$ 48.250', change: '+12.5%', up: true, icon: DollarSign, color: 'from-emerald-500 to-teal-600' },
  { title: 'Conversas', value: '1.284', change: '+8.2%', up: true, icon: MessageSquare, color: 'from-blue-500 to-indigo-600' },
  { title: 'Pedidos', value: '342', change: '+5.1%', up: true, icon: ShoppingCart, color: 'from-violet-500 to-purple-600' },
  { title: 'Clientes Únicos', value: '876', change: '-2.3%', up: false, icon: Users, color: 'from-amber-500 to-orange-600' },
];

const conversationData = Array.from({ length: 30 }, (_, i) => ({
  date: `${i + 1}`,
  conversas: Math.floor(Math.random() * 60) + 20,
  resolvidas: Math.floor(Math.random() * 40) + 15,
}));

const revenueData = Array.from({ length: 30 }, (_, i) => ({
  date: `${i + 1}`,
  receita: Math.floor(Math.random() * 3000) + 500,
}));

const topMedications = [
  { name: 'Dipirona 500mg', sold: 245, revenue: 'R$ 4.900' },
  { name: 'Paracetamol 750mg', sold: 198, revenue: 'R$ 3.564' },
  { name: 'Ibuprofeno 400mg', sold: 156, revenue: 'R$ 4.680' },
  { name: 'Amoxicilina 500mg', sold: 134, revenue: 'R$ 6.700' },
  { name: 'Omeprazol 20mg', sold: 112, revenue: 'R$ 2.240' },
];

const stockStatus = [
  { name: 'Em estoque', value: 142, color: '#10B981' },
  { name: 'Estoque baixo', value: 23, color: '#F59E0B' },
  { name: 'Sem estoque', value: 5, color: '#EF4444' },
];

const recentAlerts = [
  { medication: 'Amoxicilina 500mg', stock: 3, min: 10, urgency: 'high' as const },
  { medication: 'Loratadina 10mg', stock: 8, min: 15, urgency: 'medium' as const },
  { medication: 'Azitromicina 500mg', stock: 0, min: 5, urgency: 'critical' as const },
  { medication: 'Diclofenaco 50mg', stock: 12, min: 20, urgency: 'medium' as const },
];

const recentConversations = [
  { phone: '(11) 99999-1234', name: 'Maria Silva', intent: 'ORDER', sentiment: 'positive' as const, time: '2 min' },
  { phone: '(11) 99888-5678', name: 'João Santos', intent: 'QUESTION', sentiment: 'neutral' as const, time: '5 min' },
  { phone: '(21) 98765-4321', name: 'Ana Oliveira', intent: 'DELIVERY', sentiment: 'positive' as const, time: '12 min' },
  { phone: '(11) 97654-3210', name: 'Carlos Lima', intent: 'INVENTORY', sentiment: 'negative' as const, time: '18 min' },
];

const urgencyColors = {
  low: 'bg-blue-500/10 text-blue-600',
  medium: 'bg-amber-500/10 text-amber-600',
  high: 'bg-orange-500/10 text-orange-600',
  critical: 'bg-red-500/10 text-red-600',
};

const sentimentColors = {
  positive: 'bg-emerald-500/10 text-emerald-600',
  neutral: 'bg-slate-500/10 text-slate-600',
  negative: 'bg-red-500/10 text-red-600',
};

const intentLabels: Record<string, string> = {
  ORDER: 'Pedido',
  QUESTION: 'Dúvida',
  DELIVERY: 'Entrega',
  INVENTORY: 'Estoque',
};

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <Card
            key={kpi.title}
            className="border-0 shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in overflow-hidden group"
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">{kpi.title}</p>
                  <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
                  <div className={`flex items-center gap-1 text-xs font-semibold ${kpi.up ? 'text-emerald-600' : 'text-red-500'}`}>
                    {kpi.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {kpi.change} vs mês anterior
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.color} shadow-lg group-hover:scale-110 transition-transform`}>
                  <kpi.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Conversations Chart */}
        <Card className="border-0 shadow-md animate-fade-in delay-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Conversas (últimos 30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={conversationData}>
                <defs>
                  <linearGradient id="convGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="resGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(210, 60%, 50%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(210, 60%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="conversas" stroke="hsl(160, 84%, 39%)" fill="url(#convGradient)" strokeWidth={2} />
                <Area type="monotone" dataKey="resolvidas" stroke="hsl(210, 60%, 50%)" fill="url(#resGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="border-0 shadow-md animate-fade-in delay-375">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Receita (últimos 30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`R$ ${value.toLocaleString()}`, 'Receita']}
                />
                <Bar dataKey="receita" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Medications */}
        <Card className="border-0 shadow-md animate-fade-in delay-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Medicamentos mais vendidos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topMedications.map((med, i) => (
              <div key={med.name} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{med.name}</p>
                  <p className="text-xs text-muted-foreground">{med.sold} unidades • {med.revenue}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Stock Status */}
        <Card className="border-0 shadow-md animate-fade-in delay-375">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              Status do estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-4">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={stockStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stockStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {stockStatus.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                    <span>{s.name}</span>
                  </div>
                  <span className="font-semibold">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="border-0 shadow-md animate-fade-in delay-450">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Alertas de estoque
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAlerts.map((alert) => (
              <div key={alert.medication} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  alert.urgency === 'critical' ? 'bg-red-500 animate-pulse' :
                  alert.urgency === 'high' ? 'bg-orange-500' : 'bg-amber-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{alert.medication}</p>
                  <p className="text-xs text-muted-foreground">
                    Estoque: {alert.stock} / Mín: {alert.min}
                  </p>
                </div>
                <Badge variant="secondary" className={`text-[10px] ${urgencyColors[alert.urgency]}`}>
                  {alert.urgency === 'critical' ? 'Crítico' : alert.urgency === 'high' ? 'Alto' : 'Médio'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Conversations */}
      <Card className="border-0 shadow-md animate-fade-in delay-450">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Últimas conversas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentConversations.map((conv) => (
              <div key={conv.phone} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {conv.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{conv.name}</p>
                    <Badge variant="secondary" className={`text-[10px] ${sentimentColors[conv.sentiment]}`}>
                      {conv.sentiment === 'positive' ? '😊' : conv.sentiment === 'negative' ? '😞' : '😐'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{conv.phone}</p>
                </div>
                <Badge variant="outline" className="text-xs">{intentLabels[conv.intent]}</Badge>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{conv.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
