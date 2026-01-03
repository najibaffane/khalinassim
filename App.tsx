
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import LandingPage from './pages/LandingPage';
import TarifsPage from './pages/TarifsPage';
import PublicBooking from './pages/PublicBooking';
import ConfirmationPage from './pages/ConfirmationPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/admin/Dashboard';
import ClientsPage from './pages/admin/ClientsPage';
import AppointmentsPage from './pages/admin/AppointmentsPage';
import InvoicesPage from './pages/admin/InvoicesPage';
import LogsPage from './pages/admin/LogsPage';
import AutomationsPage from './pages/admin/AutomationsPage';
import SettingsPage from './pages/admin/SettingsPage';
import EmployeesPage from './pages/admin/EmployeesPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { Client, Appointment, Invoice, AccessLog, AutomationSettings, Service, AppNotification, Employee } from './types';

const SUPABASE_URL = 'https://uzasmsbkufkmzmrmwqnm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6YXNtc2JrdWZrbXptcm13cW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyNzA5NzEsImV4cCI6MjA4Mjg0Njk3MX0.lNcE61BvZ2IpZlyOMEujcUvQ_fqeGyNi7iPoxqaL5yI';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => localStorage.getItem('crm_auth') === 'true');
  const [currentUserEmail, setCurrentUserEmail] = useState<string>(() => localStorage.getItem('crm_user_email') || '');
  const [loading, setLoading] = useState(true);

  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [automationSettings, setAutomationSettings] = useState<AutomationSettings | null>(null);

  const isMasterAdmin = currentUserEmail === 'admin11@gmail.com';

  const logActivity = useCallback(async (action: string) => {
    if (!currentUserEmail) return;
    await supabase.from('logs').insert([{ admin_email: currentUserEmail, action }]);
  }, [currentUserEmail]);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const results = await Promise.allSettled([
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('appointments').select('*').order('appointment_date', { ascending: false }),
        supabase.from('invoices').select('*').order('created_at', { ascending: false }),
        supabase.from('services').select('*').order('name'),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }),
        supabase.from('logs').select('*').order('created_at', { ascending: false }),
        supabase.from('settings').select('*').maybeSingle(),
        supabase.from('employees').select('*').order('created_at', { ascending: false })
      ]);

      results.forEach((res, idx) => {
        if (res.status === 'fulfilled' && res.value.data) {
          const data = res.value.data;
          switch(idx) {
            case 0: setClients(data); break;
            case 1: setAppointments(data); break;
            case 2: setInvoices(data.map((inv: any) => ({ ...inv, amount: Number(inv.amount) }))); break;
            case 3: setServices(data); break;
            case 4: setNotifications(data); break;
            case 5: setLogs(data); break;
            case 6: setAutomationSettings(data); break;
            case 7: setEmployees(data); break;
          }
        }
      });
    } catch (err) {
      console.error("Supabase Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogin = async (status: boolean, email?: string) => {
    setIsAuthenticated(status);
    if (status && email) {
      localStorage.setItem('crm_auth', 'true');
      localStorage.setItem('crm_user_email', email);
      setCurrentUserEmail(email);
      await supabase.from('logs').insert([{ admin_email: email, action: 'Connexion réussie au système' }]);
      fetchData();
    } else {
      localStorage.removeItem('crm_auth');
      localStorage.removeItem('crm_user_email');
      setCurrentUserEmail('');
    }
  };

  const handleConfirmAppointment = useCallback(async (apptId: string) => {
    const appt = appointments.find(a => a.id === apptId);
    if (!appt) return;

    await supabase.from('appointments').update({ status: 'confirmed' }).eq('id', apptId);
    const service = services.find(s => s.name === appt.service_type) || services[0];
    const totalWithTaxes = (service?.price || 120) * 1.14975;
    const invId = `INV-${Math.floor(100000 + Math.random() * 900000)}`;

    await supabase.from('invoices').insert([{
      id: invId,
      client_id: appt.client_id,
      client_name: appt.client_name,
      appointment_id: apptId,
      amount: totalWithTaxes,
      status: 'unpaid'
    }]);

    await logActivity(`A validé le RDV #${apptId} et généré la facture ${invId}`);
    await fetchData(true); 
  }, [appointments, services, fetchData, logActivity]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#f5f4f2]">
      <div className="w-16 h-16 border-4 border-[#F28C38] border-t-transparent rounded-full animate-spin mb-6"></div>
      <div className="font-serif text-2xl text-gray-400 italic">Chargement sécurisé...</div>
    </div>
  );

  const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return (
      <div className="flex h-screen bg-[#e2e0dd] overflow-hidden">
        <Sidebar onLogout={() => handleLogin(false)} isMasterAdmin={isMasterAdmin} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header 
            onLogout={() => handleLogin(false)} 
            notifications={notifications} 
            userEmail={currentUserEmail}
            onMarkRead={() => {}} 
            onDeleteNotif={id => supabase.from('notifications').delete().eq('id', id).then(() => fetchData(true))}
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-10 no-scrollbar">
            {children}
          </main>
        </div>
      </div>
    );
  };

  return (
    <HashRouter>
      <Routes>
        {/* Le site public démarre ici */}
        <Route path="/" element={<LandingPage services={services} />} />
        <Route path="/tarifs" element={<TarifsPage services={services} />} />
        <Route path="/book" element={<PublicBooking onBookingSubmit={async (d) => {
          const { data: client } = await supabase.from('clients').insert([{
            full_name: d.full_name, email: d.email, phone: d.phone, address: d.adresse
          }]).select().single();
          if (client) {
            await supabase.from('appointments').insert([{
              client_id: client.id, client_name: d.full_name,
              appointment_date: `${d.date}T${d.time}:00`, service_type: d.service, status: 'pending'
            }]);
            await supabase.from('notifications').insert([{ message: `Nouveau RDV: ${d.full_name}`, type: 'appointment' }]);
            fetchData(true);
            return true;
          }
          return false;
        }} services={services} />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        
        {/* Administration protégée */}
        <Route path="/admin/dashboard" element={<AdminLayout><Dashboard clients={clients} appointments={appointments} invoices={invoices} setAppointments={setAppointments} setClients={setClients} onConfirmAppointment={handleConfirmAppointment} settings={automationSettings!} /></AdminLayout>} />
        <Route path="/admin/clients" element={<AdminLayout><ClientsPage clients={clients} setClients={() => fetchData(true)} logActivity={logActivity} /></AdminLayout>} />
        <Route path="/admin/appointments" element={<AdminLayout><AppointmentsPage appointments={appointments} setAppointments={setAppointments} clients={clients} setClients={setClients} availability={{}} setAvailability={() => {}} onConfirmAppointment={handleConfirmAppointment} logActivity={logActivity} /></AdminLayout>} />
        <Route path="/admin/invoices" element={<AdminLayout><InvoicesPage invoices={invoices} clients={clients} setInvoices={() => fetchData(true)} settings={automationSettings!} onRefresh={() => fetchData(true)} logActivity={logActivity} /></AdminLayout>} />
        <Route path="/admin/automations" element={<AdminLayout><AutomationsPage clients={clients} settings={automationSettings!} onRefresh={() => fetchData(true)} logActivity={logActivity} /></AdminLayout>} />
        <Route path="/admin/employees" element={<AdminLayout><EmployeesPage employees={employees} onRefresh={() => fetchData(true)} isMasterAdmin={isMasterAdmin} /></AdminLayout>} />
        <Route path="/admin/settings" element={<AdminLayout><SettingsPage settings={automationSettings!} setSettings={s => { supabase.from('settings').upsert({ ...s, id: 1 }).then(() => fetchData(true)); }} services={services} setServices={() => fetchData(true)} onRefresh={() => fetchData(true)} logActivity={logActivity} /></AdminLayout>} />
        <Route path="/admin/logs" element={<AdminLayout><LogsPage logs={logs} isMasterAdmin={isMasterAdmin} /></AdminLayout>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
