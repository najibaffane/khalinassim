
import React from 'react';
import { Link } from 'react-router-dom';

const ConfirmationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#e6e4e2] text-gray-800 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-[#F28C38] text-white rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-orange-500/20">
        <i className="fa-solid fa-check text-4xl"></i>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 mb-4 tracking-tight">C'est réservé !</h1>
      <p className="text-base text-gray-500 max-w-md mb-12 font-medium leading-relaxed">
        Votre demande a bien été reçue. Un technicien RamonagePro vous contactera sous peu pour confirmer les détails.
      </p>

      <div className="space-y-4 w-full max-w-xs">
        <Link 
          to="/" 
          className="block w-full py-4 bg-white text-gray-800 border border-black/5 rounded-xl font-bold text-base hover:bg-[#F28C38] hover:text-white transition-all shadow-lg active:scale-95"
        >
          Retour à l'accueil
        </Link>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Excellence • Sécurité • 2025</p>
      </div>
    </div>
  );
};

export default ConfirmationPage;
