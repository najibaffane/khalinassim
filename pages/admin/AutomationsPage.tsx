
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Client, AutomationSettings, AppNotification } from '../../types';
import { supabase } from '../../App';

interface AutomationsPageProps {
  clients: Client[];
  settings: AutomationSettings;
  onRefresh: () => void;
}

// Helper function to calculate the next visit date based on last visit and frequency
const getNextVisitDate = (lastVisitDate: string | undefined, months: number) => {
  if (!lastVisitDate) return 'N/A';
  const date = new Date(lastVisitDate);
  date.setMonth(date.getMonth() + months);
  return date.toLocaleDateString('fr-CA');
};

const AutomationsPage: React.FC<AutomationsPageProps> = ({ clients, settings, onRefresh }) => {
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [testResult, setTestResult] = useState<{show: boolean, msg: string, success: boolean}>({show: false, msg: '', success: true});
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  
  // ACTIVATION PAR DÉFAUT
  // Fix: Provide full default object to match AutomationSettings interface and resolve the assignability error
  const [localSettings, setLocalSettings] = useState<AutomationSettings>(settings || { 
    remindersEnabled: true, 
    defaultFrequency: 6,
    businessName: '',
    emailSender: '',
    businessAddress: '',
    businessPhone: '',
    tpsNumber: '',
    tvqNumber: '',
    timezone: 'America/Montreal',
    minBookingNoticeHours: 24,
    emailTemplate: ''
  });

  useEffect(() => {
    if (settings) {
       setLocalSettings(settings);
    }
  }, [settings]);

  // Filtrer les clients qui sont réellement dus pour une relance
  const remindersDue = useMemo(() => {
    const now = new Date();
    const freq = localSettings?.defaultFrequency || 6;
    return clients.filter(c => {
      if (!c.last_visit_date || c.status === 'archived') return false;
      const last = new Date(c.last_visit_date);
      const nextDue = new Date(last);
      nextDue.setMonth(nextDue.getMonth() + (c.reminder_frequency_months || freq));
      return now >= nextDue;
    });
  }, [clients, localSettings?.defaultFrequency]);

  // Clients pour la recherche (tous les clients actifs non archivés)
  const searchableClients = useMemo(() => {
    return clients.filter(c => 
      c.status === 'active' && 
      (c.full_name.toLowerCase().includes(clientSearch.toLowerCase()) || 
       c.email.toLowerCase().includes(clientSearch.toLowerCase()))
    ).slice(0, 5);
  }, [clients, clientSearch]);

  const sendEmail = useCallback(async (client: Client, mode: 'auto' | 'manual') => {
    // Simulation d'envoi API
    await new Promise(resolve => setTimeout(resolve, 800));

    // NOTE : On ne crée plus de ligne dans 'notifications' pour les relances automatiques
    // afin de ne pas saturer l'interface de l'utilisateur.
    if (mode === 'manual') {
        setTestResult({show: true, msg: `Email envoyé à ${client.email}`, success: true});
        setTimeout(() => setTestResult({show: false, msg: '', success: true}), 3000);
    }
    
    // On pourrait ici insérer dans une table 'email_logs' à la place pour garder une trace silencieuse
    return true;
  }, [localSettings]);

  // MOTEUR D'AUTOMATISATION
  useEffect(() => {
    // Le robot tourne si activé (ou par défaut)
    if (localSettings?.remindersEnabled && remindersDue.length > 0 && !isAutoRunning) {
      const runAutoPilot = async () => {
        setIsAutoRunning(true);
        for (const client of remindersDue) {
          await sendEmail(client, 'auto');
        }
        setTimeout(() => {
          onRefresh();
          setIsAutoRunning(false);
        }, 1000);
      };
      runAutoPilot();
    }
  }, [localSettings?.remindersEnabled, remindersDue.length, isAutoRunning, sendEmail, onRefresh]);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const { error } = await supabase.from('settings').upsert({
        id: 1,
        reminders_enabled: localSettings.remindersEnabled,
        email_sender: localSettings.emailSender,
        email_template: localSettings.emailTemplate,
        default_frequency: localSettings.defaultFrequency,
        business_name: localSettings.businessName
      });
      if (error) throw error;
      setTestResult({show: true, msg: "Configuration sauvegardée.", success: true});
      onRefresh();
    } catch (err) {
      setTestResult({show: true, msg: "Erreur sauvegarde.", success: false});
    } finally {
      setIsUpdating(false);
      setTimeout(() => setTestResult({show: false, msg: '', success: true}), 3000);
    }
  };

  // FONCTION POUR FORCER L'ÉCHÉANCE MAINTENANT
  const forceDueNow = async (client: Client) => {
    const freq = client.reminder_frequency_months || localSettings.defaultFrequency || 6;
    const forceDate = new Date();
    forceDate.setMonth(forceDate.getMonth() - (freq + 1));
    const dateStr = forceDate.toISOString().split('T')[0];

    setTestResult({show: true, msg: `Mise à jour de ${client.full_name}...`, success: true});
    
    const { error } = await supabase
      .from('clients')
      .update({ last_visit_date: dateStr })
      .eq('id', client.id);

    if (!error) {
      setTestResult({show: true, msg: `${client.full_name} est maintenant éligible.`, success: true});
      onRefresh();
      setTimeout(() => setTestResult({show: false, msg: '', success: true}), 2000);
    } else {
      setTestResult({show: true, msg: "Erreur lors de la modification.", success: false});
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 font-serif tracking-tight">Centre de Relance</h1>
          <p className="text-sm md:text-base text-gray-500 font-medium italic">Gestion autonome des rappels d'entretien.</p>
        </div>
      </div>

      {testResult.show && (
        <div className={`fixed top-24 right-8 z-[100] px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl border animate-in slide-in-from-right duration-300 ${testResult.success ? 'bg-green-600 text-white border-green-400' : 'bg-red-600 text-white border-red-400'}`}>
          <div className="flex items-center space-x-3">
             <i className={`fa-solid ${testResult.success ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
             <span>{testResult.msg}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-8">
          
          {/* Status du Robot (Pleine largeur) */}
          <div className={`admin-card p-8 border-l-8 ${localSettings?.remindersEnabled ? 'border-green-500' : 'border-gray-300'} flex items-center justify-between shadow-lg`}>
             <div className="flex items-center space-x-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${localSettings?.remindersEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'} shadow-inner`}>
                   <i className={`fa-solid ${localSettings?.remindersEnabled ? 'fa-robot' : 'fa-power-off'} text-2xl`}></i>
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Système Auto-Pilot</p>
                   <p className={`text-xl font-bold ${localSettings?.remindersEnabled ? 'text-green-600' : 'text-gray-600'}`}>
                     {localSettings?.remindersEnabled ? 'Le Robot est ACTIF (Silencieux)' : 'Le Robot est en VEILLE'}
                   </p>
                </div>
             </div>
             <button 
                onClick={() => setLocalSettings({...localSettings, remindersEnabled: !localSettings.remindersEnabled})}
                className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${localSettings?.remindersEnabled ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'orange-gradient-btn text-white shadow-xl shadow-orange-500/20'}`}
             >
                {localSettings?.remindersEnabled ? 'Arrêter le robot' : 'Démarrer le robot'}
             </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Forcer une échéance */}
              <div className="admin-card p-10 space-y-6">
                <h3 className="text-xl font-bold font-serif text-gray-900">Rendre un client dû maintenant</h3>
                <p className="text-sm text-gray-500 font-medium italic -mt-4">Recherchez un client pour forcer son échéance immédiate.</p>
                
                <div className="relative">
                  <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input 
                    type="text" 
                    placeholder="Nom ou email du client..." 
                    className="pl-12"
                    value={clientSearch}
                    onChange={e => setClientSearch(e.target.value)}
                  />
                </div>

                {clientSearch && (
                  <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                    {searchableClients.map(c => (
                      <div key={c.id} className="p-4 bg-white flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="text-sm font-black text-gray-900">{c.full_name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">{c.email}</p>
                        </div>
                        <button 
                          onClick={() => forceDueNow(c)}
                          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95"
                        >
                          Forcer l'échéance
                        </button>
                      </div>
                    ))}
                    {searchableClients.length === 0 && <p className="p-6 text-center text-xs text-gray-400 italic">Aucun client trouvé.</p>}
                  </div>
                )}
              </div>

              {/* Note Technique & Aide */}
              <div className="admin-card p-10 bg-gray-50 border border-gray-100 shadow-sm">
                  <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Fonctionnement</h4>
                  <div className="space-y-4 text-xs font-bold text-gray-500 leading-relaxed">
                    <div className="p-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
                      <i className="fa-solid fa-circle-info mr-2"></i>
                      Le Robot est maintenant 100% silencieux. Il n'affiche plus de notifications pour ne pas vous déranger.
                    </div>
                    <ul className="space-y-3 list-disc ml-4">
                      <li>Les emails sont envoyés automatiquement selon vos réglages.</li>
                      <li>La liste ci-dessous montre qui est actuellement en attente de rappel.</li>
                      <li>Le bouton "Forcer" simule une date de visite ancienne pour tester l'éligibilité.</li>
                    </ul>
                  </div>
              </div>
          </div>

          {/* Formulaire de configuration */}
          <form onSubmit={handleUpdateSettings} className="admin-card p-10 space-y-8">
            <div className="flex items-center space-x-3 mb-2">
               <i className="fa-solid fa-envelope-open-text text-brand text-xl"></i>
               <h3 className="text-xl font-bold font-serif text-gray-900">Paramètres des Messages</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <label>Email d'envoi</label>
                <input 
                  type="email" 
                  value={localSettings?.emailSender || ''} 
                  onChange={e => setLocalSettings({...localSettings, emailSender: e.target.value})}
                  placeholder="votre@entreprise.ca"
                  required
                />
              </div>
              <div className="space-y-1">
                <label>Fréquence de relance par défaut</label>
                <select 
                  value={localSettings?.defaultFrequency || 6} 
                  onChange={e => setLocalSettings({...localSettings, defaultFrequency: parseInt(e.target.value)})}
                >
                  <option value="6">6 Mois (Recommandé)</option>
                  <option value="12">12 Mois (Annuel)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label>Modèle du courriel de rappel</label>
              <textarea 
                value={localSettings?.emailTemplate || ''} 
                onChange={e => setLocalSettings({...localSettings, emailTemplate: e.target.value})}
                className="h-44 resize-none font-medium leading-relaxed p-6"
              />
              <div className="flex space-x-2 mt-3">
                 <span className="text-[9px] font-black text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 uppercase">Tags : [Client], [Entreprise]</span>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isUpdating}
              className="orange-gradient-btn w-full py-5 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
            >
              {isUpdating ? 'Synchronisation...' : 'Enregistrer la configuration'}
            </button>
          </form>
        </div>
      </div>

      {/* Liste des clients actuellement éligibles (DUS) */}
      <div className="admin-card overflow-hidden shadow-sm mt-8">
        <div className="p-8 border-b border-gray-100 bg-gray-50/20 flex justify-between items-center">
          <h3 className="text-lg font-bold font-serif text-gray-900">Clients éligibles pour relance ({remindersDue.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <tr>
                <th className="px-8 py-5">Client</th>
                <th className="px-8 py-5">Dernière visite</th>
                <th className="px-8 py-5">Prochain rappel théorique</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {remindersDue.length > 0 ? remindersDue.map(c => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-gray-900">{c.full_name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{c.email}</p>
                  </td>
                  <td className="px-8 py-6">
                     <span className="text-[10px] font-black text-gray-600 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200 uppercase">
                      {c.last_visit_date}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                     <span className="text-[10px] font-black text-red-500 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100 uppercase">
                      Échu le : {getNextVisitDate(c.last_visit_date, c.reminder_frequency_months || settings?.defaultFrequency || 6)}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => { setSendingId(c.id); sendEmail(c, 'manual').then(() => { setSendingId(null); onRefresh(); }); }}
                      disabled={sendingId === c.id}
                      className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        sendingId === c.id ? 'bg-gray-100 text-gray-300' : 'bg-black text-white hover:bg-brand shadow-lg'
                      }`}
                    >
                      {sendingId === c.id ? 'Envoi...' : 'Envoyer manuel'}
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-gray-400 italic font-serif">
                    Aucun client n'est actuellement dû pour une relance.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AutomationsPage;
