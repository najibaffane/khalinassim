
import React, { useState } from 'react';
import { AutomationSettings, Service } from '../../types';
import { supabase } from '../../App';

interface SettingsPageProps {
  settings: AutomationSettings;
  setSettings: (s: AutomationSettings) => void;
  services: Service[];
  setServices: (s: Service[]) => void;
  onRefresh: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ settings, setSettings, services, setServices, onRefresh }) => {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isAddingService, setIsAddingService] = useState(false);
  const [serviceForm, setServiceForm] = useState<Partial<Service>>({ name: '', price: 0, description: '', icon: 'fa-tag' });
  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);

  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'number' ? parseInt(value) : value
    });
  };

  const handleUpdateBusinessInfo = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsUpdatingInfo(true);
    try {
      const payload = {
        id: 1,
        business_name: settings.businessName,
        business_address: settings.businessAddress,
        business_phone: settings.businessPhone,
        email_sender: settings.emailSender,
        tps_number: settings.tpsNumber,
        tvq_number: settings.tvqNumber,
        reminders_enabled: settings.remindersEnabled,
        default_frequency: settings.defaultFrequency,
        email_template: settings.emailTemplate
      };
      
      const { error } = await supabase.from('settings').upsert(payload, { onConflict: 'id' });
      if (error) throw error;
      
      alert("Informations d'entreprise sauvegardées.");
      onRefresh();
    } catch (err) {
      console.error("Settings Update Error:", err);
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setIsUpdatingInfo(false);
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.name || (serviceForm.price || 0) < 0) return;
    
    try {
      const payload = {
        name: serviceForm.name,
        price: Number(serviceForm.price),
        description: serviceForm.description,
        icon: serviceForm.icon
      };

      if (editingService) {
        const { error } = await supabase.from('services').update(payload).eq('id', editingService.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('services').insert([payload]);
        if (error) throw error;
      }
      
      setIsAddingService(false);
      setEditingService(null);
      setServiceForm({ name: '', price: 0, description: '', icon: 'fa-tag' });
      onRefresh(); 
    } catch (err) {
      console.error("Service Action Error:", err);
      alert("Erreur lors de l'enregistrement du service.");
    }
  };

  const removeService = async (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce service ?")) {
      try {
        const { error } = await supabase.from('services').delete().eq('id', id);
        if (error) throw error;
        onRefresh();
      } catch (err) {
        console.error("Service Delete Error:", err);
        alert("Erreur lors de la suppression.");
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 font-serif">Services & Configuration</h1>
        <p className="text-sm text-gray-400 font-medium italic mt-1">Personnalisez votre offre et les coordonnées de votre entreprise.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Identité Entreprise */}
        <div className="admin-card p-10 space-y-10">
          <h3 className="text-xl font-bold flex items-center space-x-3 text-gray-900 font-serif">
            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-building"></i>
            </div>
            <span>Infos Entreprise (Facturation)</span>
          </h3>
          
          <div className="space-y-6">
            <div className="space-y-1"><label>Nom d'entreprise</label><input name="businessName" value={settings.businessName || ''} onChange={handleInfoChange} /></div>
            <div className="space-y-1"><label>Adresse d'affaires</label><input name="businessAddress" value={settings.businessAddress || ''} onChange={handleInfoChange} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><label>Téléphone</label><input name="businessPhone" value={settings.businessPhone || ''} onChange={handleInfoChange} /></div>
              <div className="space-y-1"><label>Email de contact</label><input name="emailSender" value={settings.emailSender || ''} onChange={handleInfoChange} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><label>Numéro TPS</label><input name="tpsNumber" value={settings.tpsNumber || ''} onChange={handleInfoChange} /></div>
              <div className="space-y-1"><label>Numéro TVQ</label><input name="tvqNumber" value={settings.tvqNumber || ''} onChange={handleInfoChange} /></div>
            </div>
            <button 
              type="button"
              disabled={isUpdatingInfo}
              onClick={handleUpdateBusinessInfo} 
              className="w-full py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl active:scale-95 disabled:opacity-50"
            >
              {isUpdatingInfo ? 'Mise à jour...' : 'Sauvegarder les paramètres'}
            </button>
          </div>
        </div>

        {/* Liste des Services */}
        <div className="admin-card p-10 space-y-10">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center space-x-3 text-gray-900 font-serif">
              <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-list-check"></i>
              </div>
              <span>Catalogue de Services</span>
            </h3>
            <button 
              type="button"
              onClick={() => { setEditingService(null); setServiceForm({ name: '', price: 0, description: '', icon: 'fa-tag' }); setIsAddingService(true); }}
              className="w-10 h-10 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-lg flex items-center justify-center"
            >
              <i className="fa-solid fa-plus text-sm"></i>
            </button>
          </div>
          <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
            {services.length > 0 ? services.map(svc => (
              <div key={svc.id} className="p-6 bg-gray-50/50 border border-gray-100 rounded-2xl flex items-center justify-between group hover:bg-white transition-all">
                <div className="flex items-center space-x-5">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand border shadow-sm">
                    <i className={`fa-solid ${svc.icon || 'fa-tag'} text-lg`}></i>
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">{svc.name}</p>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{svc.price} $ CAD</p>
                  </div>
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    type="button"
                    onClick={() => { setEditingService(svc); setServiceForm(svc); setIsAddingService(true); }}
                    className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white flex items-center justify-center"
                  >
                    <i className="fa-solid fa-pen text-xs"></i>
                  </button>
                  <button 
                    type="button"
                    onClick={() => removeService(svc.id)}
                    className="w-9 h-9 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center"
                  >
                    <i className="fa-solid fa-trash text-xs"></i>
                  </button>
                </div>
              </div>
            )) : (
              <p className="text-center py-10 text-gray-400 italic text-sm">Aucun service défini.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal Ajout/Modif */}
      {isAddingService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-3xl font-bold font-serif mb-8 text-gray-900">{editingService ? 'Modifier' : 'Ajouter'} un Service</h3>
            <form onSubmit={handleServiceSubmit} className="space-y-6">
              <div className="space-y-1">
                <label>Nom du service</label>
                <input 
                  value={serviceForm.name}
                  onChange={e => setServiceForm({...serviceForm, name: e.target.value})}
                  placeholder="ex: Nettoyage Gouttières"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label>Tarif de base ($)</label>
                  <input 
                    type="number"
                    value={serviceForm.price}
                    onChange={e => setServiceForm({...serviceForm, price: parseFloat(e.target.value)})}
                    placeholder="150"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label>Icône visuelle</label>
                  <select 
                    value={serviceForm.icon}
                    onChange={e => setServiceForm({...serviceForm, icon: e.target.value})}
                  >
                    <option value="fa-tag">Standard</option>
                    <option value="fa-broom">Balai / Ramonage</option>
                    <option value="fa-shield-halved">Inspection / Sécurité</option>
                    <option value="fa-tools">Réparation / Outils</option>
                    <option value="fa-water">Eau / Jet</option>
                    <option value="fa-house-chimney">Cheminée</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label>Description publique</label>
                <textarea 
                  value={serviceForm.description}
                  onChange={e => setServiceForm({...serviceForm, description: e.target.value})}
                  className="h-28 resize-none"
                  placeholder="Expliquez ce que contient ce service pour vos clients..."
                />
              </div>
              <div className="flex space-x-4 pt-6">
                <button type="button" onClick={() => setIsAddingService(false)} className="flex-1 py-4 text-gray-400 font-bold">Fermer</button>
                <button type="submit" className="orange-gradient-btn flex-[2] py-4 text-white rounded-2xl font-bold shadow-xl active:scale-95">
                  {editingService ? 'Mettre à jour' : 'Créer le service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
