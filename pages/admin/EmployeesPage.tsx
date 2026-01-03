
import React, { useState } from 'react';
import { Employee } from '../../types';
import { supabase } from '../../App';

interface EmployeesPageProps {
  employees: Employee[];
  onRefresh: () => void;
}

const EmployeesPage: React.FC<EmployeesPageProps> = ({ employees, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fd = new FormData(e.currentTarget);
    
    const employeeData = {
      full_name: fd.get('full_name') as string,
      email: (fd.get('email') as string).trim().toLowerCase(),
      password: fd.get('password') as string,
      role: 'admin'
    };

    try {
      if (editingEmployee) {
        const { error } = await supabase.from('employees').update(employeeData).eq('id', editingEmployee.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('employees').insert([employeeData]);
        if (error) throw error;
      }
      
      setIsModalOpen(false);
      setEditingEmployee(null);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet accès ?")) return;
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (!error) onRefresh();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 font-serif tracking-tight">Équipe</h1>
          <p className="text-sm md:text-base text-gray-400 font-medium italic mt-1">Gestion des accès administrateurs et employés.</p>
        </div>
        <button 
          onClick={() => { setEditingEmployee(null); setIsModalOpen(true); }}
          className="orange-gradient-btn text-white px-8 py-4 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 active:scale-95 transition-all shadow-xl"
        >
          <i className="fa-solid fa-user-plus"></i>
          <span>Ajouter un membre</span>
        </button>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              <tr>
                <th className="px-8 py-5">Nom complet</th>
                <th className="px-8 py-5">Identifiant (Email)</th>
                <th className="px-8 py-5">Rôle</th>
                <th className="px-8 py-5">Créé le</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.length > 0 ? employees.map(emp => (
                <tr key={emp.id} className="hover:bg-white/50 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                       <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs uppercase">
                         {emp.full_name.charAt(0)}
                       </div>
                       <p className="text-sm font-black text-gray-900">{emp.full_name}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-bold text-gray-700">{emp.email}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 uppercase">
                      ADMIN
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">
                      {new Date(emp.created_at).toLocaleDateString('fr-CA')}
                    </p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => { setEditingEmployee(emp); setIsModalOpen(true); }} 
                        className="w-8 h-8 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-blue-500 shadow-sm flex items-center justify-center"
                      >
                        <i className="fa-solid fa-pen text-xs"></i>
                      </button>
                      <button 
                        onClick={() => handleDelete(emp.id)}
                        className="w-8 h-8 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-red-500 shadow-sm flex items-center justify-center"
                      >
                        <i className="fa-solid fa-trash text-xs"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <i className="fa-solid fa-user-slash text-5xl mb-4 opacity-20"></i>
                      <p className="italic text-sm font-bold uppercase tracking-widest">Aucun employé enregistré.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">
                {editingEmployee ? 'Modifier l\'accès' : 'Nouvel employé'}
              </h2>
              <button onClick={() => { setIsModalOpen(false); setEditingEmployee(null); }} className="text-gray-300 hover:text-black transition-colors">
                <i className="fa-solid fa-xmark text-2xl"></i>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-1">
                <label>Nom complet</label>
                <input name="full_name" defaultValue={editingEmployee?.full_name} placeholder="Prénom Nom" required className="!border-gray-300" />
              </div>

              <div className="space-y-1">
                <label>Email (Identifiant)</label>
                <input name="email" type="email" defaultValue={editingEmployee?.email} placeholder="employe@ramonagepro.ca" required className="!border-gray-300" />
              </div>

              <div className="space-y-1">
                <label>Mot de passe</label>
                <input name="password" type="password" defaultValue={editingEmployee?.password} placeholder="••••••••" required className="!border-gray-300" />
              </div>

              <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl text-[10px] text-orange-700 font-bold uppercase leading-relaxed">
                <i className="fa-solid fa-circle-info mr-2"></i>
                L'employé aura accès à l'intégralité du tableau de bord admin avec ses identifiants.
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => { setIsModalOpen(false); setEditingEmployee(null); }} 
                  className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="orange-gradient-btn text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center space-x-2"
                >
                  {isSubmitting ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-save"></i>}
                  <span>{editingEmployee ? 'Mettre à jour' : 'Créer l\'accès'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;
