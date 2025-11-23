import type { Category, Video } from "@/types";
import type { VpsInstance, Subscription } from "@/types";

const API_BASE = "/api";

// Categories
export const fetchCategories = async (options?: {
  withVideosOnly?: boolean;
}): Promise<Category[]> => {
  const url = options?.withVideosOnly
    ? `${API_BASE}/categories?withVideosOnly=true`
    : `${API_BASE}/categories`;

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch categories");
  return response.json();
};

export const fetchCategoryById = async (id: string): Promise<Category> => {
  const response = await fetch(`${API_BASE}/categories/${id}`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Failed to fetch category");
  return response.json();
};

// Videos
export const fetchVideosByCategory = async (
  categoryId: string
): Promise<Video[]> => {
  const response = await fetch(`${API_BASE}/videos?category=${categoryId}`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Failed to fetch videos");
  return response.json();
};

export const fetchVideoById = async (id: string): Promise<Video> => {
  const response = await fetch(`${API_BASE}/videos/${id}`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Failed to fetch video");
  return response.json();
};

export const searchVideos = async (query: string): Promise<Video[]> => {
  const response = await fetch(
    `${API_BASE}/videos?q=${encodeURIComponent(query)}`,
    {
      cache: "no-store",
    }
  );
  if (!response.ok) throw new Error("Search failed");
  return response.json();
};

// Video Upload
export const createVideo = async (videoData: {
  title: string;
  description: string;
  category_id?: string;
  category_name?: string;
  category_description?: string;
  video_url: string;
  thumbnail_url: string;
}): Promise<Video> => {
  const response = await fetch(`${API_BASE}/videos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(videoData),
  });
  if (!response.ok) throw new Error("Failed to create video");
  return response.json();
};

export const updateVideo = async (
  id: string,
  videoData: Partial<{
    title: string;
    description: string;
    category_id: string;
    category_name: string;
    category_description: string;
    video_url: string;
    thumbnail_url: string;
  }>
): Promise<Video> => {
  const response = await fetch(`${API_BASE}/videos/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(videoData),
  });

  if (!response.ok) throw new Error("Failed to update video");
  return response.json();
};

// VPS
export const fetchVps = async (): Promise<VpsInstance[]> => {
  const response = await fetch(`${API_BASE}/admin/vps`, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch VPS");
  const data = await response.json();
  return data.vps || [];
};

export const createVps = async (
  payload: Omit<
    VpsInstance,
    | "id"
    | "status"
    | "subscription_status"
    | "next_billing_at"
    | "cpu_usage"
    | "memory_usage"
    | "storage_usage"
    | "created_at"
    | "updated_at"
  > & { notes?: string }
): Promise<VpsInstance> => {
  const response = await fetch(`${API_BASE}/admin/vps`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to create VPS");
  const data = await response.json();
  return data.vps;
};

export const updateVps = async (
  id: string,
  payload: Partial<
    Pick<
      VpsInstance,
      | "status"
      | "subscription_status"
      | "next_billing_at"
      | "cpu_usage"
      | "memory_usage"
      | "storage_usage"
      | "notes"
      | "start_date"
      | "expires_at"
      | "credentials"
    >
  >
): Promise<VpsInstance> => {
  const response = await fetch(`${API_BASE}/admin/vps/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to update VPS");
  const data = await response.json();
  return data.vps;
};

export const deleteVps = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/admin/vps/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete VPS");
};

export const fetchMyVps = async (): Promise<VpsInstance[]> => {
  const response = await fetch(`${API_BASE}/vps`, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch VPS");
  const data = await response.json();
  return data.vps || [];
};

// Subscriptions
export const fetchSubscriptions = async (): Promise<Subscription[]> => {
  const response = await fetch(`${API_BASE}/subscriptions`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Failed to fetch subscriptions");
  const data = await response.json();
  return data.subscriptions || [];
};

export const createSubscription = async (
  payload?: Partial<{ plan_name: string; price: number }>
): Promise<{ subscription: Subscription; checkout_url?: string }> => {
  const response = await fetch(`${API_BASE}/subscriptions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
  if (!response.ok) throw new Error("Failed to start subscription");
  return response.json();
};

export const updateSubscriptionStatus = async (
  id: string,
  status: string
): Promise<Subscription> => {
  const response = await fetch(`${API_BASE}/subscriptions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error("Failed to update subscription");
  const data = await response.json();
  return data.subscription;
};

export const deleteSubscription = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/subscriptions/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete subscription");
};

// File Upload
export const uploadFile = async (
  file: File,
  type: "video" | "thumbnail"
): Promise<{ url: string; path: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("Failed to upload file");
  return response.json();
};
