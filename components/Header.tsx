
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppNotification } from '../types';

interface HeaderProps {
  onLogout: () => void;
  notifications: AppNotification[];
  userEmail: string;
  onMarkRead: () => void;
  onDeleteNotif: (id: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout, notifications, userEmail, onMarkRead, onDeleteNotif }) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleNotifs = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowNotifs(!showNotifs);
  };

  const handleNotifClick = (e: React.MouseEvent, n: AppNotification) => {
    e.preventDefault();
    e.stopPropagation();
    setShowNotifs(false);
    onDeleteNotif(n.id);

    if (n.type === 'appointment') {
      navigate('/admin/appointments');
    } else if (n.type === 'invoice') {
      navigate('/admin/invoices');
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <header className="h-20 bg-white/60 backdrop-blur-xl border-b border-white/40 px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center space-x-4">
        <div className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-500/20 flex items-center">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          Système Actif
        </div>
        <div className="h-4 w-[1px] bg-black/5"></div>
        <span className="text-xs font-bold text-gray-400 tracking-tight">{userEmail}</span>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative" ref={dropdownRef}>
          <div 
            className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${showNotifs ? 'bg-black text-white' : 'hover:bg-white/80 text-gray-500 border border-transparent hover:border-gray-100'}`}
            onClick={handleToggleNotifs}
          >
            <i className="fa-regular fa-bell text-lg"></i>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </div>

          {showNotifs && (
            <div 
              className="absolute right-0 mt-4 w-80 bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-black/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-black/5 flex justify-between items-center bg-gray-50/50">
                <h4 className="text-sm font-black uppercase tracking-widest text-gray-900">Activité</h4>
                <button onClick={() => setShowNotifs(false)} className="text-gray-300 hover:text-black transition-colors">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={(e) => handleNotifClick(e, n)}
                      className="p-5 border-b border-black/5 flex space-x-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 ${
                        n.type === 'appointment' ? 'bg-green-100 text-green-600' : 
                        n.type === 'invoice' ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600'
                      }`}>
                        <i className={`fa-solid ${n.type === 'appointment' ? 'fa-calendar' : n.type === 'invoice' ? 'fa-file-invoice' : 'fa-bell'}`}></i>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-900 leading-snug">{n.message}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                          {new Date(n.created_at).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center text-gray-300 italic text-sm font-serif">
                    Aucun événement récent.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="h-10 w-10 bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm p-0.5 transition-transform hover:scale-105 cursor-pointer">
          <img src={`https://ui-avatars.com/api/?name=${userEmail}&background=F28C38&color=fff`} alt="Admin" className="w-full h-full object-cover rounded-[0.8rem]" />
        </div>
      </div>
    </header>
  );
};

export default Header;
