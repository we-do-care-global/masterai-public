import React, { useState } from 'react';
import {
  Kanban as KanbanIcon,
  Plus,
  GitPullRequest,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Filter,
} from 'lucide-react';
import { RoadmapItem, RoadmapStatus, PriorityLevel, Project } from '../types';

interface KanbanBoardProps {
  items: RoadmapItem[];
  projects: Project[];
  onUpdateStatus: (id: string, status: RoadmapStatus) => void;
  onAddItem: (data: Partial<RoadmapItem>) => void;
}

const COLUMNS: Array<{ id: RoadmapStatus; label: string; color: string; border: string }> = [
  { id: 'backlog', label: 'Backlog', color: 'bg-slate-800/80', border: 'border-slate-700' },
  { id: 'planned', label: 'Planned', color: 'bg-indigo-950/30', border: 'border-indigo-500/30' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-amber-950/30', border: 'border-amber-500/30' },
  { id: 'review', label: 'Review', color: 'bg-purple-950/30', border: 'border-purple-500/30' },
  { id: 'done', label: 'Done', color: 'bg-emerald-950/30', border: 'border-emerald-500/30' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  items,
  projects,
  onUpdateStatus,
  onAddItem,
}) => {
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<PriorityLevel>('medium');
  const [newProjectId, setNewProjectId] = useState<string>(projects[0]?.id || '');

  const filteredItems = items.filter(item => {
    if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddItem({
      title: newTitle,
      description: newDesc,
      priority: newPriority,
      project_id: newProjectId,
      status: 'planned',
    });
    setNewTitle('');
    setNewDesc('');
    setIsAddingItem(false);
  };

  const getNextStatus = (current: RoadmapStatus): RoadmapStatus | null => {
    const order: RoadmapStatus[] = ['backlog', 'planned', 'in_progress', 'review', 'done'];
    const idx = order.indexOf(current);
    return idx < order.length - 1 ? order[idx + 1] : null;
  };

  const getPrevStatus = (current: RoadmapStatus): RoadmapStatus | null => {
    const order: RoadmapStatus[] = ['backlog', 'planned', 'in_progress', 'review', 'done'];
    const idx = order.indexOf(current);
    return idx > 0 ? order[idx - 1] : null;
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <KanbanIcon className="w-5 h-5 text-indigo-400" />
            <span>Roadmap & Execution Backlog</span>
          </h3>
          <p className="text-xs text-slate-400">
            Convert AI research expansions into GitHub-linked delivery stages
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Priority filter */}
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none text-xs"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <button
            onClick={() => setIsAddingItem(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Roadmap Item</span>
          </button>
        </div>
      </div>

      {/* Add Item Inline Modal */}
      {isAddingItem && (
        <form onSubmit={handleCreate} className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 space-y-3 text-xs">
          <div className="font-bold text-white">Create New Roadmap Item</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Item title"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
            />
            <select
              value={newPriority}
              onChange={e => setNewPriority(e.target.value as PriorityLevel)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="critical">Critical Priority</option>
            </select>
          </div>
          <textarea
            rows={2}
            placeholder="Description and technical notes..."
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingItem(false)}
              className="px-3 py-1 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
            >
              Save Item
            </button>
          </div>
        </form>
      )}

      {/* Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 items-start">
        {COLUMNS.map(col => {
          const colItems = filteredItems.filter(i => i.status === col.id);
          return (
            <div
              key={col.id}
              className={`rounded-2xl border ${col.border} ${col.color} p-3 flex flex-col min-h-[380px] shadow-sm`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/60">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                  {col.label}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900/80 text-slate-300">
                  {colItems.length}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-2.5 flex-1">
                {colItems.map(item => {
                  const next = getNextStatus(item.status);
                  const prev = getPrevStatus(item.status);

                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md text-xs space-y-2 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            item.priority === 'critical'
                              ? 'bg-rose-500/20 text-rose-300'
                              : item.priority === 'high'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-indigo-500/20 text-indigo-300'
                          }`}
                        >
                          {item.priority}
                        </span>
                        {item.github_issue_url && (
                          <a
                            href={item.github_issue_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                            title="View GitHub Issue"
                          >
                            <GitPullRequest className="w-3 h-3" />
                            <span>Issue</span>
                          </a>
                        )}
                      </div>

                      <h4 className="font-semibold text-white leading-snug">{item.title}</h4>
                      {item.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      {/* Move buttons */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] text-slate-500">
                        {prev ? (
                          <button
                            onClick={() => onUpdateStatus(item.id, prev)}
                            className="hover:text-slate-200 flex items-center gap-0.5"
                            title={`Move back to ${prev}`}
                          >
                            <ChevronLeft className="w-3 h-3" />
                            <span className="capitalize">{prev}</span>
                          </button>
                        ) : <span />}

                        {next && (
                          <button
                            onClick={() => onUpdateStatus(item.id, next)}
                            className="hover:text-indigo-300 text-indigo-400 font-medium flex items-center gap-0.5 ml-auto"
                            title={`Advance to ${next}`}
                          >
                            <span className="capitalize">{next}</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {colItems.length === 0 && (
                  <div className="py-8 text-center text-[11px] text-slate-500 border border-dashed border-slate-800 rounded-xl">
                    No items in {col.label}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
