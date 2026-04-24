import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, MessageSquare, ShoppingCart, Package,
  Puzzle, Bot, BookOpen, BarChart3, Settings, FileText,
  ChevronLeft, LogOut, Moon, Sun, Bell, Menu, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Central de Chat', href: '/conversations', icon: MessageSquare, badge: 0 },
  { name: 'Pedidos', href: '/orders', icon: ShoppingCart },
  { name: 'Estoque', href: '/inventory', icon: Package },
  { name: 'Integrações', href: '/integrations', icon: Puzzle },
  { name: 'Agente IA', href: '/ai-config', icon: Bot },
  { name: 'Base de Conhecimento', href: '/knowledge-base', icon: BookOpen },
  { name: 'Relatórios', href: '/reports', icon: BarChart3 },
  { name: 'Configurações', href: '/settings', icon: Settings },
  { name: 'Auditoria', href: '/audit-log', icon: FileText },
];

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const { user, signOut, role } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem('rxflow-theme');
    if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('rxflow-theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('rxflow-theme', 'dark');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Sessão encerrada');
  };

  const getInitials = () => {
    const email = user?.email || '';
    return email.slice(0, 2).toUpperCase();
  };

  const currentPage = navigation.find(n => location.pathname.startsWith(n.href));

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative z-50 h-full flex flex-col transition-all duration-300 ease-in-out
          ${collapsed ? 'w-[72px]' : 'w-[260px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] border-r border-[hsl(var(--sidebar-border))]`}
      >
        {/* Logo area */}
        <div className={`flex items-center h-16 px-4 flex-shrink-0 ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <img src="/rxflow-logo.png" alt="RxFlow" className={`transition-all duration-300 ${collapsed ? 'h-8 w-8 object-contain' : 'h-9 w-auto'}`} />
          {!collapsed && (
            <span className="text-lg font-bold text-white tracking-tight">RxFlow</span>
          )}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden ml-auto text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <Separator className="bg-white/10" />

        {/* Navigation */}
        <ScrollArea className="flex-1 py-3">
          <nav className="px-3 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-[hsl(var(--sidebar-primary))] text-white shadow-lg shadow-[hsl(var(--sidebar-primary))]/20'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                    }
                    ${collapsed ? 'justify-center px-2' : ''}`}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon className={`flex-shrink-0 ${isActive ? 'w-5 h-5' : 'w-5 h-5'}`} />
                  {!collapsed && <span>{item.name}</span>}
                  {!collapsed && item.badge !== undefined && item.badge > 0 && (
                    <Badge className="ml-auto h-5 px-1.5 text-[10px] gradient-accent border-0">
                      {item.badge}
                    </Badge>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Collapse button */}
        <div className="hidden lg:flex px-3 pb-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-all ${collapsed ? 'justify-center' : ''}`}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
            {!collapsed && <span>Recolher menu</span>}
          </button>
        </div>

        {/* User info */}
        <div className="p-3 border-t border-white/10">
          <div className={`flex items-center gap-3 px-2 py-1 ${collapsed ? 'justify-center' : ''}`}>
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="gradient-primary text-white text-xs font-bold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/90 truncate">{user?.email}</p>
                <p className="text-[10px] text-white/40 capitalize">{role || 'Usuário'}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b bg-card/50 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden text-foreground">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold">{currentPage?.name || 'RxFlow'}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 rounded-lg">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 gap-2 px-2">
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="gradient-primary text-white text-[10px] font-bold">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{user?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{role || 'Usuário'}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
                  <Settings className="w-4 h-4 mr-2" /> Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
