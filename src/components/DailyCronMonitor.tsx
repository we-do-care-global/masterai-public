import React, { useState } from 'react';
import {
  Clock,
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { AppSettings, Project } from '../types';

interface DailyCronMonitorProps {
  settings: AppSettings | null;
  projects: Project[];
  cronHistory: any[];
  onTriggerCron: (type: '08:00' | '20:00', force: boolean, mockDate?: string) => Promise<any>;
}

export const DailyCronMonitor: React.FC<DailyCronMonitorProps> = ({
  settings,
  projects,
  cronHistory,
  onTriggerCron,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [mockDateInput, setMockDateInput] = useState('');
  const [forceOverride, setForceOverride] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const handleRun = async (type: '08:00' | '20:00') => {
    try {
      setIsRunning(true);
      setLastResult(null);
      const res = await onTriggerCron(type, forceOverride, mockDateInput || undefined);
      setLastResult(res.message || 'Execution completed.');
    } catch (err: any) {
      setLastResult(`Error: ${err?.message || 'Execution failed'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const tz = settings?.daily_research_tz || 'Europe/Sarajevo';

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Daily Automated Expansion Monitor</h2>
            <p className="text-xs text-slate-400">
              Guaranteed exactly 1 new research expansion added every day at 08:00 (and optional 20:00 run)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Primary Schedule</div>
            <div className="text-xl font-bold text-white font-mono mt-1">08:00 Local</div>
            <div className="text-xs text-slate-400 mt-0.5">Timezone: <span className="text-indigo-400 font-semibold">{tz}</span></div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Optional Evening Run</div>
            <div className="text-xl font-bold text-white font-mono mt-1">20:00 Local</div>
            <div className="text-xs text-emerald-400 mt-0.5">
              {settings?.evening_run_enabled ? 'Enabled (Review & Follow-up)' : 'Disabled'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Idempotency Guard</div>
            <div className="text-xl font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
              <ShieldCheck className="w-5 h-5" />
              <span>Strict 1x / Day</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Keyed by date + project ID</div>
          </div>
        </div>
      </div>

      {/* Interactive Simulation & Test Suite */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span>Interactive Cron Tester & Clock Override</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Test the 08:00 or 20:00 scheduled jobs on-demand. Demonstrates the strict idempotency guard preventing duplicate additions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {/* 08:00 Trigger */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white">08:00 Morning Run</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
                08:00
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Discovers today's best system expansion across active projects.
            </p>
            <button
              onClick={() => handleRun('08:00')}
              disabled={isRunning}
              className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isRunning ? 'Executing...' : 'Trigger 08:00 Run'}</span>
            </button>
          </div>

          {/* 20:00 Trigger */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white">20:00 Evening Run</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono">
                20:00
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Runs post-day research review and synthesis for next day preparation.
            </p>
            <button
              onClick={() => handleRun('20:00')}
              disabled={isRunning}
              className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isRunning ? 'Executing...' : 'Trigger 20:00 Run'}</span>
            </button>
          </div>

          {/* Clock Override & Options */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/70 space-y-3">
            <span className="font-bold text-xs text-white">Mock Date Simulator</span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">
                Override Date (YYYY-MM-DD)
              </label>
              <input
                type="text"
                placeholder="2026-10-02"
                value={mockDateInput}
                onChange={e => setMockDateInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono placeholder-slate-600"
              />
            </div>
            <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={forceOverride}
                onChange={e => setForceOverride(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-indigo-600"
              />
              <span>Bypass idempotency guard (force)</span>
            </label>
          </div>
        </div>

        {lastResult && (
          <div className="p-3 rounded-xl bg-slate-950 border border-indigo-500/40 text-xs font-mono text-indigo-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{lastResult}</span>
          </div>
        )}
      </div>

      {/* Cron Idempotency History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span>Execution & Idempotency History</span>
        </h3>
        <div className="divide-y divide-slate-800 text-xs">
          {cronHistory.length === 0 ? (
            <div className="py-6 text-center text-slate-500">No scheduled runs recorded yet.</div>
          ) : (
            cronHistory.map((h, i) => (
              <div key={i} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-indigo-400 font-semibold">{h.date}</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                    {h.type} run
                  </span>
                  <span className="text-slate-400 truncate max-w-xs">{h.expansion_id}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {new Date(h.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
