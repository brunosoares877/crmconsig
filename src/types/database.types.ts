// ============================================================================
// DATABASE TYPES - CRM Consig
// ============================================================================
// Tipos TypeScript para substituir 'any' e melhorar type safety

// ============================================================================
// SUPABASE RESPONSE TYPES
// ============================================================================

export interface PostgrestError {
    message: string;
    details: string;
    hint: string;
    code: string;
}

export interface SupabaseResponse<T> {
    data: T | null;
    error: PostgrestError | null;
}

// ============================================================================
// LEAD TYPES
// ============================================================================

export type LeadStatus =
    | 'new'
    | 'contacted'
    | 'qualified'
    | 'proposal'
    | 'negotiation'
    | 'converted'
    | 'lost'
    | 'archived';

export type LeadSource =
    | 'website'
    | 'referral'
    | 'social_media'
    | 'cold_call'
    | 'event'
    | 'other';

export interface Lead {
    id: string;
    name: string;
    email?: string;
    phone: string;
    cpf?: string;
    status: LeadStatus;
    source?: LeadSource;
    employee_id?: string;
    benefit_type?: string;
    benefit_number?: string;
    bank?: string;
    amount?: number;
    period?: number;
    notes?: string;
    tags?: string[];
    is_deleted?: boolean;
    deleted_at?: string;
    created_at: string;
    updated_at: string;
}

export interface LeadFormData {
    name: string;
    email?: string;
    phone: string;
    cpf?: string;
    status?: LeadStatus;
    source?: LeadSource;
    employee_id?: string;
    benefit_type?: string;
    benefit_number?: string;
    bank?: string;
    amount?: number;
    period?: number;
    notes?: string;
    tags?: string[];
}

// ============================================================================
// EMPLOYEE TYPES
// ============================================================================

export type EmployeeRole = 'admin' | 'manager' | 'agent' | 'viewer';

export interface Employee {
    id: string;
    name: string;
    email: string;
    role: EmployeeRole;
    is_active?: boolean;
    created_at: string;
    updated_at?: string;
}

// ============================================================================
// COMMISSION TYPES
// ============================================================================

export type CommissionStatus = 'pending' | 'paid' | 'cancelled' | 'processing';

export type CommissionType = 'fixed' | 'percentage' | 'tiered';

export interface Commission {
    id: string;
    lead_id: string;
    employee_id: string;
    amount: number;
    status: CommissionStatus;
    commission_type?: CommissionType;
    payment_date?: string;
    payment_period?: string;
    notes?: string;
    created_at: string;
    updated_at?: string;
}

export interface CommissionConfig {
    id: string;
    product_id?: string;
    benefit_type?: string;
    commission_type: CommissionType;
    rate?: number;
    fixed_amount?: number;
    min_amount?: number;
    max_amount?: number;
    created_at: string;
    updated_at?: string;
}

export interface CommissionTier {
    id: string;
    config_id: string;
    min_value: number;
    max_value?: number;
    rate: number;
    created_at: string;
}

// ============================================================================
// APPOINTMENT/SCHEDULING TYPES
// ============================================================================

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

export interface Appointment {
    id: string;
    lead_id: string;
    employee_id: string;
    title: string;
    description?: string;
    scheduled_date: string;
    scheduled_time: string;
    status: AppointmentStatus;
    location?: string;
    notes?: string;
    created_at: string;
    updated_at?: string;
}

// ============================================================================
// REMINDER TYPES
// ============================================================================

export type ReminderPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ReminderStatus = 'pending' | 'completed' | 'cancelled';

export interface Reminder {
    id: string;
    employee_id: string;
    lead_id?: string;
    title: string;
    description?: string;
    due_date: string;
    priority: ReminderPriority;
    status: ReminderStatus;
    completed_at?: string;
    created_at: string;
    updated_at?: string;
}

// ============================================================================
// NOTE TYPES
// ============================================================================

export interface Note {
    id: string;
    lead_id: string;
    employee_id: string;
    content: string;
    is_pinned?: boolean;
    created_at: string;
    updated_at?: string;
}

export interface StickyNote {
    id: string;
    employee_id: string;
    content: string;
    color?: string;
    position_x?: number;
    position_y?: number;
    width?: number;
    height?: number;
    created_at: string;
    updated_at?: string;
}

// ============================================================================
// DOCUMENT TYPES
// ============================================================================

export type DocumentType = 'cpf' | 'rg' | 'proof_address' | 'bank_statement' | 'other';

export interface Document {
    id: string;
    lead_id: string;
    employee_id: string;
    file_name: string;
    file_path: string;
    file_type: DocumentType;
    file_size?: number;
    created_at: string;
}

// ============================================================================
// PORTABILITY TYPES
// ============================================================================

export type PortabilityStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Portability {
    id: string;
    lead_id: string;
    employee_id: string;
    current_bank: string;
    target_bank: string;
    contract_number?: string;
    amount: number;
    status: PortabilityStatus;
    notes?: string;
    completed_at?: string;
    created_at: string;
    updated_at?: string;
}

// ============================================================================
// SUBSCRIPTION TYPES
// ============================================================================

export type PlanType = 'monthly' | 'semiannual' | 'annual';

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending';

export interface Subscription {
    id: string;
    user_id: string;
    plan_type: PlanType;
    status: SubscriptionStatus;
    start_date: string;
    end_date: string;
    payment_method?: string;
    payment_reference?: string;
    amount?: number;
    created_at: string;
    updated_at?: string;
}

// ============================================================================
// PRODUCT/BENEFIT TYPES
// ============================================================================

export interface Product {
    id: string;
    name: string;
    description?: string;
    benefit_type: string;
    is_active?: boolean;
    created_at: string;
    updated_at?: string;
}

export interface BenefitType {
    id: string;
    name: string;
    code: string;
    description?: string;
    is_active?: boolean;
    created_at: string;
}

// ============================================================================
// DASHBOARD/METRICS TYPES
// ============================================================================

export interface DashboardMetrics {
    total_leads: number;
    new_leads: number;
    converted_leads: number;
    total_revenue: number;
    pending_commissions: number;
    paid_commissions: number;
    active_employees: number;
    conversion_rate: number;
}

export interface EmployeePerformance {
    employee_id: string;
    employee_name: string;
    total_leads: number;
    converted_leads: number;
    total_revenue: number;
    total_commissions: number;
    conversion_rate: number;
}

// ============================================================================
// FORM/UI TYPES
// ============================================================================

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface FilterOptions {
    status?: LeadStatus[];
    employee_id?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
    tags?: string[];
}

// ============================================================================
// ERROR HANDLING TYPES
// ============================================================================

export interface AppError {
    message: string;
    code?: string;
    details?: unknown;
    timestamp: string;
}

export interface ValidationError {
    field: string;
    message: string;
}

// ============================================================================
// PAYMENT REPORT TYPES
// ============================================================================

export interface PaymentReport {
  employee: string;
  commissions: Commission[];
  totalAmount: number;
  totalCommissionValue: number;
  totalLeads: number;
}
