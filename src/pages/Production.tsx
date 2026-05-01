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
import { Item, ProductionLog as ProductionLogType } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Factory, 
  AlertCircle, 
  ChevronRight, 
  Plus, 
  Minus,
  CheckCircle2
} from 'lucide-react';

export const Production: React.FC = () => {
  const { profile } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [logs, setLogs] = useState<ProductionLogType[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [rawSelection, setRawSelection] = useState<{itemId: string, quantity: number}[]>([]);
  const [goodSelection, setGoodSelection] = useState<{itemId: string, quantity: number}[]>([]);

  useEffect(() => {
    const unsubItems = onSnapshot(collection(db, 'items'), (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item)));
    });

    const q = query(collection(db, 'production_logs'), orderBy('date', 'desc'), limit(10));
    const unsubLogs = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductionLogType)));
      setLoading(false);
    });

    return () => {
      unsubItems();
      unsubLogs();
    };
  }, []);

  const addIngredient = () => setRawSelection([...rawSelection, { itemId: '', quantity: 0 }]);
  const addOutput = () => setGoodSelection([...goodSelection, { itemId: '', quantity: 0 }]);

  const updateSelection = (type: 'raw' | 'good', index: number, field: string, value: any) => {
    const setter = type === 'raw' ? setRawSelection : setGoodSelection;
    const current = type === 'raw' ? rawSelection : goodSelection;
    const updated = [...current];
    updated[index] = { ...updated[index], [field]: value };
    setter(updated);
  };

  const removeRow = (type: 'raw' | 'good', index: number) => {
    const setter = type === 'raw' ? setRawSelection : setGoodSelection;
    const current = type === 'raw' ? rawSelection : goodSelection;
    setter(current.filter((_, i) => i !== index));
  };

  const handleProduction = async () => {
    if (rawSelection.length === 0 || goodSelection.length === 0) return alert('Add materials and output');
    const hasEmpty = rawSelection.some(r => !r.itemId || r.quantity <= 0) || 
                     goodSelection.some(g => !g.itemId || g.quantity <= 0);
    if (hasEmpty) return alert('Complete all fields with valid quantities');

    try {
      // 1. Log Production Transaction
      await addDoc(collection(db, 'production_logs'), {
        rawMaterials: rawSelection,
        finishedGoods: goodSelection,
        userId: profile?.uid,
        date: serverTimestamp()
      });

      // 2. Adjust Inventories
      for (const raw of rawSelection) {
        await updateDoc(doc(db, 'items', raw.itemId), {
          quantity: increment(-raw.quantity)
        });
      }
      for (const good of goodSelection) {
        await updateDoc(doc(db, 'items', good.itemId), {
          quantity: increment(good.quantity)
        });
      }

      setRawSelection([]);
      setGoodSelection([]);
      alert('Production Run Logged Successfully');
    } catch (err) {
      console.error(err);
      alert('Error during production run');
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="font-mono text-[11px] uppercase opacity-50 tracking-[0.3em] font-bold mb-1 italic">
          Manufacturing / Workflow
        </h2>
        <h1 className="font-sans text-5xl font-bold tracking-tight text-[#141414]">Production</h1>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Work Area */}
          <div className="bg-white border border-[#141414] p-8 space-y-8 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            <h3 className="font-mono text-sm uppercase font-bold tracking-[0.2em] italic mb-6 border-b border-[#141414] pb-2">New Production Batch</h3>

            {/* Raw materials */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-mono text-[11px] uppercase font-bold text-red-600">Raw Materials (Consumption)</h4>
                <button onClick={addIngredient} className="text-[10px] font-mono uppercase bg-[#141414] text-white px-2 py-1 flex items-center gap-1">
                  <Plus size={10} /> Add Item
                </button>
              </div>
              {rawSelection.map((row, idx) => (
                <div key={idx} className="flex gap-2">
                  <select 
                    className="flex-1 bg-[#f5f5f5] p-3 font-mono text-xs border-none outline-none"
                    value={row.itemId}
                    onChange={(e) => updateSelection('raw', idx, 'itemId', e.target.value)}
                  >
                    <option value="">Select Raw Material</option>
                    {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.quantity} {i.unit})</option>)}
                  </select>
                  <input 
                    type="number" 
                    placeholder="Qty"
                    className="w-24 bg-[#f5f5f5] p-3 font-mono text-xs border-none outline-none"
                    value={row.quantity || ''}
                    onChange={(e) => updateSelection('raw', idx, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                  <button onClick={() => removeRow('raw', idx)} className="p-3 text-red-500"><Minus size={16} /></button>
                </div>
              ))}
            </div>

            <div className="flex justify-center text-[#141414] opacity-20">
              <ChevronRight size={32} className="rotate-90 md:rotate-0" />
            </div>

            {/* Finished Goods */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-mono text-[11px] uppercase font-bold text-green-600">Finished Goods (Output)</h4>
                <button onClick={addOutput} className="text-[10px] font-mono uppercase bg-[#141414] text-white px-2 py-1 flex items-center gap-1">
                  <Plus size={10} /> Add Item
                </button>
              </div>
              {goodSelection.map((row, idx) => (
                <div key={idx} className="flex gap-2">
                  <select 
                    className="flex-1 bg-[#f5f5f5] p-3 font-mono text-xs border-none outline-none"
                    value={row.itemId}
                    onChange={(e) => updateSelection('good', idx, 'itemId', e.target.value)}
                  >
                    <option value="">Select Finished Product</option>
                    {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                  <input 
                    type="number" 
                    placeholder="Qty"
                    className="w-24 bg-[#f5f5f5] p-3 font-mono text-xs border-none outline-none"
                    value={row.quantity || ''}
                    onChange={(e) => updateSelection('good', idx, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                  <button onClick={() => removeRow('good', idx)} className="p-3 text-red-500"><Minus size={16} /></button>
                </div>
              ))}
            </div>

            <button 
              onClick={handleProduction}
              className="w-full bg-[#141414] text-white p-6 font-mono font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:opacity-90"
            >
              <Factory size={20} />
              Process Production Run
            </button>
          </div>
        </div>

        {/* Audit Trail */}
        <div className="space-y-6">
          <div className="bg-white border border-[#141414] p-8 h-full">
            <h3 className="font-mono text-sm uppercase font-bold tracking-[0.2em] italic mb-6 border-b border-[#141414] pb-2">Production Logs</h3>
            <div className="space-y-6">
              {loading ? (
                <div className="p-20 text-center font-mono text-xs opacity-50 animate-pulse">Scanning Logs...</div>
              ) : logs.length === 0 ? (
                <div className="p-20 text-center font-mono text-xs opacity-50">No production runs recorded.</div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="border-l-4 border-[#141414] pl-4 py-2 space-y-2 group">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[10px] font-bold bg-[#141414] text-white px-2 py-0.5 uppercase tracking-widest">RUN #{log.id.substring(0,6)}</span>
                      <span className="font-mono text-[9px] opacity-40">{log.date?.toDate?.().toLocaleString() || 'Just now'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-[11px] font-mono">
                      <div>
                        <p className="opacity-50 uppercase mb-1">Consumption</p>
                        {log.rawMaterials.map((r, i) => (
                           <p key={i} className="truncate truncate-w-full">
                             {r.quantity} {items.find(it => it.id === r.itemId)?.name}
                           </p>
                        ))}
                      </div>
                      <div>
                        <p className="opacity-50 uppercase mb-1">Output</p>
                        {log.finishedGoods.map((g, i) => (
                           <p key={i} className="text-green-700 font-bold truncate truncate-w-full">
                             +{g.quantity} {items.find(it => it.id === g.itemId)?.name}
                           </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
