import { useState, useMemo, type FC, type FormEvent } from 'react';
import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  Edit2,
  Trash2,
  X,
  Check,
  PlusCircle,
  MinusCircle
} from 'lucide-react';
import type { InventoryProduct } from '../../types';
import { formatINR } from '../../lib/formatters';
import { toast } from 'sonner';

interface ProductListProps {
  products: InventoryProduct[];
  onSaveProduct: (product: InventoryProduct) => void;
  onDeleteProduct: (id: string) => void;
  onAdjustStock: (id: string, delta: number) => void;
}

export const ProductList: FC<ProductListProps> = ({
  products,
  onSaveProduct,
  onDeleteProduct,
  onAdjustStock,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Consumables');
  const [unit, setUnit] = useState<any>('pcs');
  const [currentStock, setCurrentStock] = useState<number>(10);
  const [minStockAlert, setMinStockAlert] = useState<number>(3);
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);

  const categories = [
    'PPF & Films',
    'Ceramics & Coatings',
    'Polishing & Compounds',
    'Shampoos & Chemicals',
    'Pads & Towels',
    'Consumables',
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [products, searchTerm, categoryFilter]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setSku(`SKU-${Math.floor(100 + Math.random() * 900)}`);
    setCategory('PPF & Films');
    setUnit('rolls');
    setCurrentStock(5);
    setMinStockAlert(2);
    setPurchasePrice(25000);
    setSellingPrice(38000);
    setIsModalOpen(true);
  };

  const openEditModal = (p: InventoryProduct) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku);
    setCategory(p.category);
    setUnit(p.unit);
    setCurrentStock(p.current_stock);
    setMinStockAlert(p.min_stock_alert);
    setPurchasePrice(p.purchase_price);
    setSellingPrice(p.selling_price);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Product name is required');
      return;
    }

    const item: InventoryProduct = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: name.trim(),
      sku: sku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
      category,
      unit,
      current_stock: currentStock,
      min_stock_alert: minStockAlert,
      purchase_price: purchasePrice,
      selling_price: sellingPrice,
      is_active: true,
      created_at: editingProduct?.created_at || new Date().toISOString(),
    };

    onSaveProduct(item);
    setIsModalOpen(false);
    toast.success(editingProduct ? 'Product updated' : 'Product added to inventory');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Top Header Card matching frame 210s */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Product Management</h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
            Manage Product Inventory
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64 md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-[#131D31] hover:bg-slate-800 text-white font-bold text-xs tracking-wider uppercase transition-all duration-150 shadow-sm active:scale-98"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            categoryFilter === 'all'
              ? 'bg-[#131D31] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Items ({products.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              categoryFilter === cat
                ? 'bg-[#131D31] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Table matching frame 210s */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4 text-center">Stock Level</th>
                <th className="py-4 px-4 text-right">Purchase Cost</th>
                <th className="py-4 px-4 text-right">Selling Price</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLowStock = p.current_stock <= p.min_stock_alert;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Product Name & SKU */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                            <Package className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{p.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {p.sku} • {p.unit}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 text-slate-600 font-medium">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {p.category}
                        </span>
                      </td>

                      {/* Stock Level with Low Stock Badge */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 font-bold text-slate-900">
                          <span>{p.current_stock.toFixed(2)}</span>
                          <span className="text-slate-400 font-normal">/ {p.min_stock_alert.toFixed(2)}</span>
                        </div>
                        {isLowStock && (
                          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-amber-600 mt-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Low Stock Alert</span>
                          </div>
                        )}
                      </td>

                      {/* Purchase Cost */}
                      <td className="py-4 px-4 text-right text-slate-500 font-medium">
                        {formatINR(p.purchase_price)}
                      </td>

                      {/* Selling Price */}
                      <td className="py-4 px-4 text-right font-bold text-slate-900">
                        {formatINR(p.selling_price)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Stock Delta Quick Buttons */}
                          <button
                            onClick={() => {
                              onAdjustStock(p.id, 1);
                              toast.success(`+1 ${p.unit} added to ${p.name}`);
                            }}
                            title="Add 1 Unit"
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                          >
                            <PlusCircle className="w-4 h-4 text-emerald-600" />
                          </button>

                          <button
                            onClick={() => {
                              if (p.current_stock > 0) {
                                onAdjustStock(p.id, -1);
                                toast.info(`-1 ${p.unit} deducted from ${p.name}`);
                              }
                            }}
                            title="Deduct 1 Unit"
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                          >
                            <MinusCircle className="w-4 h-4 text-amber-600" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => openEditModal(p)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors uppercase"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete ${p.name}?`)) {
                                onDeleteProduct(p.id);
                                toast.success('Product deleted');
                              }
                            }}
                            className="p-1.5 rounded-lg text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct ? 'Edit Inventory Item' : 'Add New Inventory Item'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Product / Consumable Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Garware Plus Hi-Gloss PPF (15m Roll)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    <option value="rolls">Rolls</option>
                    <option value="bottles">Bottles</option>
                    <option value="liters">Liters</option>
                    <option value="ml">ML</option>
                    <option value="pcs">Pieces</option>
                    <option value="meters">Meters</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Current Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Low Stock Alert
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Purchase Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-blue-600"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#131D31] hover:bg-slate-800 text-white font-bold text-xs uppercase shadow-sm"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Save Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
