
import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Service } from '../types';

interface LandingPageProps {
  services: Service[];
}

const LandingPage: React.FC<LandingPageProps> = ({ services }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('scroll') === 'services') {
      setTimeout(() => {
        document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.8 
        : scrollLeft + clientWidth * 0.8;
      
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen relative font-inter bg-[#f5f4f2] text-gray-900 selection:bg-[#F28C38] selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex flex-col justify-center overflow-hidden">
        
        {/* BACKGROUND IMAGE */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1696860740793-1bb7bf33cdc1?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Ambiance foyer chaleureux"
            className="w-full h-full object-cover object-center transition-opacity duration-700"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "images/backgroundimg.jpg";
              target.onerror = null; 
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-10 pt-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-[#F28C38]/40 backdrop-blur-md border border-[#F28C38]/50 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest mb-6 shadow-lg">
              <span className="w-1.5 h-1.5 bg-[#F28C38] rounded-full animate-pulse"></span>
              <span>Ramonage certifié et assuré</span>
            </div>

            <h1 className="text-4xl md:text-7xl font-serif font-bold leading-[1.1] mb-6 tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              Protégez votre foyer avec<br />
              un <span className="text-[#F28C38]">ramonage expert</span>
            </h1>

            <p className="text-base md:text-lg text-white max-w-lg mb-10 font-bold leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              Assurez la sécurité de votre famille et la longévité de vos installations
              avec notre service professionnel de ramonage et inspection.
            </p>

            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => navigate('/book')}
                className="w-full sm:w-auto px-10 py-5 orange-gradient-btn text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center space-x-3 shadow-2xl"
              >
                <i className="fa-regular fa-calendar-check"></i>
                <span>Prendre rendez-vous</span>
              </button>

              <button
                onClick={() =>
                  document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="w-full sm:w-auto px-10 py-5 bg-black/40 backdrop-blur-md text-white border border-white/40 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black/60 transition-all flex items-center justify-center"
              >
                <span>Voir nos tarifs</span>
              </button>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/20 flex flex-wrap gap-10 md:gap-20">
            <div>
              <p className="text-3xl font-bold text-[#F28C38] mb-0.5 font-serif drop-shadow-md">
                15+
              </p>
              <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] drop-shadow-sm">
                Ans d'expérience
              </p>
            </div>

            <div>
              <p className="text-3xl font-bold text-white mb-0.5 font-serif drop-shadow-md">
                2500+
              </p>
              <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] drop-shadow-sm">
                Interventions
              </p>
            </div>

            <div>
              <p className="text-3xl font-bold text-white mb-0.5 font-serif drop-shadow-md">
                100%
              </p>
              <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] drop-shadow-sm">
                Assuré & Certifié
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - Background darker for Glass Effect, with Arrow Navigation */}
      <section id="services" className="py-24 bg-[#e2e0dd] relative overflow-hidden">
        
        {/* DECORATIVE ELEMENTS BEHIND CARDS */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#F28C38]/20 rounded-full blur-[150px] -z-0 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-300/10 rounded-full blur-[120px] -z-0"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div className="max-md:text-center max-md:w-full">
              <p className="text-[#F28C38] font-black text-[10px] uppercase tracking-[0.5em] mb-4">
                Solutions Professionnelles
              </p>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight">
                Nos Services d'Entretien
              </h2>
            </div>
            
            {/* NAVIGATION ARROWS */}
            <div className="hidden md:flex space-x-4 mb-2">
              <button 
                onClick={() => scroll('left')}
                aria-label="Service précédent"
                className="w-14 h-14 rounded-2xl bg-white/40 backdrop-blur-md border border-white/60 text-gray-800 hover:bg-[#F28C38] hover:text-white transition-all flex items-center justify-center shadow-lg active:scale-95"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <button 
                onClick={() => scroll('right')}
                aria-label="Service suivant"
                className="w-14 h-14 rounded-2xl bg-white/40 backdrop-blur-md border border-white/60 text-gray-800 hover:bg-[#F28C38] hover:text-white transition-all flex items-center justify-center shadow-lg active:scale-95"
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>

          {/* DYNAMIC SCROLLING CONTAINER - Scrollbar hidden via CSS utility */}
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-8 py-16 snap-x snap-mandatory no-scrollbar scroll-smooth px-4 -mx-4"
          >
            {services.length > 0 ? services.map((s, i) => (
              <div
                key={i}
                className="snap-center flex-shrink-0 w-[85vw] md:w-[380px] group relative bg-white/30 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/50 flex flex-col transition-all duration-700 hover:-translate-y-8 hover:shadow-[0_60px_100px_-20px_rgba(0,0,0,0.12)] hover:border-white/90"
              >
                {/* Subtle shine reflection */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-[3rem] pointer-events-none"></div>

                {/* Icon Container */}
                <div className="w-16 h-16 bg-white/40 text-[#F28C38] rounded-2xl flex items-center justify-center mb-10 text-2xl shadow-sm border border-white/60 group-hover:bg-[#F28C38] group-hover:text-white group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 ease-out z-10 relative">
                  <i className={`fa-solid ${s.icon || 'fa-fire'} relative z-10`}></i>
                </div>

                <h3 className="text-2xl font-serif font-bold mb-5 text-gray-900 transition-colors duration-300 relative z-10">
                  {s.name}
                </h3>

                <p className="text-gray-600 leading-relaxed text-sm mb-12 font-medium flex-1 relative z-10">
                  {s.description}
                </p>

                <div className="pt-8 border-t border-black/5 mt-auto relative z-10">
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <p className="text-[10px] font-black text-[#F28C38] uppercase tracking-widest mb-1">À partir de</p>
                      <p className="text-3xl font-black text-gray-900 font-serif">
                        {s.price} <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">$</span>
                      </p>
                    </div>
                    <div className="text-right">
                       <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">+ taxes applicables</span>
                    </div>
                  </div>
                  
                  <Link
                    to="/book"
                    className="orange-gradient-btn w-full py-5 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center space-x-2 shadow-xl hover:shadow-[#F28C38]/40 transition-all active:scale-[0.97]"
                  >
                    <span>Réserver</span>
                    <i className="fa-solid fa-arrow-right-long opacity-70 group-hover:translate-x-1 transition-transform"></i>
                  </Link>
                </div>
              </div>
            )) : (
              <div className="w-full py-20 text-center text-gray-400 italic font-serif">
                Chargement des services...
              </div>
            )}
          </div>

          {/* MOBILE NAVIGATION ARROWS */}
          <div className="flex md:hidden justify-center space-x-6 mt-4">
             <button onClick={() => scroll('left')} className="w-12 h-12 rounded-xl bg-white/60 flex items-center justify-center active:scale-95 transition-transform"><i className="fa-solid fa-chevron-left"></i></button>
             <button onClick={() => scroll('right')} className="w-12 h-12 rounded-xl bg-white/60 flex items-center justify-center active:scale-95 transition-transform"><i className="fa-solid fa-chevron-right"></i></button>
          </div>
        </div>
      </section>

      <footer className="py-20 bg-[#1a1512] text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F28C38]/30 to-transparent"></div>
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center space-y-12 md:space-y-0 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#F28C38] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <i className="fa-solid fa-fire text-white text-xl"></i>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold font-serif tracking-tighter leading-none">
                Ramonage<span className="text-[#F28C38]">Pro</span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mt-1">Expertise Québec</span>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              © 2025 RamonagePro Québec • Licencié RBQ
            </p>
            <div className="flex space-x-8">
              <Link
                to="/login"
                className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-[#F28C38] transition-colors"
              >
                Portail Admin
              </Link>
              <Link
                to="/tarifs"
                className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-[#F28C38] transition-colors"
              >
                Confidentialité
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
