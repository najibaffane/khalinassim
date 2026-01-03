
export interface Client {
  id: string;
  full_name: string;
  address: string;
  phone: string;
  email: string;
  last_visit_date: string;
  reminder_frequency_months: number;
  notes: string;
  created_at: string;
  status: 'active' | 'archived';
}

export interface Employee {
  id: string;
  full_name: string;
  email: string;
  password?: string;
  role: 'admin' | 'technician';
  created_at: string;
}

export interface Appointment {
  id: string;
  client_id: string;
  client_name?: string;
  appointment_date: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  service_type: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  client_id: string;
  client_name: string;
  appointment_id: string;
  amount: number;
  invoice_url: string;
  status: 'paid' | 'unpaid' | 'overdue';
  created_at: string;
}

export interface AccessLog {
  id: string;
  admin_email: string;
  action: string;
  created_at: string;
}

export interface AutomationSettings {
  remindersEnabled: boolean;
  defaultFrequency: number;
  businessName: string;
  emailSender: string;
  businessAddress: string;
  businessPhone: string;
  tpsNumber: string;
  tvqNumber: string;
  timezone: string;
  minBookingNoticeHours: number;
  emailTemplate: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: string;
}

export interface AppNotification {
  id: string;
  message: string;
  type: 'appointment' | 'invoice' | 'system';
  read: boolean;
  created_at: string;
}
