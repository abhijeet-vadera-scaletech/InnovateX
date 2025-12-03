import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    translation: {
      // Common
      common: {
        loading: "Loading...",
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        create: "Create",
        submit: "Submit",
        search: "Search",
        filter: "Filter",
        actions: "Actions",
        status: "Status",
        date: "Date",
        view: "View",
        back: "Back",
        next: "Next",
        previous: "Previous",
        confirm: "Confirm",
        success: "Success",
        error: "Error",
        warning: "Warning",
        info: "Info",
      },
      // Auth
      auth: {
        login: "Login",
        logout: "Logout",
        register: "Register",
        email: "Email",
        password: "Password",
        confirmPassword: "Confirm Password",
        forgotPassword: "Forgot Password?",
        noAccount: "Don't have an account?",
        hasAccount: "Already have an account?",
        signUp: "Sign Up",
        signIn: "Sign In",
        organisation: "Organisation",
        joinOrg: "Join Organisation",
        createOrg: "Create Organisation",
      },
      // Navigation
      nav: {
        dashboard: "Dashboard",
        ideas: "Ideas",
        myIdeas: "My Ideas",
        newIdea: "New Idea",
        review: "Review",
        reviewQueue: "Review Queue",
        reviewAgents: "AI Agents",
        management: "Management",
        shortlisted: "Shortlisted",
        allIdeas: "All Ideas",
        users: "Users",
        settings: "Settings",
        analytics: "Analytics",
        discover: "AI Discovery",
        leaderboard: "Leaderboard",
        profile: "Profile",
      },
      // Ideas
      ideas: {
        title: "Title",
        summary: "Summary",
        content: "Content",
        domain: "Domain",
        department: "Department",
        tags: "Tags",
        status: {
          draft: "Draft",
          submitted: "Submitted",
          under_review: "Under Review",
          shortlisted: "Shortlisted",
          approved: "Approved",
          rejected: "Rejected",
          needs_revision: "Needs Revision",
        },
        createNew: "Create New Idea",
        editIdea: "Edit Idea",
        submitForReview: "Submit for Review",
        saveDraft: "Save as Draft",
        aiAssist: "AI Assist",
        improveWithAI: "Improve with AI",
      },
      // Review
      review: {
        score: "Score",
        stars: "Stars",
        feedback: "Feedback",
        shortlist: "Shortlist",
        reject: "Reject",
        needsRevision: "Needs Revision",
        approve: "Approve",
        assignReviewer: "Assign Reviewer",
        aiReview: "AI Review",
        manualReview: "Manual Review",
      },
      // Dashboard
      dashboard: {
        welcome: "Welcome back",
        totalIdeas: "Total Ideas",
        pendingReview: "Pending Review",
        approved: "Approved",
        points: "Points",
        recentActivity: "Recent Activity",
        quickActions: "Quick Actions",
      },
      // Analytics
      analytics: {
        overview: "Overview",
        trends: "Trends",
        byDomain: "By Domain",
        byDepartment: "By Department",
        topContributors: "Top Contributors",
        reviewerPerformance: "Reviewer Performance",
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
