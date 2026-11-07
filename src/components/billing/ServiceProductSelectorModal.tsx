import { useState, useMemo, type FC } from 'react';
import { X, Search, Check, Layers } from 'lucide-react';
import type { StudioService, InventoryProduct, InvoiceItem } from '../../types';
import { formatINR } from '../../lib/formatters';

interface ServiceProductSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: StudioService[];
  products: InventoryProduct[];
  onAddItems: (items: InvoiceItem[]) => void;
}

export const ServiceProductSelectorModal: FC<ServiceProductSelectorModalProps> = ({
  isOpen,
  onClose,
  services,
  products,
  onAddItems,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Consolidate into unified selectable catalog
  const catalog = useMemo(() => {
    const list: Array<{
      id: string;
      item_type: 'service' | 'product';
      name: string;
      category: string;
      detail: string;
      price: number;
    }> = [];

    services.forEach((s) => {
      list.push({
        id: s.id,
        item_type: 'service',
        name: s.name,
        category: s.category || 'Studio Services',
        detail: s.tagline || 'Studio Service',
        price: s.price || 15000,
      });
    });

    products.filter(p => p.is_active).forEach((p) => {
      list.push({
        id: p.id,
        item_type: 'product',
        name: p.name,
        category: p.category || 'Consumables & Materials',
        detail: `Stock: ${p.current_stock} ${p.unit}`,
        price: p.selling_price || 0,
      });
    });

    return list;
  }, [services, products]);

  // Filtered & Grouped
  const filteredCatalog = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return catalog;
    return catalog.filter(
      item => item.name.toLowerCase().includes(term) || item.category.toLowerCase().includes(term)
    );
  }, [catalog, searchTerm]);

  const categories = useMemo(() => {
    const cats: { [cat: string]: typeof catalog } = {};
    filteredCatalog.forEach(item => {
      if (!cats[item.category]) cats[item.category] = [];
      cats[item.category].push(item);
    });
    return cats;
  }, [filteredCatalog]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleConfirm = () => {
    const toAdd: InvoiceItem[] = [];
    catalog.forEach(item => {
      if (selectedIds.has(item.id)) {
        const gstRate = item.item_type === 'service' ? 18 : 18;
        const tax = item.price * (gstRate / 100);
        toAdd.push({
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          item_type: item.item_type,
          item_id: item.id,
          name: item.name,
          category: item.category,
          rate: item.price,
          quantity: 1,
          gst_percent: gstRate,
          tax_amount: tax,
          total_amount: item.price + tax,
          assigned_staff: 'Assign...',
        });
      }
    });

    onAddItems(toAdd);
    setSelectedIds(new Set());
    setSearchTerm('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm tracking-wide uppercase">Select Service / Product</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type to search service, product, package..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
              autoFocus
            />
          </div>
        </div>

        {/* Catalog Items List grouped by Category */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {Object.keys(categories).length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No matching services or products found.
            </div>
          ) : (
            Object.entries(categories).map(([categoryName, items]) => (
              <div key={categoryName}>
                <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-2">
                  {categoryName}
                </div>
                <div className="space-y-1.5">
                  {items.map((item) => {
                    const isSelected = selectedIds.has(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleSelect(item.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/60 border-blue-300 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-900">{item.name}</div>
                            <div className="text-[11px] text-slate-500">{item.detail}</div>
                          </div>
                        </div>
                        <div className="text-xs font-bold text-slate-900">
                          {formatINR(item.price)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs font-medium text-slate-600">
            <span className="font-bold text-slate-900">{selectedIds.size}</span> items selected
          </div>
          <div className="flex items-center gap-3">
            {selectedIds.size > 0 && (
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              onClick={handleConfirm}
              disabled={selectedIds.size === 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold tracking-wide uppercase shadow-sm transition-all ${
                selectedIds.size > 0
                  ? 'bg-[#131D31] hover:bg-slate-800 text-white active:scale-98'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Add Selected</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
