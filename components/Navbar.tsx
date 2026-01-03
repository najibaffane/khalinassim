
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToServices = () => {
    if (isHome) {
      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/?scroll=services');
    }
  };

  // Déterminer si on doit utiliser le style "inversé" (texte noir sur fond clair)
  const useInvertedStyle = scrolled || !isHome;

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 md:px-12 ${
        useInvertedStyle 
          ? 'bg-white/30 backdrop-blur-2xl border-b border-black/5 py-3' 
          : 'bg-white/10 backdrop-blur-xl border-b border-white/10 py-5'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="w-10 h-10 bg-[#F28C38] rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-orange-500/20">
            <i className="fa-solid fa-fire text-white text-lg"></i>
          </div>
          <span className={`text-2xl font-bold tracking-tighter font-serif transition-colors duration-500 ${
            useInvertedStyle ? 'text-gray-900' : 'text-white'
          }`}>
            Ramonage<span className="text-[#F28C38]">Pro</span>
          </span>
        </Link>
        
        <div className={`hidden lg:flex items-center space-x-12 text-[11px] font-black uppercase tracking-[0.25em] transition-colors duration-500 ${
          useInvertedStyle ? 'text-gray-500' : 'text-white/70'
        }`}>
          <Link 
            to="/" 
            className={`${isHome && !location.search ? 'text-[#F28C38]' : (useInvertedStyle ? 'hover:text-black' : 'hover:text-white')} transition-colors relative group`}
          >
            Accueil
            <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F28C38] transition-all duration-300 group-hover:w-full ${isHome && !location.search ? 'w-full' : ''}`}></span>
          </Link>
          <button 
            onClick={scrollToServices} 
            className={`${useInvertedStyle ? 'hover:text-black' : 'hover:text-white'} transition-colors uppercase tracking-[0.25em] relative group`}
          >
            Services
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F28C38] transition-all duration-300 group-hover:w-full"></span>
          </button>
          <Link 
            to="/book" 
            className={`${location.pathname === '/book' ? 'text-[#F28C38]' : (useInvertedStyle ? 'hover:text-black' : 'hover:text-white')} transition-colors relative group`}
          >
            Réserver
            <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F28C38] transition-all duration-300 group-hover:w-full ${location.pathname === '/book' ? 'w-full' : ''}`}></span>
          </Link>
        </div>

        <button 
          onClick={() => navigate('/book')}
          className="orange-gradient-btn text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 hover:shadow-orange-500/40 transition-all active:scale-95 shadow-xl"
        >
          Prendre RDV
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
