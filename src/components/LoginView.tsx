import React, { useState } from 'react';
import {
  Heart,
  Sparkles,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Globe,
  AlertCircle,
  Check,
  UserCheck,
} from 'lucide-react';
import { UserProfile } from '../types';

interface LoginViewProps {
  onLogin: (customProfile?: Partial<UserProfile>) => Promise<void>;
  onGoogleLogin: (email: string, name?: string, avatarUrl?: string) => Promise<void>;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onGoogleLogin }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'none' | 'github' | 'google'>('none');
  const [customUsername, setCustomUsername] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Google Auth Test Modal / Input
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('demo.admin@example.invalid');
  const [googleError, setGoogleError] = useState<string | null>(null);

  const handleGitHubOAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginMethod('github');
    try {
      const custom = customUsername.trim()
        ? {
            github_username: customUsername.trim(),
            name: customUsername.trim(),
            email: `${customUsername.trim().toLowerCase()}@example.invalid`,
          }
        : undefined;
      await onLogin(custom);
    } finally {
      setIsLoggingIn(false);
      setLoginMethod('none');
    }
  };

  const handleDirectGoogleLogin = async () => {
    setIsLoggingIn(true);
    setLoginMethod('google');
    setGoogleError(null);
    try {
      await onGoogleLogin('demo.admin@example.invalid', 'Demo Admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
    } catch (err: any) {
      setGoogleError(err?.message || 'Access Denied');
    } finally {
      setIsLoggingIn(false);
      setLoginMethod('none');
    }
  };

  const handleCustomGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginMethod('google');
    setGoogleError(null);
    try {
      await onGoogleLogin(
        googleEmailInput.trim(),
        googleEmailInput.toLowerCase() === 'demo.admin@example.invalid' ? 'Demo Admin' : 'Test User',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      );
      setShowGoogleModal(false);
    } catch (err: any) {
      setGoogleError(err?.message || 'Access Denied: Only demo.admin@example.invalid is authorized.');
    } finally {
      setIsLoggingIn(false);
      setLoginMethod('none');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        {/* Logo */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/20 mb-4">
          <Heart className="w-8 h-8 text-white fill-white/20" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          We Do Care Global
        </h2>
        <p className="mt-1 text-xs text-indigo-300 font-semibold tracking-wide uppercase">
          AI Web Research & System Expansion Platform
        </p>
        <p className="mt-2 text-xs text-slate-400 max-w-sm mx-auto">
          Automated continuous discovery for non-profit systems, tools, functions, and community workflows.
        </p>
      </div>

      <div role="status" className="mt-6 mx-auto max-w-md rounded-xl border border-amber-500/40 bg-amber-950/40 p-4 text-sm text-amber-100">
        Authentication is currently disabled for security review. GitHub and Google sign-in are not operational. Do not enter real credentials or personal information.
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Status highlight */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300">GitHub Organization</span>
            </div>
            <span className="font-mono text-emerald-400 font-semibold text-[11px]">
              we-do-care-global
            </span>
          </div>

          {/* Authentication Options */}
          <fieldset disabled aria-label="Authentication disabled pending security review" className="space-y-3 opacity-60">
            {/* Google Login for demo.admin@example.invalid */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleDirectGoogleLogin}
                disabled={isLoggingIn}
                className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm shadow-lg shadow-white/10 transition-all duration-200 cursor-pointer disabled:opacity-50 group"
              >
                <div className="flex items-center gap-3">
                  {/* Google "G" Logo */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>
                    {isLoggingIn && loginMethod === 'google'
                      ? 'Authenticating Google...'
                      : 'Continue with Google'}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                  demo.admin@example.invalid
                </span>
              </button>

              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Google authentication unavailable
                </span>
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(true)}
                  className="text-[10px] text-slate-400 hover:text-slate-300 underline"
                >
                  Test email whitelist check
                </button>
              </div>
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-800" />
              <span className="flex-shrink mx-3 text-slate-500 text-[10px] uppercase tracking-wider font-semibold">
                Or Continue with GitHub
              </span>
              <div className="flex-grow border-t border-slate-800" />
            </div>

            {/* GitHub Login Button */}
            <form onSubmit={handleGitHubOAuth} className="space-y-4">
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all duration-200 cursor-pointer disabled:opacity-50"
                id="github-oauth-btn"
              >
                <GitBranch className="w-5 h-5" />
                <span>
                  {isLoggingIn && loginMethod === 'github'
                    ? 'Connecting to GitHub...'
                    : 'Continue with GitHub'}
                </span>
                <ArrowRight className="w-4 h-4 opacity-75" />
              </button>

              {/* Custom identity option */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-[11px] text-slate-400 hover:text-slate-300 underline"
                >
                  {showAdvanced ? 'Hide login options' : 'Connect with custom GitHub handle'}
                </button>
              </div>

              {showAdvanced && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="block text-[11px] text-slate-400">
                    Custom GitHub Username
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. demo-admin"
                    value={customUsername}
                    onChange={e => setCustomUsername(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}
            </form>
          </fieldset>

          {/* Features Checklist */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Two-way GitHub sync for Issues, PRs, Labels & Pages</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>5 concurrent workers for background sync & research</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Low RAM usage with response compression & zero delay</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Verified authentication required before access</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Authentication disabled • API offline pending security review</span>
          </div>
        </div>
      </div>

      {/* Google Whitelist Verification Dialog */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Google Login Security Whitelist</span>
              </h3>
              <button
                onClick={() => setShowGoogleModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Google Login access is strictly enforced for your designated email:
              <strong className="text-emerald-400 block font-mono mt-1">demo.admin@example.invalid</strong>
            </p>

            {googleError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{googleError}</span>
              </div>
            )}

            <form onSubmit={handleCustomGoogleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Google Account Email:
                </label>
                <input
                  type="email"
                  value={googleEmailInput}
                  onChange={e => setGoogleEmailInput(e.target.value)}
                  placeholder="demo.admin@example.invalid"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="text-[11px] text-slate-400">
                Tip: Test entering any other email to verify the rejection guard, or use <code className="text-emerald-300">demo.admin@example.invalid</code> to enter as Admin.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow disabled:opacity-50"
                >
                  {isLoggingIn ? 'Verifying...' : 'Authenticate Google Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
