
import React, { useState, useMemo } from 'react';
import { Appointment, Client } from '../../types';

interface AppointmentsPageProps {
  appointments: Appointment[];
  setAppointments: (updated: Appointment[]) => void;
  clients: Client[];
  setClients: (updated: Client[]) => void;
  availability: any;
  setAvailability: (avail: any) => void;
  onConfirmAppointment: (id: string) => void;
}

const AppointmentsPage: React.FC<AppointmentsPageProps> = ({ appointments, setAppointments, clients, setClients, availability, setAvailability, onConfirmAppointment }) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'settings'>('schedule');
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUpdateStatus = (id: string, status: Appointment['status']) => {
    if (status === 'confirmed') {
      onConfirmAppointment(id);
    } else {
      const updated = appointments.map(a => a.id === id ? { ...a, status } : a);
      setAppointments(updated);
      
      if (status === 'completed') {
        const appt = appointments.find(a => a.id === id);
        if (appt) {
          const dateOnly = appt.appointment_date.split('T')[0];
          setClients(clients.map(c => c.id === appt.client_id ? { ...c, last_visit_date: dateOnly } : c));
        }
      }
    }
    setSelectedAppt(null);
  };

  const handleManualAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const clientId = formData.get('client_id') as string;
    const client = clients.find(c => c.id === clientId);

    const apptId = `man-${Date.now()}`;
    const newAppt: Appointment = {
      id: apptId,
      client_id: clientId,
      client_name: client?.full_name || 'Client Inconnu',
      appointment_date: `${formData.get('date')}T${formData.get('time')}:00`,
      status: 'pending', // On le crée pending puis on appelle onConfirm pour trigger la facture
      service_type: formData.get('service') as string,
      created_at: new Date().toISOString()
    };

    setAppointments([newAppt, ...appointments]);
    onConfirmAppointment(apptId); // Déclenche auto la facture
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-serif">Agenda & Planification</h1>
          <p className="text-sm md:text-base text-gray-500 font-medium">Gestion intelligente de votre emploi du temps.</p>
        </div>
        <div className="flex p-1.5 bg-white rounded-2xl border border-gray-100 shadow-sm w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('schedule')} 
            className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'schedule' ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black'}`}
          >
            Calendrier
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black'}`}
          >
            Disponibilité
          </button>
        </div>
      </div>

      {activeTab === 'schedule' ? (
        <div className="admin-card overflow-hidden">
          <div className="p-8 border-b border-gray-100 bg-gray-50/20 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-lg font-bold text-gray-800">Interventions à venir</h3>
            <button onClick={() => setIsModalOpen(true)} className="orange-gradient-btn text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-md hover:scale-[1.02] transition-all">
              <i className="fa-solid fa-plus"></i>
              <span>Nouveau rendez-vous</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-5">Client</th>
                  <th className="px-8 py-5">Type de Service</th>
                  <th className="px-8 py-5">Date & Heure</th>
                  <th className="px-8 py-5">État</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.length > 0 ? appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-gray-900">{appt.client_name}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200/50">{appt.service_type}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-bold text-gray-900">{new Date(appt.appointment_date).toLocaleDateString('fr-CA')}</div>
                      <div className="text-[10px] text-gray-400 font-bold">{new Date(appt.appointment_date).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        appt.status === 'confirmed' ? 'bg-green-50 text-green-600 border-green-100' : (appt.status === 'pending' ? 'bg-orange-50 text-orange-600 border-orange-100' : (appt.status === 'completed' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-red-50 text-red-600 border-red-100'))
                      }`}>
                        {appt.status === 'confirmed' ? 'Confirmé' : (appt.status === 'pending' ? 'En attente' : (appt.status === 'completed' ? 'Terminé' : 'Annulé'))}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button onClick={() => setSelectedAppt(appt)} className="w-10 h-10 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-brand transition-all flex items-center justify-center ml-auto">
                        <i className="fa-solid fa-ellipsis"></i>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-gray-400 italic text-sm">Aucun rendez-vous planifié.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="admin-card p-10 max-w-4xl">
          <h3 className="text-2xl font-bold font-serif mb-8 text-gray-900">Préférences de disponibilité</h3>
          <div className="space-y-10">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Jours d'activité</p>
              <div className="flex flex-wrap gap-2">
                {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(day => (
                  <button 
                    key={day} 
                    className={`px-6 py-3 rounded-xl text-xs font-bold border-2 transition-all ${availability.days.includes(day) ? 'bg-black text-white border-black' : 'text-gray-400 border-gray-100 hover:border-black'}`}
                    onClick={() => {
                      const newDays = availability.days.includes(day) ? availability.days.filter((d: string) => d !== day) : [...availability.days, day];
                      setAvailability({...availability, days: newDays});
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label>Heure d'ouverture</label>
                <input type="time" defaultValue="08:00" />
              </div>
              <div className="space-y-2">
                <label>Heure de fermeture</label>
                <input type="time" defaultValue="17:00" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Détails & Actions Modal */}
      {selectedAppt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-bold font-serif text-gray-900">{selectedAppt.client_name}</h3>
                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Gérer le rendez-vous</p>
              </div>
              <button onClick={() => setSelectedAppt(null)} className="text-gray-300 hover:text-black"><i className="fa-solid fa-xmark text-2xl"></i></button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <button onClick={() => handleUpdateStatus(selectedAppt.id, 'confirmed')} className="py-4 bg-black text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:opacity-90">Confirmer (Facturation Auto)</button>
              <button onClick={() => handleUpdateStatus(selectedAppt.id, 'completed')} className="py-4 bg-green-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-green-600">Marquer comme Terminé</button>
              <button onClick={() => handleUpdateStatus(selectedAppt.id, 'cancelled')} className="py-4 bg-red-50 text-red-500 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-10 shadow-2xl">
            <h2 className="text-3xl font-bold font-serif mb-8 text-gray-900">Programmer une visite</h2>
            <form onSubmit={handleManualAdd} className="space-y-6">
              <div className="space-y-1">
                <label>Client</label>
                <select name="client_id" required>
                  <option value="">Sélectionner un client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label>Date</label>
                  <input name="date" type="date" required />
                </div>
                <div className="space-y-1">
                  <label>Heure</label>
                  <input name="time" type="time" required />
                </div>
              </div>
              <div className="space-y-1">
                <label>Type de Service</label>
                <select name="service">
                  <option>Ramonage Résidentiel</option>
                  <option>Inspection Certifiée</option>
                  <option>Réparation & Maçonnerie</option>
                </select>
              </div>
              <div className="flex space-x-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-gray-400 font-bold text-sm">Annuler</button>
                <button type="submit" className="orange-gradient-btn flex-[2] py-4 text-white rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
