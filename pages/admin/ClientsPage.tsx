
import React, { useState, useMemo } from 'react';
import { Client } from '../../types';
import { supabase } from '../../App';

interface ClientsPageProps {
  clients: Client[];
  setClients: () => void;
  logActivity: (action: string) => void;
}

const ClientsPage: React.FC<ClientsPageProps> = ({ clients, setClients, logActivity }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => 
    clients.filter(c => c.status !== 'archived' && (
      c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  , [clients, searchTerm]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const clientData = {
      full_name: fd.get('full_name') as string,
      email: fd.get('email') as string,
      phone: fd.get('phone') as string,
      address: fd.get('address') as string,
    };

    if (editingClient) {
      await supabase.from('clients').update(clientData).eq('id', editingClient.id);
      await logActivity(`A modifié les informations du client: ${clientData.full_name}`);
    } else {
      await supabase.from('clients').insert([clientData]);
      await logActivity(`A créé une nouvelle fiche client: ${clientData.full_name}`);
    }
    
    setIsModalOpen(false);
    setClients();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-900 font-serif">Fichier Clients</h1>
        <button onClick={() => { setEditingClient(null); setIsModalOpen(true); }} className="orange-gradient-btn text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-xl">+ Nouveau Client</button>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/20">
          <input 
            type="text" 
            placeholder="Rechercher un client..." 
            className="max-w-md"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <tr>
                <th className="px-8 py-5">Nom</th>
                <th className="px-8 py-5">Coordonnées</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-white transition-all">
                  <td className="px-8 py-6 font-black text-gray-900">{c.full_name}</td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-bold text-gray-500">{c.email}</p>
                    <p className="text-[10px] text-gray-400">{c.phone}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => { setEditingClient(c); setIsModalOpen(true); }} className="text-brand font-bold text-xs">Modifier</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-300">
            <h2 className="text-2xl font-bold font-serif mb-6">{editingClient ? 'Modifier Client' : 'Nouveau Client'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <input name="full_name" defaultValue={editingClient?.full_name} placeholder="Nom Complet" required />
              <input name="email" type="email" defaultValue={editingClient?.email} placeholder="Email" required />
              <input name="phone" defaultValue={editingClient?.phone} placeholder="Téléphone" />
              <input name="address" defaultValue={editingClient?.address} placeholder="Adresse" />
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 font-bold text-gray-400">Annuler</button>
                <button type="submit" className="orange-gradient-btn flex-1 py-4 text-white rounded-2xl font-bold shadow-xl">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
