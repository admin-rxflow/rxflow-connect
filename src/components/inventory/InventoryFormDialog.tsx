import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useAddInventoryItem, useUpdateInventoryItem, InventoryItem } from '@/hooks/useInventory';
import { Loader2 } from 'lucide-react';

interface InventoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: InventoryItem | null;
}

export function InventoryFormDialog({ open, onOpenChange, initialData }: InventoryFormDialogProps) {
  const { tenantId } = useAuth();
  const { mutate: addItem, isPending: isAdding } = useAddInventoryItem();
  const { mutate: updateItem, isPending: isUpdating } = useUpdateInventoryItem();
  
  const isPending = isAdding || isUpdating;

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [productType, setProductType] = useState('reference');
  
  const [stock, setStock] = useState(0);
  const [minStock, setMinStock] = useState(10);
  const [maxStock, setMaxStock] = useState(100);
  const [unitMeasure, setUnitMeasure] = useState('UN');
  
  const [unitPrice, setUnitPrice] = useState(0);
  const [factoryPrice, setFactoryPrice] = useState(0);
  const [margin, setMargin] = useState(0);

  const [active, setActive] = useState(true);
  const [requiresPrescription, setRequiresPrescription] = useState(false);
  const [ageRestricted, setAgeRestricted] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.medication_name);
        setCode(initialData.medication_code);
        setCategory(initialData.category || '');
        setManufacturer(initialData.manufacturer || '');
        setStock(initialData.current_stock || 0);
        setMinStock(initialData.minimum_stock || 10);
        setMaxStock(initialData.maximum_stock || 100);
        setUnitMeasure(initialData.unit_measure || 'UN');
        setUnitPrice(initialData.unit_price || 0);
        setFactoryPrice(initialData.factory_price || 0);
        setMargin(initialData.margin || 0);
        setProductType(initialData.product_type || 'reference');
        setActive(initialData.active ?? true);
        setRequiresPrescription(initialData.requires_prescription ?? false);
        setAgeRestricted(initialData.age_restricted ?? false);
      } else {
        // Reset form for "Add"
        setName('');
        setCode('');
        setCategory('');
        setManufacturer('');
        setStock(0);
        setMinStock(10);
        setMaxStock(100);
        setUnitMeasure('UN');
        setUnitPrice(0);
        setFactoryPrice(0);
        setMargin(0);
        setProductType('reference');
        setActive(true);
        setRequiresPrescription(false);
        setAgeRestricted(false);
      }
    }
  }, [open, initialData]);

  const computedMargin = useMemo(() => {
    if (unitPrice > 0 && factoryPrice > 0) {
      return ((unitPrice - factoryPrice) / unitPrice) * 100;
    }
    return 0;
  }, [unitPrice, factoryPrice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;

    const payload = {
      tenant_id: tenantId,
      medication_name: name,
      medication_code: code || `MED-${Math.floor(Math.random() * 10000)}`,
      category: category || null,
      manufacturer: manufacturer || null,
      product_type: productType,
      current_stock: Number(stock),
      minimum_stock: Number(minStock),
      maximum_stock: Number(maxStock),
      unit_measure: unitMeasure,
      unit_price: Number(unitPrice),
      factory_price: Number(factoryPrice),
      margin: computedMargin,
      active,
      requires_prescription: requiresPrescription,
      age_restricted: ageRestricted,
    };

    if (initialData) {
      updateItem({ id: initialData.id, updates: payload }, {
        onSuccess: () => onOpenChange(false)
      });
    } else {
      addItem(payload, {
        onSuccess: () => onOpenChange(false)
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Medicamento' : 'Adicionar Medicamento'}</DialogTitle>
          <DialogDescription>
            Preencha os dados do medicamento. Os valores de custo não serão acessíveis para a Inteligência Artificial.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input id="name" required value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Neosaldina 30 Drágeas" />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="code">Cód. Interno ou EAN</Label>
              <Input id="code" value={code} onChange={e => setCode(e.target.value)} placeholder="001234" />
            </div>
            
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="manufacturer">Fabricante / Laboratório</Label>
              <Input id="manufacturer" value={manufacturer} onChange={e => setManufacturer(e.target.value)} placeholder="Ex: SOMA LIFE" />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="category">Categoria Geral</Label>
              <Input id="category" value={category} onChange={e => setCategory(e.target.value)} placeholder="Ex: Analgésico" />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Tipo de Produto / Anvisa</Label>
              <Select value={productType} onValueChange={setProductType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reference">Referência (Original / Ético)</SelectItem>
                  <SelectItem value="generic">Genérico</SelectItem>
                  <SelectItem value="similar">Similar</SelectItem>
                  <SelectItem value="otc">MIP / Medicamento Isento de Prescrição</SelectItem>
                  <SelectItem value="supply">Correlato / Insumo Médico</SelectItem>
                  <SelectItem value="cosmetic">Perfumaria / Cosmético</SelectItem>
                  <SelectItem value="manipulated">Manipulado</SelectItem>
                  <SelectItem value="other">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <fieldset className="border rounded-lg p-4 bg-muted/20">
            <legend className="px-2 text-sm font-semibold text-primary">Financeiro (Uso Interno)</legend>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Valor Venda (R$)</Label>
                <Input id="unitPrice" type="number" step="0.01" value={unitPrice} onChange={e => setUnitPrice(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="factoryPrice">Valor Fábrica (R$)</Label>
                <Input id="factoryPrice" type="number" step="0.01" value={factoryPrice} onChange={e => setFactoryPrice(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Margem (%)</Label>
                <div className={`flex items-center h-9 rounded-md border px-3 text-sm font-semibold select-none bg-muted/40 ${
                  computedMargin > 30 ? 'text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800' :
                  computedMargin > 0 ? 'text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800' :
                  'text-muted-foreground'
                }`}>
                  {computedMargin > 0 ? `${computedMargin.toFixed(1)}%` : '—'}
                </div>
                <p className="text-[10px] text-muted-foreground">Calculado automaticamente</p>
              </div>
            </div>
          </fieldset>

          <fieldset className="border rounded-lg p-4 bg-muted/20">
            <legend className="px-2 text-sm font-semibold text-primary">Controle de Estoque</legend>
            <div className="grid grid-cols-4 gap-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="stock">Estoque Atual</Label>
                <Input id="stock" type="number" value={stock} onChange={e => setStock(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStock">Estoque Mín.</Label>
                <Input id="minStock" type="number" value={minStock} onChange={e => setMinStock(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxStock">Estoque Máx.</Label>
                <Input id="maxStock" type="number" value={maxStock} onChange={e => setMaxStock(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitMeasure">Und. Medida</Label>
                <Input id="unitMeasure" value={unitMeasure} onChange={e => setUnitMeasure(e.target.value.toUpperCase())} placeholder="Ex: CX, LT, UN" />
              </div>
            </div>
          </fieldset>

          <fieldset className="border rounded-lg p-4 bg-muted/20">
            <legend className="px-2 text-sm font-semibold text-primary">Regras de Negócio (Guardrails)</legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="active" className="flex flex-col"><span className="font-semibold">Ativo</span><span className="text-xs font-normal text-muted-foreground">Produto disponível</span></Label>
                <Switch id="active" checked={active} onCheckedChange={setActive} />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="prescription" className="flex flex-col"><span className="font-semibold">Receita</span><span className="text-xs font-normal text-muted-foreground">Exige prescrição?</span></Label>
                <Switch id="prescription" checked={requiresPrescription} onCheckedChange={setRequiresPrescription} />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="age" className="flex flex-col"><span className="font-semibold">+18 Anos</span><span className="text-xs font-normal text-muted-foreground">Restrito p/ menores?</span></Label>
                <Switch id="age" checked={ageRestricted} onCheckedChange={setAgeRestricted} />
              </div>
            </div>
          </fieldset>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {initialData ? 'Salvar Alterações' : 'Adicionar Produto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
