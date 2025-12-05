import axios from "axios";
import { useAuthStore } from "../stores/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login for 401 errors on protected routes
    // Don't redirect for public routes like invite validation
    const publicPaths = [
      "/auth/",
      "/organisations/invite/",
      "/organisations/slug/",
    ];
    const requestPath = error.config?.url || "";
    const isPublicRoute = publicPaths.some((path) =>
      requestPath.includes(path)
    );

    if (error.response?.status === 401 && !isPublicRoute) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (data: {
    email: string;
    password: string;
    organisationSlug: string;
  }) => api.post("/auth/login", data),
  register: (data: {
    email: string;
    name: string;
    password: string;
    organisationSlug: string;
  }) => api.post("/auth/register", data),
  registerWithInvite: (data: {
    email: string;
    name: string;
    password: string;
    inviteCode: string;
    phone?: string;
    designation?: string;
    region?: string;
    departmentId?: string;
  }) => api.post("/auth/register/invite", data),
  getProfile: () => api.get("/auth/profile"),
};

// Ideas API
export const ideasApi = {
  getAll: (params?: Record<string, any>) => api.get("/ideas", { params }),
  getMy: (params?: Record<string, any>) => api.get("/ideas/my", { params }),
  getForReview: (params?: Record<string, any>) =>
    api.get("/ideas/for-review", { params }),
  getShortlisted: (params?: Record<string, any>) =>
    api.get("/ideas/shortlisted", { params }),
  getById: (id: string) => api.get(`/ideas/${id}`),
  create: (data: any) => api.post("/ideas", data),
  update: (id: string, data: any) => api.put(`/ideas/${id}`, data),
  submit: (id: string) => api.post(`/ideas/${id}/submit`),
  delete: (id: string) => api.delete(`/ideas/${id}`),
};

// Reviews API
export const reviewsApi = {
  reviewIdea: (ideaId: string, data: any) =>
    api.post(`/reviews/ideas/${ideaId}/review`, data),
  managementReview: (ideaId: string, data: any) =>
    api.post(`/reviews/ideas/${ideaId}/management-review`, data),
  assignReviewer: (ideaId: string, reviewerId: string) =>
    api.post(`/reviews/ideas/${ideaId}/assign/${reviewerId}`),
  getStats: () => api.get("/reviews/stats"),
  // Review Agents
  getAgents: () => api.get("/reviews/agents"),
  getAgentById: (id: string) => api.get(`/reviews/agents/${id}`),
  createAgent: (data: any) => api.post("/reviews/agents", data),
  updateAgent: (id: string, data: any) =>
    api.put(`/reviews/agents/${id}`, data),
  deleteAgent: (id: string) => api.delete(`/reviews/agents/${id}`),
};

// Users API
export const usersApi = {
  getAll: (params?: Record<string, any>) => api.get("/users", { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  updateRole: (id: string, role: string) =>
    api.patch(`/users/${id}/role`, { role }),
  deactivate: (id: string) => api.patch(`/users/${id}/deactivate`),
  activate: (id: string) => api.patch(`/users/${id}/activate`),
  getLeaderboard: (limit?: number) =>
    api.get("/users/leaderboard", { params: { limit } }),
  getReviewers: () => api.get("/users/reviewers"),
};

// Organisations API
export const organisationsApi = {
  create: (data: any) => api.post("/organisations", data),
  getBySlug: (slug: string) => api.get(`/organisations/slug/${slug}`),
  getCurrent: () => api.get("/organisations/current"),
  updateCurrent: (data: {
    name?: string;
    description?: string;
    logo?: string;
  }) => api.put("/organisations/current", data),
  getSettings: () => api.get("/organisations/settings"),
  updateSettings: (data: any) => api.put("/organisations/settings", data),
  validateInviteCode: (code: string) =>
    api.get(`/organisations/invite/${code}/validate`),
  // Invite Links
  createInviteLink: (data: any) =>
    api.post("/organisations/invite-links", data),
  getInviteLinks: () => api.get("/organisations/invite-links"),
  deactivateInviteLink: (id: string) =>
    api.patch(`/organisations/invite-links/${id}/deactivate`),
  deleteInviteLink: (id: string) =>
    api.delete(`/organisations/invite-links/${id}`),
  // Departments
  createDepartment: (data: any) => api.post("/organisations/departments", data),
  getDepartments: () => api.get("/organisations/departments"),
  deleteDepartment: (id: string) =>
    api.delete(`/organisations/departments/${id}`),
  // Domains
  createDomain: (data: any) => api.post("/organisations/domains", data),
  getDomains: () => api.get("/organisations/domains"),
  deleteDomain: (id: string) => api.delete(`/organisations/domains/${id}`),
};

// Analytics API
export const analyticsApi = {
  getDashboard: () => api.get("/analytics/dashboard"),
  getIdeasByStatus: () => api.get("/analytics/ideas/by-status"),
  getIdeasByDomain: () => api.get("/analytics/ideas/by-domain"),
  getIdeasByDepartment: () => api.get("/analytics/ideas/by-department"),
  getSubmissionTrends: (days?: number) =>
    api.get("/analytics/ideas/trends", { params: { days } }),
  getTopContributors: (limit?: number) =>
    api.get("/analytics/contributors/top", { params: { limit } }),
  getReviewerPerformance: () => api.get("/analytics/reviewers/performance"),
  getEmployeeStats: () => api.get("/analytics/employee/stats"),
  getFiltered: (params: Record<string, any>) =>
    api.get("/analytics/filtered", { params }),
};

// AI API
export const aiApi = {
  refineIdea: (data: {
    content: string;
    template?: any;
    selectedText?: string;
  }) => api.post("/ai/refine", data),
  improveText: (data: { selectedText: string; fullContext: string }) =>
    api.post("/ai/improve-text", data),
  evaluateIdea: (data: {
    ideaContent: any;
    systemPrompt: string;
    criteria: Record<string, any>;
    weights?: Record<string, number>;
  }) => api.post("/ai/evaluate", data),
  discoverIdeas: (data: {
    searchQuery: string;
    filters?: Record<string, any>;
    limit?: number;
  }) => api.post("/ai/discover", data),
  getClusters: (minClusterSize?: number) =>
    api.get("/ai/clusters", { params: { minClusterSize } }),
  getHiddenGems: () => api.get("/ai/hidden-gems"),
  // AI Assistant for canvas (legacy)
  assistantChat: (data: {
    message: string;
    ideaTitle: string;
    canvasElements?: any[];
    chatHistory?: { role: "user" | "assistant"; content: string }[];
  }) =>
    api.post<{
      message: string;
      actions: {
        type:
          | "add_sticky_note"
          | "add_text"
          | "add_shape"
          | "modify_element"
          | "delete_element"
          | "suggest";
        payload: any;
        targetElementId?: string;
      }[];
      suggestions?: string[];
    }>("/ai/assistant/chat", data),

  // Enhanced AI Assistant V2 with persistence and element targeting
  assistantChatV2: (data: {
    ideaId: string;
    message: string;
    ideaTitle: string;
    canvasElements?: any[];
    attachments?: {
      type: "image" | "element";
      data: string;
      elementContext?: any;
    }[];
    targetElements?: { id: string; type: string; content: string }[];
  }) =>
    api.post<{
      message: string;
      messageId: string;
      actions: {
        type:
          | "add_sticky_note"
          | "add_text"
          | "add_shape"
          | "modify_element"
          | "delete_element"
          | "suggest";
        payload: any;
        targetElementId?: string;
      }[];
      suggestions?: string[];
    }>("/ai/assistant/chat/v2", data),

  // Get chat history for an idea
  getChatHistory: (ideaId: string) =>
    api.get<{
      chatId: string | null;
      messages: {
        id: string;
        role: "user" | "assistant";
        content: string;
        actions?: any;
        attachments?: any;
        elementContext?: any;
        createdAt: string;
      }[];
    }>(`/ai/assistant/chat/${ideaId}`),

  // Delete chat history for an idea
  deleteChatHistory: (ideaId: string) =>
    api.delete<{ success: boolean }>(`/ai/assistant/chat/${ideaId}`),
};
