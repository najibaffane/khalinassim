
import React from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  onLogout: () => void;
  isMasterAdmin: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, isMasterAdmin }) => {
  const menuItems = [
    { name: 'Tableau de bord', icon: 'fa-house', path: '/admin/dashboard' },
    { name: 'Clients', icon: 'fa-users', path: '/admin/clients' },
    { name: 'Rendez-vous', icon: 'fa-calendar-days', path: '/admin/appointments' },
    { name: 'Factures', icon: 'fa-file-invoice-dollar', path: '/admin/invoices' },
    { name: 'Relances', icon: 'fa-robot', path: '/admin/automations' },
    { name: 'Équipe', icon: 'fa-user-tie', path: '/admin/employees' },
    { name: 'Services', icon: 'fa-wrench', path: '/admin/settings' },
  ];

  if (isMasterAdmin) {
    menuItems.push({ name: 'Audit & Activité', icon: 'fa-shield-halved', path: '/admin/logs' });
  }

  return (
    <aside className="w-64 bg-[#1a1512] flex flex-col h-full shrink-0 relative z-20 shadow-2xl">
      <div className="p-8 flex items-center space-x-3">
        <div className="w-10 h-10 bg-[#F28C38] rounded-xl flex items-center justify-center shadow-lg">
          <i className="fa-solid fa-fire text-white text-lg"></i>
        </div>
        <span className="text-xl font-bold tracking-tighter text-white font-serif">Ramonage<span className="text-[#F28C38]">Pro</span></span>
      </div>

      <nav className="flex-1 px-4 mt-2 space-y-1 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-5 py-3.5 rounded-xl text-[13px] font-bold tracking-tight transition-all duration-300 ${
                isActive
                  ? 'bg-white/10 text-white border-l-4 border-[#F28C38]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <i className={`fa-solid ${item.icon} w-5 text-center text-xs opacity-70`}></i>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5">
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-3 p-4 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all font-bold text-[13px]"
        >
          <i className="fa-solid fa-right-from-bracket text-xs"></i>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
