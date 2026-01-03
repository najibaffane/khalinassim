
import React, { useState, useMemo } from 'react';
import { Invoice, Client, AutomationSettings } from '../../types';
import { supabase } from '../../App';

interface InvoicesPageProps {
  invoices: Invoice[];
  clients: Client[];
  setInvoices: (updated: Invoice[]) => void;
  settings: AutomationSettings;
  onRefresh?: () => void;
  logActivity: (action: string) => void;
}

const InvoicesPage: React.FC<InvoicesPageProps> = ({ invoices, clients, setInvoices, settings, onRefresh, logActivity }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [isPrinting, setIsPrinting] = useState(false);

  const filteredInvoices = useMemo(() => {
    if (filter === 'all') return invoices;
    return invoices.filter(inv => inv.status === filter);
  }, [invoices, filter]);

  const stats = useMemo(() => {
    const paid = invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const unpaid = invoices.filter(i => i.status === 'unpaid').reduce((acc, curr) => acc + Number(curr.amount), 0);
    return { paid, unpaid };
  }, [invoices]);

  const handleSaveInvoice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const clientId = formData.get('client_id') as string;
    const client = clients.find(c => c.id === clientId);
    const amount = parseFloat(formData.get('amount') as string);
    const status = formData.get('status') as Invoice['status'];

    if (!client || isNaN(amount)) return;

    // Le montant saisi est le sous-total, on ajoute les taxes (14.975%)
    const totalTTC = amount * 1.14975;

    try {
      if (editingInvoice) {
        await supabase.from('invoices').update({ client_id: clientId, client_name: client.full_name, amount: totalTTC, status }).eq('id', editingInvoice.id);
        await logActivity(`A modifié la facture ${editingInvoice.id} (${client.full_name})`);
      } else {
        const invId = `INV-${Math.floor(Math.random() * 900000) + 100000}`;
        await supabase.from('invoices').insert([{ id: invId, client_id: clientId, client_name: client.full_name, amount: totalTTC, status, appointment_id: 'manual' }]);
        await logActivity(`A créé manuellement la facture ${invId} pour ${client.full_name}`);
      }
      setIsModalOpen(false);
      setEditingInvoice(null);
      if (onRefresh) onRefresh();
    } catch (err) { console.error(err); }
  };

  const updateStatus = async (id: string, status: Invoice['status']) => {
    await supabase.from('invoices').update({ status }).eq('id', id);
    await logActivity(`A marqué la facture ${id} comme ${status === 'paid' ? 'PAYÉE' : 'IMPAYÉE'}`);
    if (onRefresh) onRefresh();
    if (viewInvoice?.id === id) setViewInvoice(null);
  };

  const handlePrint = () => {
    if (!viewInvoice) return;
    
    // Activer le mode impression
    setIsPrinting(true);
    
    // Attendre que le DOM se mette à jour avec la classe .print-active-layer
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 300);
  };

  const invoiceCalculations = useMemo(() => {
    if (!viewInvoice) return null;
    const total = Number(viewInvoice.amount);
    const subtotal = total / 1.14975;
    const tps = subtotal * 0.05;
    const tvq = subtotal * 0.09975;
    return { subtotal, tps, tvq, total };
  }, [viewInvoice]);

  return (
    <div className={`space-y-8 animate-in fade-in duration-500 pb-20 ${isPrinting ? 'no-print' : ''}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 no-print">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 font-serif tracking-tight">Facturation</h1>
          <p className="text-sm md:text-base text-gray-500 font-medium">Gestion des encaissements et taxes (TPS/TVQ).</p>
        </div>
        <button 
          onClick={() => { setEditingInvoice(null); setIsModalOpen(true); }}
          className="orange-gradient-btn text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all"
        >
          + Nouvelle Facture
        </button>
      </div>

      {/* Résumé Financier */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
        <div className="admin-card p-8 border-l-8 border-green-500 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Encaissé</p>
            <p className="text-3xl font-black text-gray-900">{stats.paid.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</p>
          </div>
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-xl">
            <i className="fa-solid fa-money-bill-trend-up"></i>
          </div>
        </div>
        <div className="admin-card p-8 border-l-8 border-red-500 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">En attente (Créances)</p>
            <p className="text-3xl font-black text-gray-900">{stats.unpaid.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</p>
          </div>
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center text-xl">
            <i className="fa-solid fa-hourglass-half"></i>
          </div>
        </div>
      </div>

      <div className="admin-card overflow-hidden no-print">
        <div className="p-6 border-b border-gray-100 bg-gray-50/20 flex space-x-2">
          {['all', 'unpaid', 'paid'].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${filter === f ? 'bg-black text-white border-black' : 'bg-white text-gray-400 hover:border-gray-300'}`}
            >
              {f === 'all' ? 'Toutes' : f === 'paid' ? 'Payées' : 'Impayées'}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <tr>
                <th className="px-8 py-5">N° Facture</th>
                <th className="px-8 py-5">Client</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Montant (TTC)</th>
                <th className="px-8 py-5">État</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-white transition-colors group">
                  <td className="px-8 py-6 font-black text-gray-900">{inv.id}</td>
                  <td className="px-8 py-6 text-sm font-bold text-gray-700">{inv.client_name}</td>
                  <td className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase">{new Date(inv.created_at).toLocaleDateString('fr-CA')}</td>
                  <td className="px-8 py-6 font-black text-gray-900">{inv.amount.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      inv.status === 'paid' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      {inv.status === 'paid' ? 'PAYÉE' : 'IMPAYÉE'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => setViewInvoice(inv)} className="text-brand font-black text-[10px] uppercase tracking-widest hover:underline">Voir / Imprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL VISUALISATION FACTURE (PRÊT POUR IMPRESSION / PDF) */}
      {(viewInvoice || isPrinting) && invoiceCalculations && (
        <div className={`fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-10 ${isPrinting ? 'print-active-layer bg-white' : 'bg-black/80 backdrop-blur-md overflow-y-auto no-print'}`}>
          <div className={`bg-white w-full max-w-4xl min-h-screen md:min-h-0 md:rounded-[3rem] shadow-2xl relative invoice-print-container ${isPrinting ? '' : 'p-12 md:p-20'}`}>
            
            {!isPrinting && (
              <button 
                onClick={() => setViewInvoice(null)}
                className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center text-gray-400 hover:text-black transition-colors no-print"
              >
                <i className="fa-solid fa-xmark text-2xl"></i>
              </button>
            )}

            {/* HEADER FACTURE */}
            <div className="flex justify-between items-start mb-16">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[#F28C38] rounded-xl flex items-center justify-center text-white text-xl">
                    <i className="fa-solid fa-fire"></i>
                  </div>
                  <span className="text-3xl font-black font-serif tracking-tighter">Ramonage<span className="text-brand">Pro</span></span>
                </div>
                <div className="text-xs font-bold text-gray-500 leading-relaxed uppercase tracking-wider">
                  <p>{settings?.businessAddress || '123 Avenue des Pins, Montréal, QC'}</p>
                  <p>{settings?.businessPhone || '514-555-0199'}</p>
                  <p>{settings?.emailSender || 'contact@ramonagepro.ca'}</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-5xl font-black text-gray-900 mb-2 font-serif uppercase tracking-tighter italic">Facture</h2>
                <p className="text-lg font-black text-brand tracking-widest">#{viewInvoice?.id}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Date d'émission: {new Date(viewInvoice?.created_at || '').toLocaleDateString('fr-CA')}</p>
              </div>
            </div>

            {/* INFOS CLIENT */}
            <div className="grid grid-cols-2 gap-20 mb-16 border-y border-gray-100 py-10">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Facturé à:</p>
                <h4 className="text-xl font-black text-gray-900 mb-1">{viewInvoice?.client_name}</h4>
                <p className="text-sm font-bold text-gray-500 leading-relaxed">
                   Client enregistré sous l'ID #{viewInvoice?.client_id.slice(0,8)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Statut de paiement:</p>
                <span className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border inline-block ${
                  viewInvoice?.status === 'paid' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
                }`}>
                  {viewInvoice?.status === 'paid' ? 'ACQUITTÉE' : 'EN ATTENTE DE PAIEMENT'}
                </span>
              </div>
            </div>

            {/* TABLEAU ARTICLES */}
            <table className="w-full mb-16">
              <thead>
                <tr className="border-b-2 border-gray-900 text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">
                  <th className="py-4 text-left">Description de la prestation</th>
                  <th className="py-4 text-right">Quantité</th>
                  <th className="py-4 text-right">Prix Unitaire</th>
                  <th className="py-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="text-sm font-bold text-gray-700">
                  <td className="py-8">Service professionnel de ramonage / inspection sécurité incendie</td>
                  <td className="py-8 text-right">1</td>
                  <td className="py-8 text-right">{invoiceCalculations.subtotal.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</td>
                  <td className="py-8 text-right font-black text-gray-900">{invoiceCalculations.subtotal.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</td>
                </tr>
              </tbody>
            </table>

            {/* TOTALS */}
            <div className="flex justify-end mb-16">
              <div className="w-full max-w-sm space-y-3">
                <div className="flex justify-between text-sm font-bold text-gray-500">
                  <span>Sous-total</span>
                  <span>{invoiceCalculations.subtotal.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-gray-400 italic">
                  <span>TPS (5%) - #{settings?.tpsNumber || '855476311'}</span>
                  <span>{invoiceCalculations.tps.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-gray-400 italic">
                  <span>TVQ (9.975%) - #{settings?.tvqNumber || '122654321'}</span>
                  <span>{invoiceCalculations.tvq.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span>
                </div>
                <div className="flex justify-between pt-6 border-t-2 border-gray-900 text-2xl font-black text-gray-900 uppercase tracking-tighter">
                  <span>Total (CAD)</span>
                  <span>{invoiceCalculations.total.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span>
                </div>
              </div>
            </div>

            {/* FOOTER PDF */}
            <div className="pt-10 border-t border-gray-100 text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Merci de votre confiance • RamonagePro Québec</p>
              <div className="flex justify-center space-x-10 text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                <span>Licence RBQ: 1234-5678-90</span>
                <span>Certifié APAGH</span>
              </div>
            </div>

            {/* BOUTONS ACTIONS (Cachés lors de l'impression) */}
            {!isPrinting && (
              <div className="mt-20 flex space-x-4 no-print">
                <button 
                  onClick={handlePrint}
                  className="flex-1 orange-gradient-btn text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center space-x-3"
                >
                  <i className="fa-solid fa-download"></i>
                  <span>Télécharger / Imprimer PDF</span>
                </button>
                {viewInvoice?.status === 'unpaid' && (
                  <button 
                    onClick={() => updateStatus(viewInvoice.id, 'paid')}
                    className="flex-1 bg-green-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center space-x-3"
                  >
                    <i className="fa-solid fa-check"></i>
                    <span>Marquer comme Payée</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL CRÉATION / ÉDITION FACTURE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 no-print">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-300">
            <h2 className="text-2xl font-bold font-serif mb-6">{editingInvoice ? 'Modifier la facture' : 'Nouvelle facture'}</h2>
            <form onSubmit={handleSaveInvoice} className="space-y-4">
              <div className="space-y-1">
                <label>Client</label>
                <select name="client_id" required defaultValue={editingInvoice?.client_id}>
                  <option value="">Sélectionner un client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label>Montant (Hors Taxes)</label>
                <input name="amount" type="number" step="0.01" defaultValue={editingInvoice ? (editingInvoice.amount / 1.14975).toFixed(2) : ''} placeholder="Ex: 150.00" required />
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">+ Les taxes seront calculées automatiquement.</p>
              </div>
              <div className="space-y-1">
                <label>État du paiement</label>
                <select name="status" defaultValue={editingInvoice?.status || 'unpaid'}>
                  <option value="unpaid">Non payée (Créance)</option>
                  <option value="paid">Payée (Encaissée)</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 font-bold text-gray-400">Annuler</button>
                <button type="submit" className="orange-gradient-btn flex-1 py-4 text-white rounded-2xl font-bold shadow-xl">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;
