import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Clock,
  Key,
  Cpu,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { AppSettings, UserProfile } from '../types';

interface SettingsViewProps {
  settings: AppSettings | null;
  currentUser: UserProfile;
  onSave: (updated: Partial<AppSettings>) => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, currentUser, onSave }) => {
  const [dailyTz, setDailyTz] = useState(settings?.daily_research_tz || 'Europe/Sarajevo');
  const [dailyCron, setDailyCron] = useState(settings?.daily_research_cron || '0 8 * * *');
  const [eveningCron, setEveningCron] = useState(settings?.evening_research_cron || '0 20 * * *');
  const [eveningEnabled, setEveningEnabled] = useState(settings?.evening_run_enabled ?? true);
  const [autoIssue, setAutoIssue] = useState(settings?.auto_create_github_issue ?? true);
  const [aiProvider, setAiProvider] = useState(settings?.ai_provider || 'gemini-3.8-flash');
  const [githubOrg, setGithubOrg] = useState(settings?.github_repo_owner || 'we-do-care-global');
  const [githubRepo, setGithubRepo] = useState(settings?.github_repo_name || 'we-do-care-global');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const isAdmin = currentUser.role === 'admin';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setSavedSuccess(false);
      await onSave({
        daily_research_tz: dailyTz,
        daily_research_cron: dailyCron,
        evening_research_cron: eveningCron,
        evening_run_enabled: eveningEnabled,
        auto_create_github_issue: autoIssue,
        ai_provider: aiProvider,
        github_repo_owner: githubOrg,
        github_repo_name: githubRepo,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-indigo-400" />
            <span>Platform Settings & Automation</span>
          </h2>
          <p className="text-xs text-slate-400">
            Configure automated research schedules, GitHub connection parameters, and AI model backends.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Schedule & Timezone Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Daily Automated Expansion Schedule</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Local Timezone (Europe/Sarajevo Default)
              </label>
              <select
                value={dailyTz}
                onChange={e => setDailyTz(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value="Europe/Sarajevo">Europe/Sarajevo (UTC+1 / CEST)</option>
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">America/New_York (Eastern)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Morning Cron Expression (08:00)
              </label>
              <input
                type="text"
                value={dailyCron}
                onChange={e => setDailyCron(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Evening Cron Expression (20:00)
              </label>
              <input
                type="text"
                value={eveningCron}
                onChange={e => setEveningCron(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={eveningEnabled}
                  onChange={e => setEveningEnabled(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600"
                />
                <span className="font-semibold text-white">Enable 20:00 Evening Run</span>
              </label>
            </div>
          </div>
        </div>

        {/* GitHub Automation Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            <span>GitHub Sync & Automation</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Default Organization / Owner
              </label>
              <input
                type="text"
                value={githubOrg}
                onChange={e => setGithubOrg(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Default Repository Name
              </label>
              <input
                type="text"
                value={githubRepo}
                onChange={e => setGithubRepo(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/60 border border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={autoIssue}
              onChange={e => setAutoIssue(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-indigo-600"
            />
            <div>
              <span className="font-semibold text-white block">Automatically Create GitHub Issues on Daily Expansion</span>
              <span className="text-[11px] text-slate-400">
                When enabled, the 08:00 cron run will automatically publish the day's proposal as an issue in {githubOrg}/{githubRepo}.
              </span>
            </div>
          </label>
        </div>

        {/* AI & Security Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            <span>AI Model Backend & Search Grounding</span>
          </h3>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Primary Research Model
            </label>
            <select
              value={aiProvider}
              onChange={e => setAiProvider(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
            >
              <option value="gemini-3.8-flash">Google Gemini 3.8 Flash (with live Google Search Grounding)</option>
              <option value="gemini-3.1-pro-preview">Google Gemini 3.1 Pro Preview (Deep STEM & Reasoning)</option>
              <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet (via Server Proxy)</option>
              <option value="gpt-4o">OpenAI GPT-4o (via Server Proxy)</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300">API Keys strictly protected in backend environment</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">Zero Secrets in Client</span>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
          {!isAdmin ? (
            <span className="text-xs text-amber-400 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Read-only mode: Only Admins can modify settings.</span>
            </span>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Settings successfully saved!</span>
              </span>
            )}
            <button
              type="submit"
              disabled={isSaving || !isAdmin}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : isAdmin ? 'Save Settings' : 'Admin Role Required'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
