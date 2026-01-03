
import React, { useState, useMemo } from 'react';
import { AccessLog } from '../../types';

interface LogsPageProps {
  logs: AccessLog[];
  isMasterAdmin: boolean;
}

const LogsPage: React.FC<LogsPageProps> = ({ logs, isMasterAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('all');

  // Liste unique des employés dans les logs
  const employeesList = useMemo(() => {
    const emails = Array.from(new Set(logs.map(l => l.admin_email)));
    return emails.sort();
  }, [logs]);

  // Filtrage combiné (Employé + Recherche texte)
  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const matchesEmployee = selectedEmployee === 'all' || l.admin_email === selectedEmployee;
      const matchesSearch = l.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           l.admin_email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesEmployee && matchesSearch;
    });
  }, [logs, selectedEmployee, searchTerm]);

  // Statistiques de performance basées sur les logs filtrés
  const stats = useMemo(() => {
    const targetLogs = selectedEmployee === 'all' ? logs : logs.filter(l => l.admin_email === selectedEmployee);
    
    return {
      appointmentsConfirmed: targetLogs.filter(l => l.action.toLowerCase().includes('validé le rdv')).length,
      clientsCreated: targetLogs.filter(l => l.action.toLowerCase().includes('créé une nouvelle fiche client')).length,
      invoicesHandled: targetLogs.filter(l => l.action.toLowerCase().includes('facture')).length,
      logins: targetLogs.filter(l => l.action.toLowerCase().includes('connexion')).length
    };
  }, [logs, selectedEmployee]);

  if (!isMasterAdmin) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-10">
        <i className="fa-solid fa-lock text-6xl text-gray-200 mb-6"></i>
        <h2 className="text-2xl font-serif font-bold text-gray-400">Accès Restreint</h2>
        <p className="text-gray-400 mt-2">Seul l'administrateur principal peut consulter les journaux d'audit.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 font-serif tracking-tight">Audit & Activité</h1>
          <p className="text-sm md:text-base text-gray-500 font-medium">Suivez le travail effectué par chaque membre de votre équipe.</p>
        </div>
        <div className="px-5 py-2.5 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center shadow-xl">
          <i className="fa-solid fa-shield-halved mr-2 text-[#F28C38]"></i>
          Console Master Admin
        </div>
      </div>

      {/* Cartes de Performance de l'Employé */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'RDV Confirmés', value: stats.appointmentsConfirmed, icon: 'fa-calendar-check', color: 'text-green-500', bg: 'bg-green-50' },
          { label: 'Clients Créés', value: stats.clientsCreated, icon: 'fa-user-plus', color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Factures Gérées', value: stats.invoicesHandled, icon: 'fa-file-invoice-dollar', color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Connexions', value: stats.logins, icon: 'fa-right-to-bracket', color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((s, i) => (
          <div key={i} className="admin-card p-6 flex items-center justify-between border-b-4 border-transparent hover:border-gray-200 transition-all">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-3xl font-black text-gray-900">{s.value}</p>
            </div>
            <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-xl flex items-center justify-center text-lg`}>
              <i className={`fa-solid ${s.icon}`}></i>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-card overflow-hidden">
        {/* Barre de Filtres */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input 
              type="text" 
              placeholder="Rechercher une action précise..." 
              className="pl-12 text-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-72">
            <select 
              className="font-bold text-sm bg-white"
              value={selectedEmployee}
              onChange={e => setSelectedEmployee(e.target.value)}
            >
              <option value="all">Tous les employés</option>
              {employeesList.map(email => (
                <option key={email} value={email}>{email}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table des Logs */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <tr>
                <th className="px-8 py-5">Date / Heure</th>
                <th className="px-8 py-5">Membre d'équipe</th>
                <th className="px-8 py-5">Action & Travail effectué</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white transition-all group">
                  <td className="px-8 py-6">
                    <p className="text-xs font-black text-gray-900">{new Date(log.created_at).toLocaleDateString('fr-CA')}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{new Date(log.created_at).toLocaleTimeString('fr-CA')}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black text-[10px] shadow-sm">
                        {log.admin_email.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-gray-700">{log.admin_email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        log.action.includes('validé') ? 'bg-green-500' : 
                        log.action.includes('créé') ? 'bg-blue-500' : 
                        log.action.includes('Connexion') ? 'bg-purple-500' : 'bg-gray-400'
                      }`}></div>
                      <p className="text-sm font-medium text-gray-900 leading-snug">{log.action}</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLogs.length === 0 && (
            <div className="p-20 text-center text-gray-300 italic font-serif">
              Aucun historique trouvé pour ces critères.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsPage;
