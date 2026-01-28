import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  type DragStartEvent,
  type DragEndEvent,
  type DropAnimation,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Types ---
interface Block {
  id: string;
  type: 'h1' | 'p';
  content: string;
}

interface EditorProps {
  initialContent: string;
  initialMetadata: Record<string, string>;
  slug: string;
  onSaveSuccess?: () => void;
}

// --- Smooth Drop Animation Config ---
const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

// --- Block UI Component ---
function BlockUI({ 
  block, 
  isOverlay, 
  isDragging, 
  onUpdate, 
  onDelete, 
  dragProps 
}: { 
  block: Block; 
  isOverlay?: boolean; 
  isDragging?: boolean;
  onUpdate?: (id: string, content: string) => void;
  onDelete?: (id: string) => void;
  dragProps?: any;
}) {
  return (
    <div 
      className={`group relative mb-4 p-5 rounded-xl border-2 transition-all duration-300 ${
        isOverlay 
          ? 'border-emerald-500 bg-white shadow-2xl scale-105 z-50 cursor-grabbing border-solid' 
          : isDragging 
            ? 'opacity-20 border-slate-100 bg-slate-50 border-dashed' 
            // Persistent faint dashed line, vivid on hover
            : 'border-dashed border-slate-200/50 hover:border-emerald-400/80 hover:bg-white hover:shadow-sm'
      }`}
    >
      {/* Action Bar - Floating on the left */}
      <div className={`absolute -left-14 top-1/2 -translate-y-1/2 flex flex-col items-center space-y-2 transition-opacity duration-200 ${isOverlay ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <button 
          {...dragProps}
          type="button"
          className="cursor-grab active:cursor-grabbing p-2 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
          title="Drag to reorder"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
        </button>
        
        {!isOverlay && onDelete && (
          <button 
            onClick={() => onDelete(block.id)} 
            type="button" 
            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete block"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        )}
      </div>

      {block.type === 'h1' ? (
        <input 
          disabled={isOverlay}
          value={block.content}
          onChange={(e) => onUpdate?.(block.id, e.target.value)}
          className="w-full text-4xl font-extrabold text-slate-900 bg-transparent outline-none placeholder:text-slate-200 tracking-tight"
          placeholder="Main Heading"
        />
      ) : (
        <textarea 
          disabled={isOverlay}
          value={block.content}
          onChange={(e) => onUpdate?.(block.id, e.target.value)}
          className="w-full text-lg text-slate-600 bg-transparent outline-none resize-none leading-relaxed placeholder:text-slate-300"
          rows={Math.max(1, block.content.split('\n').length)}
          placeholder="Write your content here..."
        />
      )}
    </div>
  );
}

// --- Sortable Wrapper ---
function SortableBlock({ block, onUpdate, onDelete }: { block: Block, onUpdate: any, onDelete: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Translate.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style}>
      <BlockUI 
        block={block} 
        isDragging={isDragging} 
        onUpdate={onUpdate} 
        onDelete={onDelete} 
        dragProps={{...attributes, ...listeners}}
      />
    </div>
  );
}

// --- Main Editor ---
export default function Editor({ initialContent, initialMetadata, slug, onSaveSuccess }: EditorProps) {
  const queryClient = useQueryClient();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [metadata, setMetadata] = useState(initialMetadata);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const lines = initialContent.split('\n').filter(l => l.trim() !== '');
    const parsed = lines.map(line => ({
      id: crypto.randomUUID(),
      type: (line.startsWith('#') ? 'h1' : 'p') as 'h1' | 'p',
      content: line.replace(/^#\s*/, '')
    }));
    setBlocks(parsed.length > 0 ? parsed : [{ id: crypto.randomUUID(), type: 'h1', content: '' }]);
  }, [initialContent]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = blocks.map(b => b.type === 'h1' ? `# ${b.content}` : b.content).join('\n\n');
      await fetch(`/api/pages/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, metadata }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages', slug] });
      onSaveSuccess?.();
    }
  });

  const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string);
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setActiveId(null);
  };

  const activeBlock = blocks.find(b => b.id === activeId);

  return (
    <div className="flex flex-col h-full bg-slate-50/50 overflow-hidden">
      {/* Navigation Header */}
      <div className="flex justify-between items-center px-10 py-5 bg-slate-900 text-white z-20 shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="px-3 py-1 rounded bg-emerald-500 text-[11px] font-black text-slate-900 uppercase tracking-wider">Canvas Mode</div>
          <span className="text-xs font-mono text-slate-500 italic">{slug}.mdx</span>
        </div>
        <button 
          onClick={() => saveMutation.mutate()} 
          className="bg-emerald-500 text-slate-900 px-8 py-2.5 rounded-xl text-xs font-black shadow-lg hover:bg-emerald-400 active:scale-95 transition-all"
        >
          {saveMutation.isPending ? 'Syncing...' : 'Save & Publish'}
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-y-auto p-12 lg:p-24 scroll-smooth">
        <div className="max-w-4xl mx-auto">
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveId(null)}
          >
            <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
              {blocks.map((block) => (
                <SortableBlock 
                  key={block.id} 
                  block={block} 
                  onUpdate={(id: string, val: string) => setBlocks(prev => prev.map(b => b.id === id ? {...b, content: val} : b))}
                  onDelete={(id: string) => setBlocks(prev => prev.filter(b => b.id !== id))}
                />
              ))}
            </SortableContext>

            <DragOverlay dropAnimation={dropAnimation}>
              {activeId && activeBlock ? (
                <BlockUI block={activeBlock} isOverlay />
              ) : null}
            </DragOverlay>
          </DndContext>

          {/* Quick Add Bar */}
          <div className="mt-16 flex justify-center items-center space-x-8 border-t border-slate-200/60 pt-10">
            <button 
              onClick={() => setBlocks([...blocks, { id: crypto.randomUUID(), type: 'h1', content: '' }])} 
              className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors"
            >
              <span className="text-lg">+</span>
              <span>Heading</span>
            </button>
            <button 
              onClick={() => setBlocks([...blocks, { id: crypto.randomUUID(), type: 'p', content: '' }])} 
              className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors"
            >
              <span className="text-lg">+</span>
              <span>Paragraph</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}