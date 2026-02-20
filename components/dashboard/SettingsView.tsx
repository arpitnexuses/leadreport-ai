"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

type ProjectStats = {
  name: string;
  description?: string;
  isActive?: boolean;
  totalLeads: number;
  assignedUsers: number;
  reportOwners: number;
  solutionsCount: number;
  statusCounts: Record<string, number>;
};

export function SettingsView() {
  const [userRole, setUserRole] = useState<"admin" | "project_user" | "client" | null>(null);
  const [projects, setProjects] = useState<ProjectStats[]>([]);
  const [projectSolutions, setProjectSolutions] = useState<Record<string, string[]>>({});
  const [selectedProject, setSelectedProject] = useState("");
  const [projectDraft, setProjectDraft] = useState("");
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [isActiveDraft, setIsActiveDraft] = useState(true);
  const [solutionsDraft, setSolutionsDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [authRes, projectsRes, solutionsRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/projects"),
        fetch("/api/project-solutions"),
      ]);

      if (!authRes.ok) {
        throw new Error("Unable to load current user");
      }
      const authData = await authRes.json();
      setUserRole(authData.role);

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData.projects || []);
      } else {
        setProjects([]);
      }

      if (solutionsRes.ok) {
        const solutionsData = await solutionsRes.json();
        setProjectSolutions(solutionsData.projectSolutions || {});
      } else {
        setProjectSolutions({});
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const configuredProjectNames = useMemo(() => projects.map((project) => project.name), [projects]);
  const projectAutocompleteOptions = useMemo(
    () => Array.from(new Set([...configuredProjectNames, ...Object.keys(projectSolutions)])).sort(),
    [configuredProjectNames, projectSolutions]
  );
  const projectSuggestions = useMemo(() => {
    const query = projectDraft.trim().toLowerCase();
    if (!query) return projectAutocompleteOptions.slice(0, 8);
    return projectAutocompleteOptions
      .filter((project) => project.toLowerCase().includes(query))
      .slice(0, 8);
  }, [projectDraft, projectAutocompleteOptions]);

  useEffect(() => {
    if (!selectedProject && projectAutocompleteOptions.length > 0) {
      setSelectedProject(projectAutocompleteOptions[0]);
    }
  }, [projectAutocompleteOptions, selectedProject]);

  useEffect(() => {
    if (!selectedProject) {
      setProjectDraft("");
      setDescriptionDraft("");
      setIsActiveDraft(true);
      setSolutionsDraft("");
      return;
    }

    const selectedProjectStats = projects.find((project) => project.name === selectedProject);
    setProjectDraft(selectedProject);
    setDescriptionDraft(selectedProjectStats?.description || "");
    setIsActiveDraft(selectedProjectStats?.isActive !== false);
    setSolutionsDraft((projectSolutions[selectedProject] || []).join(", "));
  }, [selectedProject, projectSolutions, projects]);

  const handleSave = async () => {
    if (userRole !== "admin") return;

    const project = projectDraft.trim();
    const solutions = Array.from(
      new Set(
        solutionsDraft
          .split(",")
          .map((value) => value.trim())
          .filter((value) => value !== "")
      )
    );

    if (!project) {
      setError("Project name is required");
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      const currentName = selectedProject || project;
      const [projectRes, solutionsRes] = await Promise.all([
        fetch("/api/projects", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentName,
            newName: project,
            description: descriptionDraft,
            isActive: isActiveDraft,
          }),
        }),
        fetch("/api/project-solutions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ project, solutions }),
        }),
      ]);

      if (!projectRes.ok) {
        const body = await projectRes.json().catch(() => null);
        throw new Error(body?.error || "Failed to save project settings");
      }
      if (!solutionsRes.ok) {
        const body = await solutionsRes.json().catch(() => null);
        throw new Error(body?.error || "Failed to save project solutions");
      }

      await loadData();
      setSelectedProject(project);
      setSuccess("Saved project settings");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedProject("");
    setProjectDraft("");
    setDescriptionDraft("");
    setIsActiveDraft(true);
    setSolutionsDraft("");
    setSuccess("");
    setError("");
  };

  const handleDeleteProject = async () => {
    if (userRole !== "admin") return;

    const projectToDelete = selectedProject || projectDraft.trim();
    if (!projectToDelete) {
      setError("Select a project to delete");
      return;
    }

    const leadsCount = selectedProjectStats?.totalLeads || 0;
    const usersCount = selectedProjectStats?.assignedUsers || 0;
    const warningMessage = `Delete project "${projectToDelete}"?\n\nThis will:\n- move ${leadsCount} lead(s) to Unassigned\n- remove project access from ${usersCount} user(s)\n- delete project solutions/settings\n\nThis action cannot be undone.`;
    if (!window.confirm(warningMessage)) {
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      setSuccess("");
      const response = await fetch("/api/projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName: projectToDelete }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Failed to delete project");
      }

      await loadData();
      setSelectedProject("");
      setProjectDraft("");
      setDescriptionDraft("");
      setSolutionsDraft("");
      setSuccess(`Deleted project "${projectToDelete}"`);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedProjectStats = projects.find((project) => project.name === selectedProject) || null;
  const statusEntries = selectedProjectStats ? Object.entries(selectedProjectStats.statusCounts || {}) : [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-300">Configure project-level solution tags</p>
      </div>
      <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
        <CardContent className="p-8">
          {isLoading ? (
            <p className="text-gray-600 dark:text-gray-300">Loading settings...</p>
          ) : userRole !== "admin" ? (
            <p className="text-gray-600 dark:text-gray-300">
              Only admins can manage project solution tags.
            </p>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                {projectAutocompleteOptions.map((project) => (
                  <button
                    key={project}
                    type="button"
                    onClick={() => setSelectedProject(project)}
                    className={`rounded-full px-3 py-1.5 text-sm border ${
                      selectedProject === project
                        ? "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
                        : "bg-white text-gray-700 border-gray-300 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700"
                    }`}
                  >
                    {project}
                  </button>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={handleCreateNew}>
                  <Plus className="w-4 h-4 mr-1" />
                  New Project
                </Button>
              </div>

              {selectedProjectStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="rounded-xl border p-3">
                    <p className="text-xs text-gray-500">Total Leads</p>
                    <p className="text-xl font-semibold">{selectedProjectStats.totalLeads}</p>
                  </div>
                  <div className="rounded-xl border p-3">
                    <p className="text-xs text-gray-500">Assigned Users</p>
                    <p className="text-xl font-semibold">{selectedProjectStats.assignedUsers}</p>
                  </div>
                  <div className="rounded-xl border p-3">
                    <p className="text-xs text-gray-500">Report Owners</p>
                    <p className="text-xl font-semibold">{selectedProjectStats.reportOwners}</p>
                  </div>
                  <div className="rounded-xl border p-3">
                    <p className="text-xs text-gray-500">Solutions</p>
                    <p className="text-xl font-semibold">{selectedProjectStats.solutionsCount}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project
                  </label>
                  <Input
                    value={projectDraft}
                    onChange={(event) => setProjectDraft(event.target.value)}
                    placeholder="Project name"
                    list="admin-project-suggestions"
                  />
                  <datalist id="admin-project-suggestions">
                    {projectAutocompleteOptions.map((project) => (
                      <option key={project} value={project} />
                    ))}
                  </datalist>
                  {projectSuggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {projectSuggestions.map((project) => (
                        <button
                          key={project}
                          type="button"
                          onClick={() => setProjectDraft(project)}
                          className="rounded-full border border-gray-300 dark:border-gray-700 px-2.5 py-1 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
                        >
                          {project}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <Input
                    value={descriptionDraft}
                    onChange={(event) => setDescriptionDraft(event.target.value)}
                    placeholder="General notes for this project"
                  />
                </div>
                <div>
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={isActiveDraft}
                      onChange={(event) => setIsActiveDraft(event.target.checked)}
                      className="rounded border-gray-300"
                    />
                    Project is active
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Solutions (comma separated)
                  </label>
                  <Input
                    value={solutionsDraft}
                    onChange={(event) => setSolutionsDraft(event.target.value)}
                    placeholder="e.g. HR, Finance, Security"
                  />
                </div>
                {statusEntries.length > 0 && (
                  <div className="rounded-xl border p-3">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Lead Status Breakdown</p>
                    <div className="flex flex-wrap gap-2">
                      {statusEntries.map(([status, count]) => (
                        <span
                          key={status}
                          className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs"
                        >
                          {status}: {count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Button type="button" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                  {(selectedProject || projectDraft.trim()) && (
                    <Button
                      type="button"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={handleDeleteProject}
                      disabled={isSaving}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete Project
                    </Button>
                  )}
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 