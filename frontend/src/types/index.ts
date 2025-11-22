export interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  category_id: string;
  video_url: string;
  thumbnail_url: string;
  created_at: string;
  categories?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface Admin {
  id: string;
  email: string;
  password_hash: string;
  role: "admin";
  created_at: string;
}

export interface AuthorizedUser {
  id: string;
  email: string;
  exness_account_id: string;
  role: "user";
  created_at: string;
  updated_at: string;
}

export interface CustomSession {
  user: {
    email: string;
    exness_account_id?: string;
    is_admin: boolean;
    role: "admin" | "user";
  };
  expires_at: number;
}

export interface Post {
  id: string;
  title: string;
  body: string;
  cover_image_url?: string | null;
  author_email: string;
  created_at: string;
}

export interface DailyNews {
  id: string;
  title: string;
  summary?: string | null;
  body: string;
  source_url?: string | null;
  author_email: string;
  published_at: string;
  created_at: string;
}

export interface ActiveUser {
  id: string;
  user_email: string;
  exness_account_id?: string | null;
  role: "admin" | "user";
  status: string;
  last_seen_at: string;
  user_agent?: string | null;
  created_at?: string;
}

export interface VpsInstance {
  id: string;
  user_email: string;
  plan_name: string;
  plan_price: number;
  plan_template?: string | null;
  region?: string | null;
  cpu?: string | null;
  memory_gb?: number | null;
  storage_gb?: number | null;
  status: string;
  cpu_usage?: number | null;
  memory_usage?: number | null;
  storage_usage?: number | null;
  subscription_status: string;
  next_billing_at?: string | null;
  notes?: string | null;
  credentials?: {
    username?: string;
    password?: string;
    rdp_package?: string | null;
  } | null;
  mt5_status?: string | null;
  auto_suspend_at?: string | null;
  suspend_reason?: string | null;
  last_heartbeat_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_email: string;
  plan_name: string;
  price: number;
  currency: string;
  status: string;
  payway_transaction_id?: string | null;
  payway_checkout_url?: string | null;
  next_billing_at?: string | null;
  created_at: string;
  updated_at: string;
}
