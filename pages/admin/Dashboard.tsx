
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Client, Appointment, Invoice, AutomationSettings } from '../../types';

interface DashboardProps {
  clients: Client[];
  appointments: Appointment[];
  invoices: Invoice[];
  setAppointments: (updated: Appointment[]) => void;
  setClients: (updated: Client[]) => void;
  onConfirmAppointment: (id: string) => void;
  settings: AutomationSettings;
}

const Dashboard: React.FC<DashboardProps> = ({ clients, appointments, invoices, setAppointments, setClients, onConfirmAppointment, settings }) => {
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const activeClients = clients.filter(c => c.status === 'active').length;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // RDV ce mois
    const apptsThisMonth = appointments.filter(a => {
      const d = new Date(a.appointment_date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;
    
    // Profit réel (Factures payées)
    const revenueThisMonth = invoices
      .filter(i => {
        const d = new Date(i.created_at);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && i.status === 'paid';
      })
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
    
    // Rappels dus
    const reminders = clients.filter(c => {
      if (!c.last_visit_date) return false;
      const last = new Date(c.last_visit_date);
      const nextDue = new Date(last);
      nextDue.setMonth(nextDue.getMonth() + (c.reminder_frequency_months || settings.defaultFrequency));
      return now >= nextDue;
    }).length;

    return { activeClients, apptsThisMonth, revenueThisMonth, reminders };
  }, [clients, appointments, invoices, settings.defaultFrequency]);

  const barData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        month: d.toLocaleDateString('fr-CA', { month: 'short' }),
        rdv: appointments.filter(a => {
          const ad = new Date(a.appointment_date);
          return ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear();
        }).length
      });
    }
    return months;
  }, [appointments]);

  const lineData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        month: d.toLocaleDateString('fr-CA', { month: 'short' }),
        profit: invoices.filter(inv => {
          const id = new Date(inv.created_at);
          return id.getMonth() === d.getMonth() && id.getFullYear() === d.getFullYear() && inv.status === 'paid';
        }).reduce((s, c) => s + Number(c.amount), 0)
      });
    }
    return months;
  }, [invoices]);

  const upcoming = useMemo(() => 
    appointments
      .filter(a => new Date(a.appointment_date) >= new Date() && a.status !== 'cancelled')
      .sort((a,b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
      .slice(0, 4)
  , [appointments]);

  const handleUpdateStatus = (id: string, status: Appointment['status']) => {
    if (status === 'confirmed') {
      onConfirmAppointment(id);
    } else {
      // Pour les autres statuts, on pourrait ajouter un appel Supabase direct ici
      // Mais on laisse handleConfirmAppointment gérer le plus critique
    }
    setSelectedAppt(null);
  };

  const getInvoiceForAppt = (apptId: string) => {
    return invoices.find(inv => inv.appointment_id === apptId);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 font-serif tracking-tight">Vue d'ensemble</h1>
          <p className="text-sm md:text-base text-gray-500 font-medium">Suivi financier et opérationnel en temps réel.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Clients actifs', value: stats.activeClients, icon: 'fa-user-group', color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'RDV ce mois', value: stats.apptsThisMonth, icon: 'fa-calendar', color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Profit réel ($)', value: stats.revenueThisMonth.toFixed(2), icon: 'fa-dollar-sign', color: 'text-green-500', bg: 'bg-green-50' },
          { label: 'Rappels dus', value: stats.reminders, icon: 'fa-bell', color: 'text-red-500', bg: 'bg-red-50' },
        ].map((card, i) => (
          <div key={i} className="admin-card p-8 flex items-center justify-between group hover:shadow-lg transition-all">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{card.label}</p>
              <p className="text-2xl md:text-3xl font-black text-gray-900">{card.value}</p>
            </div>
            <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}>
              <i className={`fa-solid ${card.icon}`}></i>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 admin-card p-10">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-10">Courbe des revenus encaissés</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lineData}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F28C38" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#F28C38" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af', fontWeight: 800}} />
                <Tooltip cursor={{fill: '#fcfcfc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="profit" stroke="#F28C38" strokeWidth={4} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 admin-card p-10 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-10">Volume d'interventions</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af', fontWeight: 800}} />
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none'}} />
                  <Bar dataKey="rdv" fill="#000" radius={[6, 6, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-100 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Intervention (Annuel)</p>
            <p className="text-4xl font-black text-gray-900 tracking-tighter">{appointments.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="admin-card p-10">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-8">Prochaines visites</h3>
          <div className="space-y-4">
            {upcoming.length > 0 ? upcoming.map(a => (
              <div 
                key={a.id} 
                onClick={() => setSelectedAppt(a)}
                className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-100 cursor-pointer hover:bg-white hover:shadow-xl transition-all group"
              >
                <div>
                  <p className="text-base font-bold text-gray-900">{a.client_name}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{a.service_type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">{new Date(a.appointment_date).toLocaleDateString('fr-CA')}</p>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${a.status === 'confirmed' ? 'text-green-500' : 'text-orange-500'}`}>
                    {a.status === 'confirmed' ? 'CONFIRMÉ' : 'EN ATTENTE'}
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-400 italic text-center py-10">Aucun rendez-vous à venir.</p>
            )}
          </div>
        </div>
        
        <div className="admin-card p-10 flex flex-col items-center justify-center text-center">
           <i className="fa-solid fa-check-double text-5xl text-brand mb-6"></i>
           <p className="text-xl font-serif font-bold text-gray-800 mb-2">Opérations Optimales</p>
           <p className="text-sm text-gray-500 font-medium max-w-xs">Votre base de données est synchronisée avec Supabase Cloud.</p>
        </div>
      </div>

      {selectedAppt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative animate-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-bold font-serif text-gray-900">{selectedAppt.client_name}</h3>
                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Détails rapides</p>
              </div>
              <button onClick={() => setSelectedAppt(null)} className="text-gray-300 hover:text-black transition-colors"><i className="fa-solid fa-xmark text-2xl"></i></button>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase">Service</span>
                <span className="text-sm font-bold text-gray-900">{selectedAppt.service_type}</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase">Statut</span>
                <span className={`text-xs font-black uppercase ${selectedAppt.status === 'confirmed' ? 'text-green-500' : 'text-orange-500'}`}>{selectedAppt.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {selectedAppt.status !== 'confirmed' ? (
                <button 
                  onClick={() => handleUpdateStatus(selectedAppt.id, 'confirmed')}
                  className="w-full py-4 bg-black text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-xl"
                >
                  Confirmer (Générer Facture)
                </button>
              ) : (
                <div className="space-y-3">
                   <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-center space-x-2">
                     <i className="fa-solid fa-circle-check text-green-500"></i>
                     <span className="text-xs font-black uppercase text-green-600">Visite confirmée</span>
                   </div>
                   {getInvoiceForAppt(selectedAppt.id) && (
                     <button 
                        onClick={() => navigate('/admin/invoices')}
                        className="w-full py-4 border-2 border-brand text-brand rounded-2xl font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center space-x-2"
                     >
                       <i className="fa-solid fa-file-invoice-dollar"></i>
                       <span>Gérer la facture</span>
                     </button>
                   )}
                </div>
              )}
              <button onClick={() => setSelectedAppt(null)} className="w-full py-4 text-gray-400 font-bold text-xs uppercase">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
