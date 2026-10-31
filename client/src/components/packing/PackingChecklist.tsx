import React, { useState, useRef } from 'react';
import { Plus, ChevronDown, ChevronUp, Check, AlertCircle, PackageCheck, Sparkles } from 'lucide-react';
import { PackingCategory, PackingItem } from '../../types';

interface PackingChecklistProps {
  packingList: PackingCategory[];
  onToggleItem: (catIndex: number, itemId: string, checked: boolean) => void;
  onAddItem: (catIndex: number, item: PackingItem) => void;
}

const PackingChecklist: React.FC<PackingChecklistProps> = ({
  packingList,
  onToggleItem,
  onAddItem,
}) => {
  const [openCategories, setOpenCategories] = useState<Set<number>>(
    new Set(packingList.map((_, i) => i))
  );
  const [addingCategory, setAddingCategory] = useState<number | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const totalItems = packingList.reduce((s, c) => s + c.items.length, 0);
  const checkedItems = packingList.reduce(
    (s, c) => s + c.items.filter((i) => i.checked).length,
    0
  );
  const progress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  const essentialsMissing = packingList.reduce(
    (s, c) => s + c.items.filter((i) => i.essential && !i.checked).length,
    0
  );

  const toggleCategory = (idx: number) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const startAdd = (catIdx: number) => {
    setAddingCategory(catIdx);
    setNewItemName('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const commitAdd = (catIdx: number) => {
    const name = newItemName.trim();
    if (!name) { setAddingCategory(null); return; }
    onAddItem(catIdx, {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name,
      checked: false,
      essential: false,
    });
    setNewItemName('');
    setAddingCategory(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Global Progress */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-white/[0.04] to-white/[0.02] border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5A0]/20 to-[#00D4FF]/20 border border-[#00E5A0]/30 flex items-center justify-center text-[#00E5A0]">
              <PackageCheck size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Smart Packing Assistant</h3>
              <p className="text-xs text-white/50">Tailored to your destination climate & planned activities</p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono">
            {essentialsMissing > 0 && (
              <span className="badge badge-coral text-xs">
                {essentialsMissing} Essential{essentialsMissing > 1 ? 's' : ''} Pending
              </span>
            )}
            <span className="text-lg font-black text-[#00E5A0]">
              {checkedItems} / {totalItems} Packed
            </span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono text-white/60">
            <span>Preparedness Velocity</span>
            <span className="font-bold text-[#00E5A0]">{progress}%</span>
          </div>
          <div className="h-2.5 w-full bg-white/[0.06] rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FF6B35] via-[#845EC2] to-[#00E5A0] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Categories Accordion */}
      <div className="space-y-3">
        {packingList.map((cat, catIdx) => {
          const isOpen = openCategories.has(catIdx);
          const catTotal = cat.items.length;
          const catChecked = cat.items.filter((i) => i.checked).length;
          const isComplete = catTotal > 0 && catChecked === catTotal;

          return (
            <div
              key={cat.category}
              className="card overflow-hidden border-white/10 bg-[#080812]"
            >
              {/* Category Bar */}
              <div
                onClick={() => toggleCategory(catIdx)}
                className="flex items-center justify-between p-4 px-5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white text-sm">{cat.category}</span>
                  <span className="text-[11px] font-mono text-white/40">
                    ({catChecked}/{catTotal})
                  </span>
                  {isComplete && (
                    <span className="w-4 h-4 rounded-full bg-[#00E5A0] text-[#050507] flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      startAdd(catIdx);
                    }}
                    className="text-xs text-white/40 hover:text-[#FF6B35] font-mono flex items-center gap-1 transition-colors"
                  >
                    <Plus size={13} /> Add
                  </button>
                  {isOpen ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
                </div>
              </div>

              {/* Items List */}
              {isOpen && (
                <div className="p-4 px-5 space-y-2 border-t border-white/[0.06]">
                  {cat.items.map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                        item.checked
                          ? 'bg-[#00E5A0]/08 border-[#00E5A0]/20 text-white/40 line-through'
                          : 'bg-white/[0.02] border-white/06 hover:border-white/15 text-white/90'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={(e) => onToggleItem(catIdx, item.id, e.target.checked)}
                          className="w-4 h-4 rounded accent-[#00E5A0] cursor-pointer"
                        />
                        <span className="text-xs font-medium">{item.name}</span>
                      </div>

                      {item.essential && !item.checked && (
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF6B35] bg-[#FF6B35]/15 px-2 py-0.5 rounded border border-[#FF6B35]/30">
                          Essential
                        </span>
                      )}
                    </label>
                  ))}

                  {/* Inline Add input */}
                  {addingCategory === catIdx && (
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        ref={inputRef}
                        type="text"
                        placeholder="Item name (e.g., Power Adapter)..."
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitAdd(catIdx);
                          if (e.key === 'Escape') setAddingCategory(null);
                        }}
                        className="input-field !py-2 text-xs flex-1"
                      />
                      <button
                        onClick={() => commitAdd(catIdx)}
                        className="btn-primary !px-4 !py-2 !text-xs cursor-pointer"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setAddingCategory(null)}
                        className="btn-ghost !px-3 !py-2 !text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PackingChecklist;
