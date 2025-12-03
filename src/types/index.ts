export type IdeaStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "APPROVED"
  | "REJECTED"
  | "NEEDS_REVISION";

export type UserRole = "EMPLOYEE" | "REVIEWER" | "MANAGEMENT" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  designation?: string;
  region?: string;
  isActive: boolean;
  organisationId: string;
  departmentId?: string;
  department?: Department;
  totalPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface Organisation {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  settings?: OrganisationSettings;
  departments?: Department[];
  ideaDomains?: IdeaDomain[];
}

export interface OrganisationSettings {
  id: string;
  submissionMode: "ANONYMOUS" | "IDENTIFIED";
  dashboardMode: "LEADERBOARD" | "REWARDS" | "POINTS" | "COUPONS" | "GIFTS";
  themeMode: string;
  cultureMode: string;
  aiAssistantEnabled: boolean;
  ideaFormatTemplate?: any;
  pointsPerSubmission: number;
  pointsPerShortlist: number;
  pointsPerApproval: number;
  autoAssignReviewer: boolean;
  requireMinReviewers: number;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  organisationId: string;
  _count?: {
    users: number;
    ideas: number;
  };
}

export interface IdeaDomain {
  id: string;
  name: string;
  description?: string;
  color: string;
  organisationId: string;
  _count?: {
    ideas: number;
  };
}

export interface Idea {
  id: string;
  title: string;
  summary: string;
  content: any;
  domainId?: string;
  domain?: IdeaDomain;
  departmentId?: string;
  department?: Department;
  tags: string[];
  status: IdeaStatus;
  isAnonymous: boolean;
  authorId: string;
  author?: User;
  organisationId: string;
  reviewerId?: string;
  reviewer?: User;
  reviewScore?: number;
  reviewStars?: number;
  reviewNotes?: string;
  reviewedAt?: string;
  managerId?: string;
  manager?: User;
  managementScore?: number;
  managementNotes?: string;
  managedAt?: string;
  aiScore?: number;
  aiAnalysis?: any;
  feedback?: IdeaFeedback[];
  version: number;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IdeaFeedback {
  id: string;
  ideaId: string;
  authorId: string;
  author?: User;
  content: string;
  type: string;
  isInternal: boolean;
  createdAt: string;
}

export interface ReviewAgent {
  id: string;
  name: string;
  description?: string;
  reviewerId: string;
  organisationId: string;
  systemPrompt: string;
  criteria: Record<string, any>;
  weights?: Record<string, number>;
  knowledgeBase?: string;
  autoShortlistThreshold?: number;
  autoRejectThreshold?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InviteLink {
  id: string;
  code: string;
  organisationId: string;
  role: UserRole;
  departmentId?: string;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
  url?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalIdeas: number;
  submittedIdeas: number;
  shortlistedIdeas: number;
  approvedIdeas: number;
  rejectedIdeas: number;
  totalUsers: number;
  totalReviewers: number;
  approvalRate: string | number;
  shortlistRate: string | number;
}

export interface EmployeeStats {
  totalIdeas: number;
  drafts: number;
  submitted: number;
  shortlisted: number;
  approved: number;
  rejected: number;
  needsRevision: number;
  totalPoints: number;
  successRate: string | number;
}

export interface ReviewerStats {
  totalReviewed: number;
  shortlisted: number;
  rejected: number;
  pending: number;
  shortlistRate: number;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatar?: string;
  department?: string;
  totalPoints: number;
  ideasCount?: number;
}
