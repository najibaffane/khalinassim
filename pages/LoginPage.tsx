
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../App';

interface LoginPageProps {
  onLogin: (status: boolean, email?: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. Check Super Admin
    if (cleanEmail === 'admin11@gmail.com' && cleanPass === 'admin11') {
      onLogin(true, cleanEmail);
      navigate('/admin/dashboard');
      return;
    }

    // 2. Check Employees in Database
    try {
      const { data, error: dbError } = await supabase
        .from('employees')
        .select('*')
        .eq('email', cleanEmail)
        .eq('password', cleanPass)
        .maybeSingle();

      if (dbError) throw dbError;

      if (data) {
        onLogin(true, cleanEmail);
        navigate('/admin/dashboard');
      } else {
        setError('Accès refusé. Identifiants incorrects.');
      }
    } catch (err) {
      console.error(err);
      setError('Erreur de connexion au serveur.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f4f2] px-6">
      <Link to="/" className="mb-12 flex items-center space-x-3 group transition-transform hover:scale-105">
        <div className="w-12 h-12 bg-[#F28C38] text-white rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-orange-500/20">
          <i className="fa-solid fa-fire text-xl"></i>
        </div>
        <span className="text-3xl font-bold text-gray-900 font-serif tracking-tighter">
          Ramonage<span className="text-brand">Pro</span>
        </span>
      </Link>

      <div className="max-w-md w-full bg-white rounded-[3rem] p-12 border border-gray-100 shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-500">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">Accès Professionnel</h2>
          <p className="text-gray-400 mt-2 font-medium text-sm">Identifiez-vous pour accéder au CRM.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl text-[10px] mb-8 text-center font-black uppercase tracking-widest border border-red-100">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label>Identifiant</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-semibold text-sm outline-none border-2 border-transparent transition-all focus:bg-white"
              placeholder="votre@email.ca"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-1.5">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-semibold text-sm outline-none border-2 border-transparent transition-all focus:bg-white"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-5 orange-gradient-btn text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-[0.98] mt-4 flex items-center justify-center space-x-2 ${isLoading ? 'opacity-50' : ''}`}
          >
            {isLoading ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : (
              <span>Se connecter</span>
            )}
          </button>
        </form>
        
        <div className="mt-10 text-center">
          <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-brand transition-colors">
            <i className="fa-solid fa-arrow-left mr-2"></i>
            Retour au site public
          </Link>
        </div>
      </div>
      
      <p className="mt-8 text-[10px] font-black uppercase tracking-widest text-gray-400 opacity-50">
        RamonagePro • CRM Sécurisé • v2.1
      </p>
    </div>
  );
};

export default LoginPage;
