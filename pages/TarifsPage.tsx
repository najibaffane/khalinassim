
import React from 'react';
import Navbar from '../components/Navbar';
import { Service } from '../types';

interface TarifsPageProps {
  services: Service[];
}

const TarifsPage: React.FC<TarifsPageProps> = ({ services }) => {
  return (
    <div className="min-h-screen bg-[#e6e4e2] text-gray-900 font-inter pb-24 pt-24">
      <Navbar />
      <div className="container mx-auto px-6 pt-12 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-800 mb-6 tracking-tight">Tarifs <span className="text-[#F28C38]">&</span> Forfaits</h1>
          <p className="text-base text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">Qualité certifiée et sécurité garantie pour votre foyer.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(service => (
            <div key={service.id} className="bg-white p-10 rounded-3xl border border-black/5 flex flex-col transition-all hover:shadow-xl group">
              <div className="w-14 h-14 bg-[#F28C38]/10 text-[#F28C38] rounded-xl flex items-center justify-center mb-8 text-2xl group-hover:bg-[#F28C38] group-hover:text-white transition-all">
                <i className={`fa-solid ${service.icon}`}></i>
              </div>
              <h3 className="text-xl font-serif font-bold text-gray-800 mb-4">{service.name}</h3>
              <div className="flex items-baseline space-x-2 mb-6">
                <span className="text-4xl font-black text-gray-900">{service.price} $</span>
                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">cad / visite</span>
              </div>
              <p className="text-gray-500 font-medium text-sm leading-relaxed mb-10 flex-1">{service.description}</p>
              <button className="w-full py-4 bg-gray-50 text-gray-800 rounded-xl font-bold text-sm hover:bg-[#F28C38] hover:text-white transition-all">Sélectionner</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TarifsPage;
