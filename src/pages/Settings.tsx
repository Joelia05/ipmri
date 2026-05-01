import React, { useEffect, useState } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Category, UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Trash2, 
  ShieldCheck, 
  UserPlus, 
  Tags,
  Users
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { isAdmin } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [newCat, setNewCat] = useState('');

  useEffect(() => {
    const unsubCats = onSnapshot(collection(db, 'categories'), (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    });

    if (isAdmin) {
      const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
      });
      return () => { unsubCats(); unsubUsers(); };
    }

    return () => unsubCats();
  }, [isAdmin]);

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    await addDoc(collection(db, 'categories'), { name: newCat });
    setNewCat('');
  };

  const deleteCategory = async (id: string) => {
    if (confirm('Delete category?')) {
      await deleteDoc(doc(db, 'categories', id));
    }
  };

  const updateUserRole = async (uid: string, role: string) => {
    await updateDoc(doc(db, 'users', uid), { role });
  };

  return (
    <div className="space-y-12">
      <header>
        <h2 className="font-mono text-[11px] uppercase opacity-50 tracking-[0.3em] font-bold mb-1 italic">
          System / Configuration
        </h2>
        <h1 className="font-sans text-5xl font-bold tracking-tight text-[#141414]">Settings</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Categories Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b-2 border-[#141414] pb-2">
            <Tags size={20} />
            <h3 className="font-mono text-lg uppercase font-bold tracking-widest italic">Item Categories</h3>
          </div>
          
          <form onSubmit={addCategory} className="flex gap-2">
            <input 
              type="text" 
              placeholder="NEW CATEGORY NAME..."
              className="flex-1 bg-white border border-[#141414] p-3 font-mono text-sm uppercase outline-none focus:bg-[#f0f0f0]"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
            />
            <button 
              type="submit"
              className="bg-[#141414] text-white px-6 font-mono text-sm uppercase font-bold hover:bg-opacity-90"
            >
              ADD
            </button>
          </form>

          <div className="space-y-2">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-4 bg-white border border-[#eee] hover:border-[#141414] transition-colors group">
                <span className="font-mono text-sm uppercase tracking-tight">{cat.name}</span>
                <button 
                  onClick={() => deleteCategory(cat.id)}
                  className="p-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Users Section (Admin Only) */}
        {isAdmin && (
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b-2 border-[#141414] pb-2">
              <Users size={20} />
              <h3 className="font-mono text-lg uppercase font-bold tracking-widest italic">User Management</h3>
            </div>

            <div className="space-y-2">
              {users.map(user => (
                <div key={user.uid} className="p-4 bg-white border border-[#eee] hover:border-[#141414] transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold">{user.name}</p>
                      <p className="font-mono text-[10px] opacity-50 uppercase">{user.email}</p>
                    </div>
                    <span className={`font-mono text-[9px] uppercase px-2 py-0.5 border ${
                      user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      user.role === 'manager' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  
                  <div className="flex gap-2 mt-4 pt-4 border-t border-[#f5f5f5]">
                    <span className="font-mono text-[9px] uppercase opacity-40 flex items-center gap-1">
                      <ShieldCheck size={10} /> Assign Role:
                    </span>
                    {['staff', 'manager', 'admin'].map(role => (
                      <button
                        key={role}
                        onClick={() => updateUserRole(user.uid, role)}
                        disabled={user.role === role}
                        className={`font-mono text-[9px] uppercase px-2 py-1 transition-all ${
                          user.role === role 
                          ? 'bg-[#141414] text-white' 
                          : 'bg-[#eee] hover:bg-[#ddd]'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
