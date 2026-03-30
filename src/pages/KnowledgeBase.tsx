import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, Search, Plus, FileText, Upload, Tag, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const demoKnowledge = [
  { id: '1', title: 'Política de Troca e Devolução', category: 'policies', content: 'A farmácia aceita devoluções em até 7 dias...', tags: ['troca', 'devolução', 'política'], is_active: true, updated_at: '2026-03-28' },
  { id: '2', title: 'Perguntas Frequentes - Entrega', category: 'faq', content: 'Prazo de entrega: 2 a 4 horas para região central...', tags: ['entrega', 'frete', 'prazo'], is_active: true, updated_at: '2026-03-27' },
  { id: '3', title: 'Guia de Medicamentos Genéricos', category: 'medications', content: 'Lista de medicamentos genéricos disponíveis...', tags: ['genéricos', 'medicamentos', 'lista'], is_active: true, updated_at: '2026-03-25' },
  { id: '4', title: 'Procedimento de Receita Controlada', category: 'procedures', content: 'Para medicamentos controlados, solicitar foto da receita...', tags: ['receita', 'controlado', 'procedimento'], is_active: true, updated_at: '2026-03-24' },
  { id: '5', title: 'Horário de Funcionamento', category: 'faq', content: 'Segunda a Sábado: 8h às 22h, Domingos: 9h às 18h', tags: ['horário', 'funcionamento'], is_active: true, updated_at: '2026-03-20' },
  { id: '6', title: 'Programa de Fidelidade', category: 'policies', content: 'A cada R$ 100 em compras, acumule 10 pontos...', tags: ['fidelidade', 'pontos', 'desconto'], is_active: false, updated_at: '2026-03-15' },
];

const categoryColors: Record<string, string> = {
  faq: 'bg-blue-500/10 text-blue-600',
  policies: 'bg-violet-500/10 text-violet-600',
  medications: 'bg-emerald-500/10 text-emerald-600',
  procedures: 'bg-amber-500/10 text-amber-600',
  general: 'bg-gray-500/10 text-gray-600',
};

const categoryLabels: Record<string, string> = {
  faq: 'FAQ',
  policies: 'Políticas',
  medications: 'Medicamentos',
  procedures: 'Procedimentos',
  general: 'Geral',
};

const KnowledgeBase = () => {
  const [search, setSearch] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filtered = demoKnowledge.filter((k) => {
    if (categoryFilter !== 'all' && k.category !== categoryFilter) return false;
    if (search && !k.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Base de Conhecimento
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Documentos e informações usados pela IA para responder</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><Upload className="w-4 h-4" /> Upload</Button>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="gradient-primary border-0 gap-2"><Plus className="w-4 h-4" /> Novo Documento</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Novo Documento</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2"><Label>Título</Label><Input placeholder="Ex: Política de entrega" className="h-11" /></div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select defaultValue="faq"><SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="faq">FAQ</SelectItem>
                      <SelectItem value="policies">Políticas</SelectItem>
                      <SelectItem value="medications">Medicamentos</SelectItem>
                      <SelectItem value="procedures">Procedimentos</SelectItem>
                      <SelectItem value="general">Geral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Conteúdo</Label><Textarea placeholder="Insira o conteúdo do documento..." className="min-h-[200px]" /></div>
                <div className="space-y-2"><Label>Tags (separadas por vírgula)</Label><Input placeholder="entrega, frete, prazo" className="h-11" /></div>
                <Button className="w-full gradient-primary border-0" onClick={() => { setShowDialog(false); toast.success('Documento adicionado!'); }}>Salvar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar documentos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-9 w-40 text-xs"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="faq">FAQ</SelectItem>
            <SelectItem value="policies">Políticas</SelectItem>
            <SelectItem value="medications">Medicamentos</SelectItem>
            <SelectItem value="procedures">Procedimentos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Documento</TableHead>
                <TableHead className="text-xs">Categoria</TableHead>
                <TableHead className="text-xs">Tags</TableHead>
                <TableHead className="text-xs">Atualizado</TableHead>
                <TableHead className="text-xs">Ativo</TableHead>
                <TableHead className="text-xs w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/5"><FileText className="w-4 h-4 text-primary" /></div>
                      <div>
                        <p className="text-sm font-medium">{doc.title}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[300px]">{doc.content}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-[10px] ${categoryColors[doc.category]}`}>
                      {categoryLabels[doc.category]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[9px] px-1.5">{tag}</Badge>
                      ))}
                      {doc.tags.length > 2 && <Badge variant="outline" className="text-[9px] px-1.5">+{doc.tags.length - 2}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{doc.updated_at}</TableCell>
                  <TableCell><Switch checked={doc.is_active} /></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default KnowledgeBase;
