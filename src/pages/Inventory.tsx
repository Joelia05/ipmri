import React, { useEffect, useState } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Item, Category } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2,
  Package,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Inventory: React.FC = () => {
  const { isManager, isAdmin } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    quantity: 0,
    unit: '',
    lowStockThreshold: 10,
    sku: ''
  });

  useEffect(() => {
    const unsubItems = onSnapshot(query(collection(db, 'items'), orderBy('name')), (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item)));
      setLoading(false);
    });

    const unsubCats = onSnapshot(collection(db, 'categories'), (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    });

    return () => {
      unsubItems();
      unsubCats();
    };
  }, []);

  const handleOpenModal = (item?: Item) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        categoryId: item.categoryId,
        quantity: item.quantity,
        unit: item.unit,
        lowStockThreshold: item.lowStockThreshold || 10,
        sku: item.sku || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        categoryId: '',
        quantity: 0,
        unit: '',
        lowStockThreshold: 10,
        sku: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateDoc(doc(db, 'items', editingItem.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'items'), {
          ...formData,
          createdAt: serverTimestamp()
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Error saving item');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await deleteDoc(doc(db, 'items', id));
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                         (item.sku && item.sku.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-mono text-[11px] uppercase opacity-50 tracking-[0.3em] font-bold mb-1 italic">
            Warehouse / Materials
          </h2>
          <h1 className="font-sans text-5xl font-bold tracking-tight text-[#141414]">Inventory</h1>
        </div>
        {isManager && (
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-[#141414] text-white px-6 py-3 font-mono uppercase text-sm tracking-widest hover:bg-opacity-90 transition-all hover:translate-y-[-2px] shadow-[4px_4px_0px_0px_rgba(100,100,100,0.5)]"
          >
            <Plus size={18} />
            Add New Item
          </button>
        )}
      </header>

      {/* Filters */}
      <div className="bg-white border border-[#141414] p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={18} />
          <input 
            type="text" 
            placeholder="Search by Name or SKU..."
            className="w-full bg-[#f5f5f5] border-none font-mono text-sm pl-10 py-3 focus:ring-1 focus:ring-[#141414]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 border-l-0 md:border-l border-[#141414] md:pl-4">
          <Filter size={18} className="opacity-30" />
          <select 
            className="bg-transparent border-none font-mono text-sm uppercase cursor-pointer"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Item Table */}
      <div className="bg-white border border-[#141414] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#141414]">
                <th className="p-4 font-mono text-[10px] uppercase opacity-50 font-bold italic">SKU/ID</th>
                <th className="p-4 font-mono text-[10px] uppercase opacity-50 font-bold italic">Item Name</th>
                <th className="p-4 font-mono text-[10px] uppercase opacity-50 font-bold italic">Category</th>
                <th className="p-4 font-mono text-[10px] uppercase opacity-50 font-bold italic text-right">In Stock</th>
                <th className="p-4 font-mono text-[10px] uppercase opacity-50 font-bold italic text-center">Status</th>
                <th className="p-4 font-mono text-[10px] uppercase opacity-50 font-bold italic">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center font-mono text-xs opacity-50 uppercase animate-pulse">Loading Inventory...</td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center font-mono text-xs opacity-50 uppercase">No items found</td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const isLow = item.quantity <= (item.lowStockThreshold || 0) && item.quantity > 0;
                  const isOut = item.quantity === 0;
                  return (
                    <tr key={item.id} className="border-b border-[#eee] hover:bg-[#f9f9f9] transition-colors group">
                      <td className="p-4 font-mono text-[11px] opacity-70">{item.sku || item.id.substring(0, 8)}</td>
                      <td className="p-4">
                        <div className="font-bold font-sans">{item.name}</div>
                        <div className="font-mono text-[10px] opacity-50 uppercase">{item.unit}</div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-[10px] uppercase px-2 py-1 bg-[#eee] rounded-sm">
                          {categories.find(c => c.id === item.categoryId)?.name || 'Unknown'}
                        </span>
                      </td>
                      <td className={`p-4 text-right font-mono text-lg font-bold ${isOut ? 'text-red-600' : isLow ? 'text-orange-600' : ''}`}>
                        {item.quantity}
                      </td>
                      <td className="p-4 text-center">
                        {isOut ? (
                          <span className="bg-red-100 text-red-800 text-[9px] uppercase px-2 py-0.5 font-bold tracking-tighter">OUT OF STOCK</span>
                        ) : isLow ? (
                          <span className="bg-orange-100 text-orange-800 text-[9px] uppercase px-2 py-0.5 font-bold tracking-tighter">LOW STOCK</span>
                        ) : (
                          <span className="bg-green-100 text-green-800 text-[9px] uppercase px-2 py-0.5 font-bold tracking-tighter">AVAILABLE</span>
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isManager && (
                            <button 
                              onClick={() => handleOpenModal(item)}
                              className="p-2 hover:bg-blue-50 text-blue-600 rounded-none transition-colors border border-transparent hover:border-blue-200"
                            >
                              <Edit2 size={14} />
                            </button>
                          )}
                          {isAdmin && (
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="p-2 hover:bg-red-50 text-red-600 rounded-none transition-colors border border-transparent hover:border-red-200"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
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

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#141414]/80 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-[#141414] w-full max-w-lg relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-[#141414] flex justify-between items-center bg-[#f9f9f9]">
                <h3 className="font-mono text-sm uppercase font-bold tracking-widest italic">
                  {editingItem ? 'Edit Inventory Item' : 'Register New Item'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block font-mono text-[10px] uppercase opacity-50 mb-1">Item Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-[#f5f5f5] border border-transparent focus:border-[#141414] p-3 font-mono text-sm outline-none"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[10px] uppercase opacity-50 mb-1">Category</label>
                      <select 
                        required
                        className="w-full bg-[#f5f5f5] border border-transparent focus:border-[#141414] p-3 font-mono text-sm outline-none"
                        value={formData.categoryId}
                        onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase opacity-50 mb-1">SKU / Code (Optional)</label>
                      <input 
                        type="text" 
                        className="w-full bg-[#f5f5f5] border border-transparent focus:border-[#141414] p-3 font-mono text-sm outline-none"
                        value={formData.sku}
                        onChange={(e) => setFormData({...formData, sku: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[10px] uppercase opacity-50 mb-1">Initial Quantity</label>
                      <input 
                        required
                        type="number" 
                        className="w-full bg-[#f5f5f5] border border-transparent focus:border-[#141414] p-3 font-mono text-sm outline-none"
                        value={formData.quantity}
                        onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase opacity-50 mb-1">Unit (e.g. KG, PCS, Rolls)</label>
                      <input 
                        required
                        type="text" 
                        placeholder="PCS"
                        className="w-full bg-[#f5f5f5] border border-transparent focus:border-[#141414] p-3 font-mono text-sm outline-none uppercase"
                        value={formData.unit}
                        onChange={(e) => setFormData({...formData, unit: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase opacity-50 mb-1">Low Stock Warning Threshold</label>
                    <input 
                      required
                      type="number" 
                      className="w-full bg-[#f5f5f5] border border-transparent focus:border-[#141414] p-3 font-mono text-sm outline-none"
                      value={formData.lowStockThreshold}
                      onChange={(e) => setFormData({...formData, lowStockThreshold: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-[#eee] flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 border border-[#141414] p-4 font-mono text-sm uppercase tracking-widest hover:bg-[#f5f5f5] transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-[#141414] text-white p-4 font-mono text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-[4px_4px_0px_0px_rgba(100,100,100,0.5)]"
                  >
                    {editingItem ? 'Update Item' : 'Create Item'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
