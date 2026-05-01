import React, { useEffect, useState } from 'react';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Item, StockMovement } from '../types';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar,
  Layers
} from 'lucide-react';

export const Reports: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubItems = onSnapshot(collection(db, 'items'), (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item)));
    });

    const unsubMov = onSnapshot(query(collection(db, 'stock_movements'), orderBy('date', 'desc')), (snapshot) => {
      setMovements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockMovement)));
      setLoading(false);
    });

    return () => { unsubItems(); unsubMov(); };
  }, []);

  const lowStockCount = items.filter(i => i.quantity <= i.lowStockThreshold && i.quantity > 0).length;
  const totalValue = items.length; // Just a placeholder count

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 print:hidden">
        <div>
          <h2 className="font-mono text-[11px] uppercase opacity-50 tracking-[0.3em] font-bold mb-1 italic">
            Intelligence / Auditing
          </h2>
          <h1 className="font-sans text-5xl font-bold tracking-tight text-[#141414]">Reports</h1>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-[#141414] text-white px-6 py-3 font-mono uppercase text-sm tracking-widest hover:translate-y-[-2px] transition-all shadow-[4px_4px_0px_0px_rgba(100,100,100,0.5)]"
        >
          <Printer size={18} />
          Print Report
        </button>
      </header>

      {/* Report View */}
      <div className="bg-white border border-[#141414] p-10 space-y-12 print:border-none print:p-0">
        <div className="flex justify-between border-b border-[#141414] pb-6 items-end">
          <div className="space-y-1">
            <h2 className="font-mono text-2xl font-black uppercase italic tracking-tighter">IPMRI INVENTORY AUDIT</h2>
            <p className="font-mono text-[10px] uppercase opacity-50 font-bold">Iriga Plastic Manufacturing & Recycling Industries</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] uppercase opacity-50">Report Generated</p>
            <p className="font-mono text-sm font-bold">{new Date().toLocaleString()}</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <p className="font-mono text-[10px] uppercase opacity-50 mb-1">Total SKUCount</p>
            <p className="font-mono text-2xl font-bold border-l-2 border-[#141414] pl-3">{items.length}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase opacity-50 mb-1">Low Stock Warning</p>
            <p className="font-mono text-2xl font-bold border-l-2 border-[#141414] pl-3 text-orange-600">{lowStockCount}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase opacity-50 mb-1">Movement Count (30d)</p>
            <p className="font-mono text-2xl font-bold border-l-2 border-[#141414] pl-3">{movements.length}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase opacity-50 mb-1">System Health</p>
            <p className="font-mono text-2xl font-bold border-l-2 border-[#141414] pl-3 text-green-600">OPTIMIZED</p>
          </div>
        </div>

        {/* Inventory Summary Table */}
        <div className="space-y-4">
          <h3 className="font-mono text-[12px] font-bold uppercase tracking-widest bg-[#f5f5f5] p-2 inline-block">Table 01: Low Stock Inventory Summary</h3>
          <table className="w-full text-left font-mono text-[11px] border-collapse">
            <thead className="bg-[#141414] text-white">
              <tr>
                <th className="p-3 uppercase">Item Name</th>
                <th className="p-3 uppercase">ID</th>
                <th className="p-3 uppercase text-right">In Stock</th>
                <th className="p-3 uppercase text-right">Threshold</th>
                <th className="p-3 uppercase text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.filter(i => i.quantity <= i.lowStockThreshold).map(item => (
                <tr key={item.id} className="border-b border-[#eee]">
                  <td className="p-3 font-bold">{item.name}</td>
                  <td className="p-3 opacity-50">{item.id.substring(0,8)}</td>
                  <td className="p-3 text-right font-bold">{item.quantity}</td>
                  <td className="p-3 text-right opacity-50">{item.lowStockThreshold}</td>
                  <td className="p-3 text-center">
                    <span className="text-[9px] font-bold">{item.quantity === 0 ? 'CRITICAL' : 'WARNING'}</span>
                  </td>
                </tr>
              ))}
              {items.filter(i => i.quantity <= i.lowStockThreshold).length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center opacity-40">No low stock items detected. All systems green.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Movement Summary Table */}
        <div className="space-y-4">
          <h3 className="font-mono text-[12px] font-bold uppercase tracking-widest bg-[#f5f5f5] p-2 inline-block">Table 02: Recent Movement History (Top 20)</h3>
          <table className="w-full text-left font-mono text-[11px] border-collapse">
            <thead className="bg-[#141414] text-white">
              <tr>
                <th className="p-3 uppercase">Timestamp</th>
                <th className="p-3 uppercase">Type</th>
                <th className="p-3 uppercase">Item</th>
                <th className="p-3 uppercase text-right">Qty</th>
                <th className="p-3 uppercase">Authorized By</th>
              </tr>
            </thead>
            <tbody>
              {movements.slice(0, 20).map(mov => (
                <tr key={mov.id} className="border-b border-[#eee]">
                  <td className="p-3 opacity-50">{mov.date?.toDate?.().toLocaleString() || 'N/A'}</td>
                  <td className={`p-3 font-bold ${mov.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                    STOCK {mov.type.toUpperCase()}
                  </td>
                  <td className="p-3">{items.find(i => i.id === mov.itemId)?.name || mov.itemId}</td>
                  <td className="p-3 text-right font-bold">{mov.quantity}</td>
                  <td className="p-3 opacity-50">{mov.userName || 'System'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-[#141414] pt-6 flex justify-between items-center opacity-30 font-mono text-[10px]">
          <p className="uppercase">Official IPMRI System Resource - Non Confidential Internal Audit</p>
          <p className="uppercase">Page 01 of 01</p>
        </div>
      </div>
    </div>
  );
};
