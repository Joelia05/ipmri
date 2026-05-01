import React, { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Item, StockMovement } from '../types';
import { 
  Package, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell
} from 'recharts';

export const Dashboard: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [recentMovements, setRecentMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time items
    const unsubItems = onSnapshot(collection(db, 'items'), (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item)));
      setLoading(false);
    });

    // Recent movements
    const q = query(collection(db, 'stock_movements'), orderBy('date', 'desc'), limit(5));
    const unsubMovements = onSnapshot(q, (snapshot) => {
      setRecentMovements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockMovement)));
    });

    return () => {
      unsubItems();
      unsubMovements();
    };
  }, []);

  const totalItems = items.length;
  const lowStockItems = items.filter(i => i.quantity <= i.lowStockThreshold && i.quantity > 0).length;
  const outOfStockItems = items.filter(i => i.quantity === 0).length;

  const chartData = items.slice(0, 8).map(item => ({
    name: item.name,
    stock: item.quantity,
    threshold: item.lowStockThreshold
  }));

  const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <div className="bg-white border border-[#141414] p-6 flex flex-col justify-between hover:translate-y-[-4px] transition-transform shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-mono text-[10px] uppercase opacity-50 tracking-widest mb-1">{title}</p>
          <h3 className="font-mono text-4xl font-bold">{value}</h3>
        </div>
        <div className={`p-3 border border-[#141414] ${colorClass}`}>
          <Icon size={24} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-[10px] font-mono uppercase opacity-50">
        <TrendingUp size={12} />
        <span>Live System Data</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <header>
        <h2 className="font-mono text-[11px] uppercase opacity-50 tracking-[0.3em] font-bold mb-1 italic">
          Overview / System Status
        </h2>
        <h1 className="font-sans text-5xl font-bold tracking-tight text-[#141414]">Dashboard</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Inventory Items" 
          value={totalItems} 
          icon={Package} 
          colorClass="bg-blue-100 text-blue-900"
        />
        <StatCard 
          title="Low Stock Alerts" 
          value={lowStockItems} 
          icon={AlertTriangle} 
          colorClass="bg-orange-100 text-orange-900"
        />
        <StatCard 
          title="Out of Stock" 
          value={outOfStockItems} 
          icon={AlertTriangle} 
          colorClass="bg-red-100 text-red-900"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart */}
        <div className="bg-white border border-[#141414] p-8 space-y-6">
          <div className="flex justify-between items-end border-b border-[#141414] pb-4">
            <h3 className="font-mono text-sm uppercase font-bold tracking-widest italic">Stock Levels (Top 8 Items)</h3>
            <span className="font-mono text-[10px] opacity-50">Units x Items</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  fontSize={10} 
                  fontFamily="Courier New"
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#f5f5f5' }}
                  contentStyle={{ 
                    fontFamily: 'Courier New', 
                    fontSize: '11px',
                    borderRadius: '0',
                    border: '1px solid #141414',
                    boxShadow: '4px 4px 0px 0px rgba(20,20,20,1)'
                  }}
                />
                <Bar dataKey="stock" fill="#141414">
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.stock <= entry.threshold ? '#ef4444' : '#141414'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-[#141414] p-8 space-y-6">
          <div className="flex justify-between items-end border-b border-[#141414] pb-4">
            <h3 className="font-mono text-sm uppercase font-bold tracking-widest italic">Recent Transactions</h3>
            <span className="font-mono text-[10px] opacity-50">Latest 5</span>
          </div>
          <div className="space-y-4">
            {recentMovements.length === 0 ? (
              <p className="font-mono text-xs opacity-50 p-10 text-center uppercase">No recent activity</p>
            ) : (
              recentMovements.map((mov) => (
                <div key={mov.id} className="flex items-center justify-between p-4 bg-[#f9f9f9] border border-[#eee] group hover:border-[#141414] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 border border-[#141414] ${mov.type === 'in' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {mov.type === 'in' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    </div>
                    <div>
                      <p className="font-mono text-xs font-bold uppercase truncate max-w-[150px]">
                        {mov.itemId} {/* Ideally resolve this to item name */}
                      </p>
                      <p className="font-mono text-[9px] opacity-50 uppercase">{mov.reason}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="font-mono text-sm font-bold">
                      {mov.type === 'in' ? '+' : '-'}{mov.quantity}
                    </span>
                    <span className="font-mono text-[9px] opacity-50 uppercase">
                      {mov.date?.toDate?.().toLocaleDateString() || 'Today'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
