import React, { useState } from 'react';
import {
  X,
  FolderGit2,
  GitBranch,
  Sparkles,
  Layers,
  Wrench,
  CheckCircle2,
  Clock,
  Globe,
  Lock,
} from 'lucide-react';
import { Project, UserProfile } from '../types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile;
  onCreateProject: (data: {
    name: string;
    description: string;
    repo_owner: string;
    repo_name: string;
    default_branch?: string;
    visibility?: 'public' | 'private';
    research_focus?: string[];
    daily_research_time?: string;
    timezone?: string;
  }) => Promise<void>;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onCreateProject,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [repoOwner, setRepoOwner] = useState('we-do-care-global');
  const [repoName, setRepoName] = useState('');
  const [defaultBranch, setDefaultBranch] = useState('main');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [dailyTime, setDailyTime] = useState('08:00');
  const [timezone, setTimezone] = useState('Europe/Sarajevo');
  const [researchFocus, setResearchFocus] = useState<string[]>([
    'systems',
    'tools',
    'functions',
    'work',
    'automation',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = !currentUser || currentUser.role === 'admin';

  if (!isOpen) return null;

  const toggleFocus = (f: string) => {
    setResearchFocus(prev =>
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !repoName.trim()) return;

    try {
      setIsSubmitting(true);
      await onCreateProject({
        name,
        description,
        repo_owner: repoOwner,
        repo_name: repoName.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
        default_branch: defaultBranch,
        visibility,
        research_focus: researchFocus,
        daily_research_time: dailyTime,
        timezone,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <FolderGit2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Create & Link New Project</h3>
              <p className="text-xs text-slate-400">Configure GitHub repository & AI continuous expansion schedule</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (!repoName) {
                  setRepoName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'));
                }
              }}
              placeholder="e.g. Humanitarian Micro-Grants Portal"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Project Goals & Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Outline project mission, user personas, and target community outcomes..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>

          {/* GitHub Repo Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">
                GitHub Repo Owner / Org *
              </label>
              <input
                type="text"
                required
                value={repoOwner}
                onChange={e => setRepoOwner(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Repo Name *
              </label>
              <input
                type="text"
                required
                value={repoName}
                onChange={e => setRepoName(e.target.value)}
                placeholder="repo-slug"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Default Branch
              </label>
              <input
                type="text"
                value={defaultBranch}
                onChange={e => setDefaultBranch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Visibility
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border transition-all ${
                    visibility === 'public'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Public</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('private')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border transition-all ${
                    visibility === 'private'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Private</span>
                </button>
              </div>
            </div>
          </div>

          {/* AI Research Focus */}
          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Default AI Research Focus
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['systems', 'tools', 'functions', 'work', 'UX', 'security', 'performance', 'automation', 'monetization'].map(f => {
                const active = researchFocus.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleFocus(f)}
                    className={`px-2.5 py-1 rounded-lg border text-xs capitalize transition-colors ${
                      active
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-medium'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Schedule */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Daily Run Time (Default: 08:00)
              </label>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={dailyTime}
                  onChange={e => setDailyTime(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono text-xs w-full"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs w-full"
              >
                <option value="Europe/Sarajevo">Europe/Sarajevo (UTC+2/1)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 flex items-center justify-between gap-2 border-t border-slate-800">
            {!isAdmin ? (
              <span className="text-xs text-amber-400 font-medium">
                Admin role required to create projects.
              </span>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isAdmin || !name.trim() || !repoName.trim()}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow disabled:opacity-50"
              >
                {isSubmitting ? 'Creating Project...' : isAdmin ? 'Create & Link Project' : 'Admin Role Required'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
