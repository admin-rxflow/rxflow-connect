import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Package, Search, Plus, AlertTriangle, CheckCircle, XCircle, TrendingDown, DollarSign, PillIcon } from 'lucide-react';

const demoInventory = Array.from({ length: 20 }, (_, i) => ({
  id: `inv_${i}`,
  medication_code: `MED-${String(1000 + i)}`,
  medication_name: ['Dipirona 500mg', 'Paracetamol 750mg', 'Ibuprofeno 400mg', 'Amoxicilina 500mg', 'Omeprazol 20mg', 'Losartana 50mg', 'Metformina 850mg', 'Atenolol 50mg', 'Sinvastatina 20mg', 'Fluoxetina 20mg', 'Diclofenaco 50mg', 'Azitromicina 500mg', 'Loratadina 10mg', 'Prednisona 20mg', 'Rivotril 2mg', 'Pantoprazol 40mg', 'Enalapril 10mg', 'Ambroxol xarope', 'Cefalexina 500mg', 'Dexametasona 4mg'][i],
  current_stock: [120, 85, 45, 3, 200, 15, 0, 78, 156, 8, 12, 0, 8, 67, 34, 90, 5, 55, 22, 11][i],
  minimum_stock: [20, 20, 15, 10, 30, 10, 10, 20, 25, 10, 20, 5, 15, 10, 10, 20, 10, 15, 10, 10][i],
  maximum_stock: 500,
  unit_price: [8.90, 6.50, 12.00, 25.00, 15.00, 18.50, 9.80, 7.20, 14.00, 32.00, 8.00, 28.00, 11.50, 9.00, 45.00, 22.00, 12.00, 16.50, 20.00, 19.00][i],
  active: true,
  requires_prescription: [false, false, false, true, false, true, true, true, true, true, false, true, false, true, true, false, true, false, true, true][i],
  category: ['Analgésico', 'Analgésico', 'Anti-inflamatório', 'Antibiótico', 'Gastrointestinal', 'Cardiovascular', 'Antidiabético', 'Cardiovascular', 'Cardiovascular', 'Antidepressivo', 'Anti-inflamatório', 'Antibiótico', 'Antialérgico', 'Anti-inflamatório', 'Ansiolítico', 'Gastrointestinal', 'Cardiovascular', 'Expectorante', 'Antibiótico', 'Anti-inflamatório'][i],
}));

const getStockLevel = (current: number, min: number) => {
  if (current === 0) return 'out_of_stock';
  if (current <= min) return 'low_stock';
  return 'normal';
};

const stockLevelConfig: Record<string, { label: string; color: string; badgeColor: string }> = {
  normal: { label: 'Normal', color: 'bg-emerald-500', badgeColor: 'bg-emerald-500/10 text-emerald-600' },
  low_stock: { label: 'Baixo', color: 'bg-amber-500', badgeColor: 'bg-amber-500/10 text-amber-600' },
  out_of_stock: { label: 'Sem estoque', color: 'bg-red-500', badgeColor: 'bg-red-500/10 text-red-600' },
};

const Inventory = () => {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');

  const filtered = demoInventory.filter((item) => {
    if (search && !item.medication_name.toLowerCase().includes(search.toLowerCase()) && !item.medication_code.includes(search)) return false;
    const level = getStockLevel(item.current_stock, item.minimum_stock);
    if (tab === 'low' && level !== 'low_stock') return false;
    if (tab === 'out' && level !== 'out_of_stock') return false;
    return true;
  });

  const totalValue = demoInventory.reduce((a, i) => a + i.current_stock * i.unit_price, 0);
  const normalCount = demoInventory.filter((i) => getStockLevel(i.current_stock, i.minimum_stock) === 'normal').length;
  const lowCount = demoInventory.filter((i) => getStockLevel(i.current_stock, i.minimum_stock) === 'low_stock').length;
  const outCount = demoInventory.filter((i) => getStockLevel(i.current_stock, i.minimum_stock) === 'out_of_stock').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600"><PillIcon className="w-5 h-5 text-white" /></div>
            <div><p className="text-xs text-muted-foreground">Total Itens</p><p className="text-xl font-bold">{demoInventory.length}</p></div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600"><DollarSign className="w-5 h-5 text-white" /></div>
            <div><p className="text-xs text-muted-foreground">Valor Total</p><p className="text-xl font-bold">R$ {totalValue.toFixed(0)}</p></div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600"><TrendingDown className="w-5 h-5 text-white" /></div>
            <div><p className="text-xs text-muted-foreground">Estoque Baixo</p><p className="text-xl font-bold text-amber-600">{lowCount}</p></div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-rose-600"><XCircle className="w-5 h-5 text-white" /></div>
            <div><p className="text-xs text-muted-foreground">Sem Estoque</p><p className="text-xl font-bold text-red-600">{outCount}</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              Estoque de Medicamentos
            </CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar medicamento..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
              </div>
              <Button className="h-9 gradient-primary border-0 text-xs gap-1"><Plus className="w-3.5 h-3.5" /> Adicionar</Button>
            </div>
          </div>
          <Tabs value={tab} onValueChange={setTab} className="mt-2">
            <TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs h-7">Todos ({demoInventory.length})</TabsTrigger>
              <TabsTrigger value="low" className="text-xs h-7">Baixo ({lowCount})</TabsTrigger>
              <TabsTrigger value="out" className="text-xs h-7">Sem estoque ({outCount})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Medicamento</TableHead>
                <TableHead className="text-xs">Código</TableHead>
                <TableHead className="text-xs">Estoque</TableHead>
                <TableHead className="text-xs">Nível</TableHead>
                <TableHead className="text-xs text-right">Preço Unit.</TableHead>
                <TableHead className="text-xs">Receita</TableHead>
                <TableHead className="text-xs">Categoria</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const level = getStockLevel(item.current_stock, item.minimum_stock);
                const pct = Math.min((item.current_stock / item.maximum_stock) * 100, 100);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-sm">{item.medication_name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{item.medication_code}</TableCell>
                    <TableCell>
                      <div className="space-y-1 w-32">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold">{item.current_stock}</span>
                          <span className="text-muted-foreground">/ {item.maximum_stock}</span>
                        </div>
                        <Progress value={pct} className={`h-1.5 ${level === 'out_of_stock' ? '[&>div]:bg-red-500' : level === 'low_stock' ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'}`} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-[10px] ${stockLevelConfig[level].badgeColor}`}>
                        {level === 'out_of_stock' && <XCircle className="w-3 h-3 mr-0.5" />}
                        {level === 'low_stock' && <AlertTriangle className="w-3 h-3 mr-0.5" />}
                        {level === 'normal' && <CheckCircle className="w-3 h-3 mr-0.5" />}
                        {stockLevelConfig[level].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-sm">R$ {item.unit_price.toFixed(2)}</TableCell>
                    <TableCell>
                      {item.requires_prescription && <Badge variant="outline" className="text-[9px] bg-violet-500/10 text-violet-600 border-violet-500/20">Receita</Badge>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{item.category}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
