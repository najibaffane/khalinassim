
import { Client, Appointment, Invoice, AccessLog } from './types';

export const mockClients: Client[] = [
  {
    id: '1',
    full_name: 'Jean Tremblay',
    address: '123 rue Sherbrooke, Montréal, QC',
    phone: '514-555-0101',
    email: 'jean.tremblay@email.ca',
    last_visit_date: '2024-08-15',
    reminder_frequency_months: 6,
    notes: 'Client fidèle. Préfère les rendez-vous le matin.',
    created_at: '2023-01-15',
    status: 'active'
  },
  {
    id: '2',
    full_name: 'Marie-Sophie Roy',
    address: '456 boul. Charest, Québec, QC',
    phone: '418-555-0102',
    email: 'ms.roy@gmail.com',
    last_visit_date: '2024-07-20',
    reminder_frequency_months: 6,
    notes: 'Allergique aux produits parfumés.',
    created_at: '2023-02-20',
    status: 'active'
  },
  {
    id: '3',
    full_name: 'Luc Bouchard',
    address: '789 rue Principale, Gatineau, QC',
    phone: '819-555-0103',
    email: 'luc.b@outlook.com',
    last_visit_date: '2023-12-05',
    reminder_frequency_months: 6,
    notes: 'Contrat de maintenance annuelle.',
    created_at: '2023-03-10',
    status: 'active'
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: '101',
    client_id: '1',
    client_name: 'Jean Tremblay',
    appointment_date: '2025-05-25T10:00:00',
    status: 'confirmed',
    service_type: 'Entretien Général',
    created_at: '2025-04-01'
  },
  {
    id: '102',
    client_id: '2',
    client_name: 'Marie-Sophie Roy',
    appointment_date: '2025-06-16T14:30:00',
    status: 'pending',
    service_type: 'Nettoyage en profondeur',
    created_at: '2025-04-05'
  }
];

export const mockInvoices: Invoice[] = [
  {
    id: 'FAC-2025-001',
    client_id: '1',
    client_name: 'Jean Tremblay',
    appointment_id: '101',
    amount: 172.46,
    invoice_url: '#',
    status: 'paid',
    created_at: '2025-04-20'
  }
];

export const mockLogs: AccessLog[] = [
  {
    id: 'log-1',
    admin_email: 'admin11@gmail.com',
    action: 'Connexion réussie',
    created_at: '2025-04-25T08:00:00'
  }
];