import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

// --- Types ---
interface TreeNode {
  name: string;
  slug: string;
  children: TreeNode[];
}

interface SidebarProps {
  onToggleCollapse?: () => void;
}

// --- Tree Building Logic ---
function buildTree(slugs: string[]): TreeNode[] {
  const root: TreeNode[] = [];
  slugs.forEach((slug) => {
    const parts = slug.split('/');
    let currentLevel = root;
    parts.forEach((part, index) => {
      const path = parts.slice(0, index + 1).join('/');
      let existingNode = currentLevel.find((node) => node.name === part);
      if (!existingNode) {
        existingNode = { name: part, slug: path, children: [] };
        currentLevel.push(existingNode);
      }
      currentLevel = existingNode.children;
    });
  });

  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.name === 'home') return -1;
      if (b.name === 'home') return 1;
      const aHasChildren = a.children.length > 0;
      const bHasChildren = b.children.length > 0;
      if (aHasChildren && !bHasChildren) return -1;
      if (!aHasChildren && bHasChildren) return 1;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach(node => { if (node.children.length > 0) sortNodes(node.children); });
    return nodes;
  };
  return sortNodes(root);
}

// --- Recursive Nav Item Component ---
function NavItem({ 
  node, 
  depth = 0, 
  onDelete, 
  onAddChild 
}: { 
  node: TreeNode; 
  depth?: number; 
  onDelete: (slug: string) => void;
  onAddChild: (slug: string) => void;
}) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  
  const hasChildren = node.children.length > 0;
  const isActive = location.pathname === `/${node.slug}` || 
                   (location.pathname === '/' && node.slug === 'home');

  return (
    <div className="flex flex-col">
      <div 
        className={`flex items-center group rounded-md transition-colors pr-2 ${
          isActive ? 'bg-emerald-100 text-emerald-900' : 'hover:bg-slate-100 text-slate-600'
        }`}
        style={{ paddingLeft: `${depth * 0.75}rem` }}
      >
        {hasChildren && (
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-emerald-200 rounded text-slate-400 transition-transform"
            style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        )}

        <Link
          to={node.slug === 'home' ? '/' : `/${node.slug}`}
          className={`flex-1 px-2 py-1.5 text-sm font-medium truncate ${!hasChildren ? 'ml-6' : ''}`}
        >
          {node.name.replace(/-/g, ' ')}
        </Link>

        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddChild(node.slug); }}
            className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          </button>

          {node.slug !== 'home' && (
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(node.slug); }}
              className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          )}
        </div>
      </div>

      {hasChildren && isOpen && (
        <div className="mt-1">
          {node.children.map((child) => (
            <NavItem key={child.slug} node={child} depth={depth + 1} onDelete={onDelete} onAddChild={onAddChild} />
          ))}
        </div>
      )}
    </div>
  );
}

// --- Main Sidebar Component ---
export default function Sidebar({ onToggleCollapse }: SidebarProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: pageList, isLoading, isError } = useQuery<string[]>({
    queryKey: ['page-list'],
    queryFn: () => fetch('/api/pages/').then((res) => res.json()),
  });

  const createMutation = useMutation({
    mutationFn: async ({ title, parent }: { title: string; parent: string }) => {
      const res = await fetch('/api/pages/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, parent }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['page-list'] });
      navigate(`/${data.slug}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (slug: string) => {
      const res = await fetch(`/api/pages/${slug}`, { method: 'DELETE' });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-list'] });
      if (location.pathname !== '/') navigate('/');
    }
  });

  const handleCreateNew = (parent: string = "root") => {
    const title = prompt(parent === "root" ? "New Root Page Title:" : `New Child Page in "${parent}":`);
    if (title) createMutation.mutate({ title, parent });
  };

  const handleDelete = (slug: string) => {
    if (window.confirm(`Delete "${slug}"?`)) deleteMutation.mutate(slug);
  };

  if (isLoading) return <div className="w-64 h-screen bg-white border-r border-slate-200 animate-pulse" />;
  if (isError) return <div className="w-64 p-6 text-red-500 text-xs">Error loading library.</div>;

  const tree = buildTree(pageList || []);

  return (
    <nav className="w-full h-screen bg-white flex flex-col sticky top-0">
      {/* Header with Toggle */}
      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-0.5">Matcha CMS</h2>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Content Hub</p>
        </div>
        
        <button 
          onClick={onToggleCollapse}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          title="Collapse Sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
        </button>
      </div>

      {/* Pages Section */}
      <div className="px-6 py-4 flex items-center justify-between group/header">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Explorer</span>
        <button 
          onClick={() => handleCreateNew("root")}
          className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors opacity-0 group-hover/header:opacity-100"
          title="New Root Page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
        {tree.map((node) => (
          <NavItem 
            key={node.slug} 
            node={node} 
            onDelete={handleDelete} 
            onAddChild={handleCreateNew} 
          />
        ))}
      </div>

      {/* Profile Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-[10px] text-white font-bold shadow-sm border border-emerald-700">XR</div>
          <div className="flex flex-col leading-tight overflow-hidden">
            <span className="text-[9px] font-bold text-slate-400 uppercase truncate">Software Engineer</span>
            <span className="text-xs font-bold text-slate-700 truncate">Xander Reyes</span>
          </div>
        </div>
      </div>
    </nav>
  );
}