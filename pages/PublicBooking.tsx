
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Service } from '../types';

interface PublicBookingProps {
  onBookingSubmit: (data: any) => Promise<boolean>;
  services: Service[];
}

const PublicBooking: React.FC<PublicBookingProps> = ({ onBookingSubmit, services }) => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    phone: '',
    adresse: '',
    notes: '',
    service: '',
    date: '',
    time: ''
  });

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const padding = firstDay === 0 ? 6 : firstDay - 1;
    const days = [];
    for (let i = 0; i < padding; i++) days.push(null);
    for (let d = 1; d <= totalDays; d++) days.push(new Date(year, month, d));
    return days;
  }, [currentMonth]);

  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

  const handleMonthChange = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const handleDateSelect = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setFormData({ ...formData, date: dateStr, time: '' });
    setShowTimeSlots(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.service || !formData.date || !formData.time) return;
    const success = await onBookingSubmit({
      full_name: `${formData.prenom} ${formData.nom}`,
      email: formData.email,
      phone: formData.phone,
      service: formData.service,
      date: formData.date,
      time: formData.time,
      adresse: formData.adresse
    });
    if (success) navigate('/confirmation');
  };

  return (
    <div className="min-h-screen bg-[#e2e0dd] font-inter text-gray-900 pb-20 pt-32 relative overflow-hidden">
      
      {/* DECORATIVE ELEMENTS - SAME AS SERVICES SECTION */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#F28C38]/15 rounded-full blur-[150px] -z-0 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-300/10 rounded-full blur-[120px] -z-0"></div>
      
      <Navbar />

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <p className="text-[#F28C38] font-black text-[10px] uppercase tracking-[0.5em] mb-4">Planification en ligne</p>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-4 tracking-tight">Réserver une visite</h1>
          <div className="w-20 h-1 bg-[#F28C38] mx-auto opacity-30 rounded-full"></div>
        </div>

        <form onSubmit={handleSubmit} className="relative">
          {/* MAIN GLASS CONTAINER */}
          <div className="bg-white/30 backdrop-blur-3xl rounded-[3rem] border border-white/50 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden">
            
            <div className="grid grid-cols-1 lg:grid-cols-12">
              
              {/* LEFT SIDE: DATE & SERVICE SELECTION */}
              <div className="lg:col-span-5 p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-white/40">
                <div className="space-y-10">
                  
                  {/* Service Selection Styled */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[#F28C38] flex items-center justify-center text-white text-xs">
                        <i className="fa-solid fa-list-check"></i>
                      </div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">Étape 1: Service</h3>
                    </div>
                    <select 
                      required 
                      className="w-full !bg-white/40 !backdrop-blur-md !border-white/60 text-gray-900 font-bold" 
                      value={formData.service} 
                      onChange={e => setFormData({...formData, service: e.target.value})}
                    >
                      <option value="">Choisir une prestation</option>
                      {services.map(s => <option key={s.id} value={s.name}>{s.name} — à partir de {s.price}$</option>)}
                    </select>
                  </div>

                  {/* Calendar Widget Styled */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[#F28C38] flex items-center justify-center text-white text-xs">
                        <i className="fa-solid fa-calendar-day"></i>
                      </div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">Étape 2: Date</h3>
                    </div>
                    
                    <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-[2rem] p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                         <button type="button" onClick={() => handleMonthChange(-1)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#F28C38] hover:text-white transition-all"><i className="fa-solid fa-chevron-left"></i></button>
                         <p className="font-serif font-bold text-lg capitalize">{currentMonth.toLocaleDateString('fr-CA', { month: 'long', year: 'numeric' })}</p>
                         <button type="button" onClick={() => handleMonthChange(1)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#F28C38] hover:text-white transition-all"><i className="fa-solid fa-chevron-right"></i></button>
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center mb-4">
                        {['lu', 'ma', 'me', 'je', 've', 'sa', 'di'].map(d => <div key={d}>{d}</div>)}
                      </div>
                      
                      <div className="grid grid-cols-7 gap-y-2">
                        {calendarDays.map((date, i) => {
                          if (!date) return <div key={`empty-${i}`} className="h-10 w-10"></div>;
                          const dateStr = date.toISOString().split('T')[0];
                          const isSelected = formData.date === dateStr;
                          return (
                            <button 
                              key={i} 
                              type="button" 
                              onClick={() => handleDateSelect(date)}
                              className={`h-10 w-10 mx-auto flex items-center justify-center rounded-xl text-xs font-bold transition-all ${isSelected ? 'bg-[#F28C38] text-white shadow-lg scale-110' : 'text-gray-600 hover:bg-white/60 hover:scale-105'}`}
                            >
                              {date.getDate()}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Time Slots Chips */}
                  {showTimeSlots && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-[#F28C38] flex items-center justify-center text-white text-xs">
                          <i className="fa-solid fa-clock"></i>
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">Étape 3: Heure</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {timeSlots.map(slot => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setFormData({...formData, time: slot})}
                            className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all ${formData.time === slot ? 'bg-[#F28C38] border-[#F28C38] text-white shadow-lg' : 'bg-white/40 border-transparent text-gray-500 hover:border-[#F28C38]/50'}`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT SIDE: PERSONAL INFORMATION */}
              <div className="lg:col-span-7 p-8 md:p-12 bg-white/10">
                <div className="space-y-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white text-xs">
                      <i className="fa-solid fa-user-pen"></i>
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">Étape Finale: Coordonnées</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Prénom</label>
                      <input type="text" required placeholder="Ex: Marc" className="!bg-white/60" value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nom</label>
                      <input type="text" required placeholder="Ex: Boucher" className="!bg-white/60" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Courriel</label>
                      <input type="email" required placeholder="marc.boucher@email.com" className="!bg-white/60" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Téléphone</label>
                      <input type="tel" required placeholder="514-XXX-XXXX" className="!bg-white/60" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Adresse d'intervention</label>
                    <textarea required placeholder="Numéro, rue, ville et code postal" className="!bg-white/60 h-24 resize-none" value={formData.adresse} onChange={e => setFormData({...formData, adresse: e.target.value})} />
                  </div>

                  <div className="pt-6">
                    <button 
                      type="submit" 
                      disabled={!formData.date || !formData.time || !formData.service}
                      className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-[0.98] flex items-center justify-center space-x-3 ${(!formData.date || !formData.time || !formData.service) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'orange-gradient-btn text-white'}`}
                    >
                      <i className="fa-solid fa-paper-plane text-xs opacity-70"></i>
                      <span>Envoyer la demande</span>
                    </button>
                    
                    <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest mt-6">
                      <i className="fa-solid fa-lock mr-2 text-green-500"></i>
                      Données sécurisées et confidentielles
                    </p>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicBooking;
