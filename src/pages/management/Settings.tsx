import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings as SettingsIcon,
  Building2,
  Link2,
  Trophy,
  FileText,
  Copy,
  Check,
  Loader2,
  Trash2,
  Calendar,
} from "lucide-react";
import { organisationsApi } from "@/lib/api";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

type RewardSystem = "LEADERBOARD" | "POINTS" | "COUPONS" | "GIFTS" | "NONE";

interface OrganisationSettings {
  submissionMode: "ANONYMOUS" | "IDENTIFIED";
  dashboardMode: RewardSystem;
  ideaFormatTemplate?: string;
}

interface Organisation {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface InviteLink {
  id: string;
  code: string;
  url: string;
  role: string;
  isActive: boolean;
  usedCount: number;
  maxUses?: number;
  expiresAt?: string;
  createdAt?: string;
}

type ValidityOption = "1_WEEK" | "1_MONTH" | "1_YEAR" | "LIFETIME" | "CUSTOM";

const validityOptions: { value: ValidityOption; label: string }[] = [
  { value: "1_WEEK", label: "1 Week" },
  { value: "1_MONTH", label: "1 Month" },
  { value: "1_YEAR", label: "1 Year" },
  { value: "LIFETIME", label: "Lifetime" },
  { value: "CUSTOM", label: "Custom Date" },
];

const rewardOptions: {
  value: RewardSystem;
  label: string;
  description: string;
}[] = [
  {
    value: "LEADERBOARD",
    label: "Leaderboard",
    description: "Rank contributors publicly",
  },
  {
    value: "POINTS",
    label: "Points System",
    description: "Earn points for submissions",
  },
  {
    value: "COUPONS",
    label: "Coupons",
    description: "Reward with discount coupons",
  },
  { value: "GIFTS", label: "Gifts", description: "Physical gift rewards" },
  { value: "NONE", label: "None", description: "No reward system" },
];

const defaultTemplate = `## Problem Statement
What problem are you solving?

## Proposed Solution
Describe your innovative approach.

## Expected Impact
Quantify the potential benefits.

## Implementation Plan
Outline the steps to implement this idea.`;

export default function Settings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [settings, setSettings] = useState<OrganisationSettings | null>(null);
  const [inviteLinks, setInviteLinks] = useState<InviteLink[]>([]);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedValidity, setSelectedValidity] =
    useState<ValidityOption>("1_MONTH");
  const [customExpiryDate, setCustomExpiryDate] = useState("");
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);

  // Form state
  const [orgName, setOrgName] = useState("");
  const [anonymousSubmissions, setAnonymousSubmissions] = useState(false);
  const [rewardSystem, setRewardSystem] = useState<RewardSystem>("LEADERBOARD");
  const [ideaTemplate, setIdeaTemplate] = useState(defaultTemplate);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [orgRes, settingsRes, linksRes] = await Promise.all([
        organisationsApi.getCurrent(),
        organisationsApi.getSettings(),
        organisationsApi.getInviteLinks(),
      ]);

      setOrganisation(orgRes.data);
      setSettings(settingsRes.data);
      setInviteLinks(linksRes.data);

      // Set form values
      setOrgName(orgRes.data.name);
      setAnonymousSubmissions(settingsRes.data.submissionMode === "ANONYMOUS");
      setRewardSystem(settingsRes.data.dashboardMode || "LEADERBOARD");
      setIdeaTemplate(settingsRes.data.ideaFormatTemplate || defaultTemplate);
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Update organisation name if changed
      if (organisation && orgName !== organisation.name) {
        await organisationsApi.updateCurrent({ name: orgName });
      }

      // Update settings
      await organisationsApi.updateSettings({
        submissionMode: anonymousSubmissions ? "ANONYMOUS" : "IDENTIFIED",
        dashboardMode: rewardSystem,
        ideaFormatTemplate: ideaTemplate,
      });

      toast.success("Settings saved successfully");
      loadData();
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const getExpiryDate = (): string | undefined => {
    const now = new Date();
    switch (selectedValidity) {
      case "1_WEEK":
        return new Date(now.setDate(now.getDate() + 7)).toISOString();
      case "1_MONTH":
        return new Date(now.setMonth(now.getMonth() + 1)).toISOString();
      case "1_YEAR":
        return new Date(now.setFullYear(now.getFullYear() + 1)).toISOString();
      case "LIFETIME":
        return undefined;
      case "CUSTOM":
        return customExpiryDate
          ? new Date(customExpiryDate).toISOString()
          : undefined;
      default:
        return undefined;
    }
  };

  const generateInviteLink = async () => {
    try {
      setIsGeneratingLink(true);
      const expiresAt = getExpiryDate();
      const response = await organisationsApi.createInviteLink({
        role: "EMPLOYEE",
        expiresAt,
      });
      const newLinks = [response.data, ...inviteLinks];
      setInviteLinks(newLinks);
      setSelectedLinkId(response.data.id);
      setShowGenerateModal(false);
      setSelectedValidity("1_MONTH");
      setCustomExpiryDate("");
      toast.success("Invite link generated");
    } catch (error) {
      toast.error("Failed to generate invite link");
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const copyInviteLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const deactivateLink = async (linkId: string) => {
    try {
      await organisationsApi.deactivateInviteLink(linkId);
      setInviteLinks(
        inviteLinks.map((link) =>
          link.id === linkId ? { ...link, isActive: false } : link
        )
      );
      if (selectedLinkId === linkId) {
        const remainingActive = inviteLinks.find(
          (l) => l.id !== linkId && l.isActive
        );
        setSelectedLinkId(remainingActive?.id || null);
      }
      toast.success("Invite link deactivated");
    } catch (error) {
      toast.error("Failed to deactivate invite link");
    }
  };

  const deleteLink = async (linkId: string) => {
    try {
      await organisationsApi.deleteInviteLink(linkId);
      setInviteLinks(inviteLinks.filter((link) => link.id !== linkId));
      if (selectedLinkId === linkId) {
        const remainingActive = inviteLinks.find(
          (l) => l.id !== linkId && l.isActive
        );
        setSelectedLinkId(remainingActive?.id || null);
      }
      toast.success("Invite link deleted");
    } catch (error) {
      toast.error("Failed to delete invite link");
    }
  };

  // Get active links and selected link
  const activeLinks = inviteLinks.filter(
    (link) =>
      link.isActive &&
      (!link.expiresAt || new Date(link.expiresAt) > new Date())
  );
  const selectedLink = selectedLinkId
    ? inviteLinks.find((l) => l.id === selectedLinkId)
    : activeLinks[0];

  // Set initial selected link
  useEffect(() => {
    if (!selectedLinkId && activeLinks.length > 0) {
      setSelectedLinkId(activeLinks[0].id);
    }
  }, [activeLinks, selectedLinkId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Configure your organization's innovation platform
          </p>
        </div>
      </div>

      {/* Organization Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="w-4 h-4" />
            Organization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input
              id="orgName"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Acme Corporation"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Anonymous Submissions</Label>
              <p className="text-sm text-muted-foreground">
                Hide submitter identity from reviewers
              </p>
            </div>
            <Switch
              checked={anonymousSubmissions}
              onCheckedChange={setAnonymousSubmissions}
            />
          </div>
        </CardContent>
      </Card>

      {/* Employee Invitations Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Link2 className="w-4 h-4" />
            Employee Invitations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Active Invite Link Display */}
          <div className="space-y-2">
            <Label>Active Invite Link</Label>
            <div className="flex gap-2">
              <Input
                value={selectedLink?.url || ""}
                readOnly
                placeholder="No active invite link"
                className="bg-muted font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => selectedLink && copyInviteLink(selectedLink.url)}
                disabled={!selectedLink}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Share this link with employees to let them join the platform
            </p>
            {selectedLink && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Used: {selectedLink.usedCount} times</span>
                {selectedLink.expiresAt ? (
                  <span>
                    Expires:{" "}
                    {new Date(selectedLink.expiresAt).toLocaleDateString()}
                  </span>
                ) : (
                  <span>Lifetime</span>
                )}
              </div>
            )}
          </div>

          {/* Generate New Link Section */}
          {showGenerateModal ? (
            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">
                  Generate New Invite Link
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowGenerateModal(false)}
                >
                  Cancel
                </Button>
              </div>

              <div className="space-y-3">
                <Label>Link Validity</Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {validityOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedValidity(option.value)}
                      className={cn(
                        "px-3 py-2 rounded-md border text-sm transition-all",
                        selectedValidity === option.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {selectedValidity === "CUSTOM" && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={customExpiryDate}
                      onChange={(e) => setCustomExpiryDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-auto"
                    />
                  </div>
                )}
              </div>

              <Button
                onClick={generateInviteLink}
                disabled={
                  isGeneratingLink ||
                  (selectedValidity === "CUSTOM" && !customExpiryDate)
                }
              >
                {isGeneratingLink ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Generate Link
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowGenerateModal(true)}
              >
                Generate New Link
              </Button>
              {selectedLink && (
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={() => deactivateLink(selectedLink.id)}
                >
                  Deactivate Current Link
                </Button>
              )}
            </div>
          )}

          {/* All Invite Links History */}
          {inviteLinks.length > 0 && (
            <div className="space-y-3">
              <Label>Invite Link History</Label>
              <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                {inviteLinks.map((link) => {
                  const isExpired =
                    link.expiresAt && new Date(link.expiresAt) < new Date();
                  const isUsable = link.isActive && !isExpired;

                  return (
                    <div
                      key={link.id}
                      className={cn(
                        "p-3 flex items-center justify-between text-sm cursor-pointer transition-colors",
                        !isUsable && "bg-muted/50",
                        selectedLinkId === link.id &&
                          isUsable &&
                          "bg-primary/5 border-l-2 border-l-primary"
                      )}
                      onClick={() => isUsable && setSelectedLinkId(link.id)}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-0.5 rounded">
                            {link.code}
                          </code>
                          {isExpired ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                              Expired
                            </span>
                          ) : (
                            <span
                              className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                link.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              )}
                            >
                              {link.isActive ? "Active" : "Inactive"}
                            </span>
                          )}
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            {link.role}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground flex gap-3">
                          <span>Used: {link.usedCount}</span>
                          {link.expiresAt ? (
                            <span>
                              {isExpired
                                ? `Expired on ${new Date(
                                    link.expiresAt
                                  ).toLocaleDateString()}`
                                : `Expires: ${new Date(
                                    link.expiresAt
                                  ).toLocaleDateString()}`}
                            </span>
                          ) : (
                            <span>Lifetime</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {isUsable && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyInviteLink(link.url);
                            }}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        )}
                        {link.isActive && !isExpired && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-orange-600 hover:text-orange-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              deactivateLink(link.id);
                            }}
                          >
                            Deactivate
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteLink(link.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reward System Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="w-4 h-4" />
            Reward System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {rewardOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setRewardSystem(option.value)}
                className={cn(
                  "p-4 rounded-lg border text-left transition-all",
                  rewardSystem === option.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/50"
                )}
              >
                <p className="font-medium text-sm">{option.label}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {option.description}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Idea Template Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4" />
            Idea Template
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default Structure for New Ideas</Label>
            <Textarea
              value={ideaTemplate}
              onChange={(e) => setIdeaTemplate(e.target.value)}
              rows={10}
              className="font-mono text-sm"
              placeholder="Enter the default template for new ideas..."
            />
            <p className="text-sm text-muted-foreground">
              This template will be shown to employees when creating new ideas.
              Use Markdown formatting.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
