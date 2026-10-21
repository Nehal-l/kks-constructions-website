const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const apiUrl = (path) => `${API_BASE_URL}${path}`;

// Resolves local upload paths to the backend origin so images work regardless
// of which Vite dev-server port is active or whether the proxy has been applied.
// In production, set VITE_API_URL to the backend HTTPS origin.
const UPLOADS_BASE = API_BASE_URL || (
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : ""
);

export function getMediaUrl(url) {
  if (!url || typeof url !== "string") return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  if (url.startsWith("/uploads/")) {
    return UPLOADS_BASE ? `${UPLOADS_BASE}${url}` : url;
  }
  return url;
}

// --- PUBLIC API METHODS ---

export async function fetchSiteContent({ refresh = false } = {}) {
  const response = await fetch(
    apiUrl(`/api/content${refresh ? `?refresh=${Date.now()}` : ""}`),
    { cache: "no-store" }
  );
  if (!response.ok) {
    throw new Error("Unable to load site content.");
  }
  return response.json();
}

export async function fetchProjects(status = "all", type = "all") {
  const params = new URLSearchParams();
  if (status && status !== "all") params.set("status", status);
  if (type && type !== "all") params.set("type", type);
  const query = params.toString() ? `?${params.toString()}` : "";

  const response = await fetch(apiUrl(`/api/projects${query}`), { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Unable to load projects.");
  }
  return response.json();
}

export async function fetchProject(slug) {
  const response = await fetch(apiUrl(`/api/projects/${encodeURIComponent(slug)}`), { cache: "no-store" });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error("Unable to load this project.");
  }
  return response.json();
}

export async function fetchTestimonials() {
  const response = await fetch(apiUrl("/api/testimonials"), { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Unable to load testimonials.");
  }
  return response.json();
}

export async function submitEnquiry(payload) {
  const response = await fetch(apiUrl("/api/enquiries"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "Unable to send your enquiry.");
    error.fields = data.errors || {};
    throw error;
  }
  return data;
}

// --- AUTHENTICATION METHODS ---

export async function loginAdmin(email, password) {
  const response = await fetch(apiUrl("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Login failed.");
  }
  return data;
}

export async function logoutAdmin() {
  const response = await fetch(apiUrl("/api/auth/logout"), {
    method: "POST",
    credentials: "include",
  });
  return response.json().catch(() => ({ ok: true }));
}

export async function getAdminProfile() {
  const response = await fetch(apiUrl("/api/auth/me"), {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Not authenticated.");
  }
  return response.json();
}

export async function changeAdminPassword(currentPassword, newPassword, confirmPassword) {
  const response = await fetch(apiUrl("/api/auth/change-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Failed to update password.");
  }
  return data;
}

// --- ADMIN CMS METHODS ---

export async function fetchAdminOverview() {
  const response = await fetch(apiUrl("/api/admin/overview"), {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to load admin overview.");
  return response.json();
}

export async function fetchAdminContent() {
  const response = await fetch(apiUrl("/api/admin/content"), {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to load editable content.");
  return response.json();
}

export async function updateAdminContent(payload, { publish = true } = {}) {
  const response = await fetch(apiUrl(`/api/admin/content${publish ? "" : "?publish=false"}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok !== true) throw new Error(data.error || "Failed to save content.");
  return data;
}

export async function fetchAdminProjects() {
  const response = await fetch(apiUrl("/api/admin/projects"), {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to load projects.");
  return response.json();
}

export async function createAdminProject(payload) {
  const response = await fetch(apiUrl("/api/admin/projects"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Failed to create project.");
  return data;
}

export async function updateAdminProject(idOrSlug, payload) {
  const response = await fetch(apiUrl(`/api/admin/projects/${encodeURIComponent(idOrSlug)}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Failed to update project.");
  return data;
}

export async function deleteAdminProject(idOrSlug) {
  const response = await fetch(apiUrl(`/api/admin/projects/${encodeURIComponent(idOrSlug)}`), {
    method: "DELETE",
    credentials: "include",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Failed to delete project.");
  return data;
}

export async function toggleAdminProjectPublish(idOrSlug) {
  const response = await fetch(apiUrl(`/api/admin/projects/${encodeURIComponent(idOrSlug)}/toggle-publish`), {
    method: "PATCH",
    credentials: "include",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Failed to toggle project visibility.");
  return data;
}

export async function reorderAdminProjects(orderedSlugs) {
  const response = await fetch(apiUrl("/api/admin/projects/reorder"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ orderedSlugs }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Failed to reorder projects.");
  return data;
}

export async function fetchAdminTestimonials() {
  const response = await fetch(apiUrl("/api/admin/testimonials"), {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to load testimonials.");
  return response.json();
}

export async function createAdminTestimonial(payload) {
  const response = await fetch(apiUrl("/api/admin/testimonials"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Failed to create testimonial.");
  return data;
}

export async function updateAdminTestimonial(id, payload) {
  const response = await fetch(apiUrl(`/api/admin/testimonials/${encodeURIComponent(id)}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Failed to update testimonial.");
  return data;
}

export async function deleteAdminTestimonial(id) {
  const response = await fetch(apiUrl(`/api/admin/testimonials/${encodeURIComponent(id)}`), {
    method: "DELETE",
    credentials: "include",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Failed to delete testimonial.");
  return data;
}

export async function toggleAdminTestimonialPublish(id) {
  const response = await fetch(apiUrl(`/api/admin/testimonials/${encodeURIComponent(id)}/toggle-publish`), {
    method: "PATCH",
    credentials: "include",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Failed to toggle testimonial visibility.");
  return data;
}

export async function reorderAdminTestimonials(orderedIds) {
  const response = await fetch(apiUrl("/api/admin/testimonials/reorder"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ orderedIds }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Failed to reorder testimonials.");
  return data;
}

export async function uploadAdminImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(apiUrl("/api/admin/upload"), {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Image upload failed.");
  return data;
}

export async function fetchAdminEnquiries() {
  const response = await fetch(apiUrl("/api/admin/enquiries"), {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to load enquiries.");
  return response.json();
}
