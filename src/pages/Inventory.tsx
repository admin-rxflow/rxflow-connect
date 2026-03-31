import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, AlertTriangle, CheckCircle, XCircle, TrendingDown, DollarSign, PillIcon, MoreHorizontal, Pencil, Trash2, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { useAuth } from '@/contexts/AuthContext';
import { useInventory, useDeleteInventoryItem, InventoryItem } from '@/hooks/useInventory';
import { InventoryFormDialog } from '@/components/inventory/InventoryFormDialog';

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
  const { tenantId } = useAuth();
  const { data: inventory = [], isLoading } = useInventory(tenantId);
  const { mutate: deleteItem } = useDeleteInventoryItem();

  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir permanentemente este medicamento do banco de dados?')) {
      if (tenantId) deleteItem({ id, tenantId });
    }
  };

  const filtered = inventory.filter((item) => {
    if (search && !item.medication_name.toLowerCase().includes(search.toLowerCase()) && !item.medication_code.includes(search)) return false;
    const level = getStockLevel(item.current_stock ?? 0, item.minimum_stock ?? 0);
    if (tab === 'low' && level !== 'low_stock') return false;
    if (tab === 'out' && level !== 'out_of_stock') return false;
    return true;
  });

  const totalValue = inventory.reduce((acc, i) => acc + ((i.current_stock ?? 0) * (i.unit_price ?? 0)), 0);
  const lowCount = inventory.filter((i) => getStockLevel(i.current_stock ?? 0, i.minimum_stock ?? 0) === 'low_stock').length;
  const outCount = inventory.filter((i) => getStockLevel(i.current_stock ?? 0, i.minimum_stock ?? 0) === 'out_of_stock').length;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-10 h-full">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Resumo Gerencial */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600"><PillIcon className="w-5 h-5 text-white" /></div>
            <div><p className="text-xs text-muted-foreground">Total Itens</p><p className="text-xl font-bold">{inventory.length}</p></div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600"><DollarSign className="w-5 h-5 text-white" /></div>
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">Vlr. Estoque <span className="text-[10px] bg-slate-100 rounded px-1">Secreto da IA</span></p>
              <p className="text-xl font-bold">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
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

      {/* Catálogo Real */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <PillIcon className="w-4 h-4 text-primary" />
              Catálogo de Produtos (Estoque)
            </CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar produto..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
              </div>
              <Button onClick={handleAdd} className="h-9 gradient-primary border-0 text-xs gap-1"><Plus className="w-3.5 h-3.5" /> Adicionar</Button>
            </div>
          </div>
          <Tabs value={tab} onValueChange={setTab} className="mt-2">
            <TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs h-7">Todos ({inventory.length})</TabsTrigger>
              <TabsTrigger value="low" className="text-xs h-7">Baixo ({lowCount})</TabsTrigger>
              <TabsTrigger value="out" className="text-xs h-7">Sem estoque ({outCount})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                <PillIcon className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-medium text-foreground">Estoque vazio</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">Nenhum produto cadastrado que bata com esta pesquisa. Adicione medicamentos para a Inteligência Artificial conseguir oferecer no WhatsApp.</p>
              <Button onClick={handleAdd} variant="outline" className="gap-2">
                <Plus className="w-4 h-4" /> Cadastrar Primeiro Produto
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-semibold">Produto</TableHead>
                  <TableHead className="text-xs font-semibold">Qtd.</TableHead>
                  <TableHead className="text-xs font-semibold">Nível</TableHead>
                  <TableHead className="text-xs font-semibold">Classificação</TableHead>
                  <TableHead className="text-xs text-right font-semibold">Venda (R$)</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => {
                  const currentStock = item.current_stock ?? 0;
                  const minStock = item.minimum_stock ?? 0;
                  const maxStock = item.maximum_stock || 100;
                  
                  const level = getStockLevel(currentStock, minStock);
                  const pct = Math.min((currentStock / maxStock) * 100, 100);
                  
                  return (
                    <TableRow key={item.id} className={!item.active ? 'opacity-50 grayscale' : ''}>
                      <TableCell>
                        <div className="font-medium text-sm text-foreground">{item.medication_name}</div>
                        <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                          <span className="font-mono">{item.medication_code}</span>
                          {item.manufacturer && <span>• {item.manufacturer}</span>}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1 w-28">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold">{currentStock} {item.unit_measure}</span>
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

                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {item.requires_prescription && <Badge variant="outline" className="text-[9px] bg-violet-500/10 text-violet-600 border-violet-500/20">Receita</Badge>}
                          {item.category && <Badge variant="outline" className="text-[10px]">{item.category}</Badge>}
                        </div>
                      </TableCell>

                      <TableCell className="text-right font-semibold text-sm">
                        R$ {(item.unit_price ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(item)} className="cursor-pointer">
                              <Pencil className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(item.id)} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-950">
                              <Trash2 className="mr-2 h-4 w-4" /> Excluir permanentemente
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <InventoryFormDialog 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        initialData={editingItem} 
      />
    </div>
  );
};

export default Inventory;
