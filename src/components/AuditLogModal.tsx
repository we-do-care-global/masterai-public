import React from 'react';
import { X, ShieldAlert, Clock, CheckCircle2, User, Database } from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLog[];
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose, logs }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-bold text-base text-white">System Audit & Security Logs</h3>
              <p className="text-xs text-slate-400">Complete immutable audit trail of automated cron runs and GitHub operations</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Logs Table */}
        <div className="p-6 overflow-y-auto space-y-3">
          {logs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No audit records recorded yet.</div>
          ) : (
            logs.map(log => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-indigo-300 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded text-[11px]">
                      {log.action}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-300">{log.entity}: <strong className="text-white font-mono">{log.entity_id}</strong></span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>

                {log.metadata && (
                  <pre className="text-[11px] font-mono text-slate-400 bg-slate-950 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
