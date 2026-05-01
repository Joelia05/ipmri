import React, { useEffect, useState } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp,
  increment,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Item, StockMovement as StockMovementType } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  History,
  Plus
} from 'lucide-react';

export const StockMovement: React.FC = () => {
  const { profile } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [history, setHistory] = useState<StockMovementType[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    itemId: '',
    type: 'in' as 'in' | 'out',
    quantity: 0,
    reason: ''
  });

  useEffect(() => {
    const unsubItems = onSnapshot(collection(db, 'items'), (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item)));
    });

    const q = query(collection(db, 'stock_movements'), orderBy('date', 'desc'), limit(15));
    const unsubHistory = onSnapshot(q, (snapshot) => {
      setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockMovementType)));
      setLoading(false);
    });

    return () => {
      unsubItems();
      unsubHistory();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.quantity <= 0) return alert('Quantity must be positive');
    
    try {
      const selectedItem = items.find(i => i.id === formData.itemId);
      if (!selectedItem) return;

      if (formData.type === 'out' && selectedItem.quantity < formData.quantity) {
        return alert('Insufficient stock');
      }

      // 1. Create movement record
      await addDoc(collection(db, 'stock_movements'), {
        ...formData,
        userId: profile?.uid,
        userName: profile?.name,
        date: serverTimestamp()
      });

      // 2. Update item quantity
      const adjustment = formData.type === 'in' ? formData.quantity : -formData.quantity;
      await updateDoc(doc(db, 'items', formData.itemId), {
        quantity: increment(adjustment)
      });

      setFormData({ itemId: '', type: 'in', quantity: 0, reason: '' });
      alert('Stock updated successfully');
    } catch (err) {
      console.error(err);
      alert('Error recording movement');
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="font-mono text-[11px] uppercase opacity-50 tracking-[0.3em] font-bold mb-1 italic">
          Operations / Logistics
        </h2>
        <h1 className="font-sans text-5xl font-bold tracking-tight text-[#141414]">Stock Movement</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Entry Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-[#141414] p-8 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            <h3 className="font-mono text-sm uppercase font-bold tracking-[0.2em] italic mb-6 border-b border-[#141414] pb-2">Record Transaction</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] uppercase opacity-50 mb-1">Target Item</label>
                <select 
                  required
                  className="w-full bg-[#f5f5f5] border border-transparent focus:border-[#141414] p-3 font-mono text-sm outline-none"
                  value={formData.itemId}
                  onChange={(e) => setFormData({...formData, itemId: e.target.value})}
                >
                  <option value="">Select Item</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>{item.name} ({item.quantity} {item.unit})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase opacity-50 mb-1">Movement Type</label>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, type: 'in'})}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 font-mono text-[10px] uppercase tracking-widest border border-[#141414] transition-all ${
                      formData.type === 'in' ? 'bg-green-100 text-green-900 border-green-900' : 'bg-white opacity-50'
                    }`}
                  >
                    <ArrowUpRight size={14} /> Stock In
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, type: 'out'})}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 font-mono text-[10px] uppercase tracking-widest border border-[#141414] transition-all ${
                      formData.type === 'out' ? 'bg-red-100 text-red-900 border-red-900' : 'bg-white opacity-50'
                    }`}
                  >
                    <ArrowDownRight size={14} /> Stock Out
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase opacity-50 mb-1">Quantity</label>
                <input 
                  required
                  type="number" 
                  className="w-full bg-[#f5f5f5] border border-transparent focus:border-[#141414] p-3 font-mono text-sm outline-none"
                  placeholder="0"
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase opacity-50 mb-1">Reference / Reason</label>
                <textarea 
                  required
                  rows={3}
                  className="w-full bg-[#f5f5f5] border border-transparent focus:border-[#141414] p-3 font-mono text-sm outline-none resize-none"
                  placeholder="e.g. Purchase Invoice #123, Production Usage..."
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-[#141414] text-white p-4 font-mono text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-[4px_4px_0px_0px_rgba(100,100,100,0.5)] mt-4"
              >
                Execute Transaction
              </button>
            </form>
          </div>
        </div>

        {/* History List */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-[#141414] p-8 min-h-[400px]">
            <div className="flex items-center gap-2 border-b border-[#141414] pb-2 mb-6">
              <History size={18} className="opacity-50" />
              <h3 className="font-mono text-sm uppercase font-bold tracking-[0.2em] italic">Transaction Logs</h3>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="p-20 text-center font-mono text-xs opacity-50 animate-pulse">Loading Logs...</div>
              ) : history.length === 0 ? (
                <div className="p-20 text-center font-mono text-xs opacity-50 italic">No transactions recorded yet.</div>
              ) : (
                history.map((mov) => {
                  const item = items.find(i => i.id === mov.itemId);
                  return (
                    <div key={mov.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border-b border-[#eee] hover:bg-[#fcfcfc] transition-colors items-center">
                      <div className="md:col-span-1">
                        <span className={`inline-flex items-center gap-1 font-mono text-[9px] font-bold uppercase px-2 py-0.5 border ${
                          mov.type === 'in' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {mov.type === 'in' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                          STOCK {mov.type}
                        </span>
                        <p className="font-mono text-[9px] opacity-40 uppercase mt-1">
                          {mov.date?.toDate?.().toLocaleString() || 'Recent'}
                        </p>
                      </div>
                      <div className="md:col-span-1">
                        <p className="font-bold text-sm truncate">{item?.name || 'Unknown Item'}</p>
                        <p className="font-mono text-[9px] opacity-50 uppercase">Item ID: {mov.itemId.substring(0, 8)}</p>
                      </div>
                      <div className="md:col-span-1">
                        <p className="font-mono text-xs text-center md:text-left">
                          <span className="font-bold underline">Qty: {mov.quantity}</span> {item?.unit}
                        </p>
                      </div>
                      <div className="md:col-span-1 text-right">
                        <p className="font-mono text-[10px] opacity-60 uppercase">{mov.reason}</p>
                        <p className="font-mono text-[9px] opacity-30 uppercase">BY: {mov.userName || 'System'}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
