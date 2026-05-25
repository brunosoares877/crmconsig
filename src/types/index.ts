// ============================================
// TIPOS PARA SUPABASE
// ============================================

export type SupabaseError = {
    message: string;
    status?: number;
    name?: string;
    code?: string;
};

export type SupabaseResponse<T> = {
    data: T | null;
    error: SupabaseError | null;
};

// ============================================
// TIPOS PARA EVENTOS DO REACT
// ============================================

export type FormEvent = React.FormEvent<HTMLFormElement>;
export type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;
export type TextAreaChangeEvent = React.ChangeEvent<HTMLTextAreaElement>;
export type SelectChangeEvent = React.ChangeEvent<HTMLSelectElement>;
export type ButtonClickEvent = React.MouseEvent<HTMLButtonElement>;
export type DivClickEvent = React.MouseEvent<HTMLDivElement>;

// ============================================
// TIPOS PARA DADOS DO CRM
// ============================================

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
export type LeadSource = 'organic' | 'paid' | 'referral' | 'direct' | 'other';

export interface Lead {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    status: LeadStatus;
    source?: LeadSource;
    notes?: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    assigned_to?: string;
    tags?: string[];
}

export interface LeadFilter {
    status?: LeadStatus;
    source?: LeadSource;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
}

// ============================================
// TIPOS PARA ASSINATURAS
// ============================================

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
    updated_at: string;
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    type: PlanType;
    price: number;
    features: string[];
    popular?: boolean;
}

// ============================================
// TIPOS PARA AUTENTICAÇÃO
// ============================================

export interface User {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
}

export interface Profile {
    id: string;
    first_name?: string;
    last_name?: string;
    whatsapp?: string;
    avatar_url?: string;
    role?: 'admin' | 'user' | 'manager';
    created_at: string;
    updated_at: string;
}

export interface AuthContextType {
    user: any | null; // Mantém any pois vem do Supabase Auth
    profile: Profile | null;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    isPrivilegedUser: boolean;
    loading: boolean;
}

// ============================================
// TIPOS PARA CONTEXTO DE ASSINATURA
// ============================================

export type SubscriptionContextStatus = 'active' | 'trial' | 'expired';

export interface SubscriptionContextType {
    isSubscriptionActive: boolean;
    isTrialActive: boolean;
    status: SubscriptionContextStatus;
    trialDaysRemaining: number;
    subscriptionEndDate: string | null;
    refreshSubscription: () => Promise<void>;
    startTrial: () => void;
}

// ============================================
// TIPOS PARA COMISSÕES
// ============================================

export interface Commission {
    id: string;
    user_id: string;
    lead_id: string;
    amount: number;
    percentage: number;
    status: 'pending' | 'paid' | 'cancelled';
    paid_at?: string;
    created_at: string;
    updated_at: string;
}

export interface CommissionSettings {
    id: string;
    user_id: string;
    default_percentage: number;
    min_amount?: number;
    max_amount?: number;
    created_at: string;
    updated_at: string;
}

// ============================================
// TIPOS PARA NOTAS/LEMBRETES
// ============================================

export interface Note {
    id: string;
    user_id: string;
    lead_id?: string;
    title: string;
    content: string;
    color?: string;
    pinned?: boolean;
    created_at: string;
    updated_at: string;
}

export interface Reminder {
    id: string;
    user_id: string;
    lead_id?: string;
    title: string;
    description?: string;
    due_date: string;
    completed: boolean;
    priority?: 'low' | 'medium' | 'high';
    created_at: string;
    updated_at: string;
}

// ============================================
// TIPOS PARA COMPONENTES
// ============================================

export interface ProtectedRouteProps {
    children: React.ReactNode;
    requireSubscription?: boolean;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

// ============================================
// TIPOS PARA API/SERVIÇOS
// ============================================

export interface ApiError {
    message: string;
    code?: string;
    status?: number;
    details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
    data?: T;
    error?: ApiError;
    success: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

// ============================================
// TIPOS UTILITÁRIOS
// ============================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
    Pick<T, Exclude<keyof T, Keys>> &
    {
        [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
    }[Keys];
