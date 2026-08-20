import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { getTagColor, getTagTextColor } from '../lib/colors';
import { Tag, Calendar, Zap, Filter, ChevronDown, ChevronUp } from 'lucide-react';

export default function TaskFilters() {
  const { 
    taskFilterTag, setTaskFilterTag,
    taskFilterTimeline, setTaskFilterTimeline,
    taskFilterPriority, setTaskFilterPriority,
    tasks, habits
  } = useStore();

  const [isExpanded, setIsExpanded] = useState(false);

  // Get all unique tags used in current tasks and habits
  const allUsedTags = Array.from(new Set([
    ...tasks.flatMap(t => t.tags || []),
    ...habits.flatMap(h => h.tags || [])
  ]));

  const activeTagClass = "bg-(--color-primary) text-white border-transparent";
  const inactiveTagClass = "bg-(--color-surface-2) text-(--color-muted-text) border-(--color-border) hover:border-(--color-primary-60)";

  const hasActiveFilters = taskFilterTimeline !== 'all' || taskFilterTag !== null;

  return (
    <div className="bg-(--color-surface) rounded-xl shadow-sm border border-(--color-border) mb-6 flex flex-col">
      {/* Top Header / Quick Actions */}
      <div className="p-3 md:p-4 flex flex-row items-center justify-between gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-lg border cursor-pointer transition-colors text-sm font-bold ${
            hasActiveFilters || isExpanded
              ? 'bg-(--color-primary)/10 border-(--color-primary)/30 text-(--color-primary)' 
              : 'bg-(--color-surface-2) border-(--color-border) text-(--color-muted-text) hover:border-(--color-primary)/30 hover:text-(--color-on-surface)'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-(--color-primary) animate-pulse" />}
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Priority Filter (Always visible for quick access) */}
        <button
          onClick={() => setTaskFilterPriority(!taskFilterPriority)}
          className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-lg border cursor-pointer transition-colors text-sm font-bold ${
            taskFilterPriority 
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-500' 
              : 'bg-(--color-surface-2) border-(--color-border) text-(--color-muted-text) hover:border-amber-500/30 hover:text-amber-500'
          }`}
          title="Focus Mode: Show only top priority tasks and uncompleted daily habits"
        >
          <Zap className={`w-4 h-4 ${taskFilterPriority ? 'fill-amber-500' : ''}`} />
          Do First
        </button>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="p-3 md:p-4 pt-0 border-t border-(--color-border) flex flex-col gap-4 mt-2">
          {/* Timeline Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-(--color-muted-text) min-w-[80px]">
              <Calendar className="w-4 h-4" /> Timeline:
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              {(['all', 'daily', 'weekly', 'monthly'] as const).map(timeline => (
                <button
                  key={timeline}
                  onClick={() => setTaskFilterTimeline(timeline)}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-md capitalize transition-colors border cursor-pointer outline-none ${
                    taskFilterTimeline === timeline 
                      ? 'bg-(--color-primary) border-(--color-primary) text-white' 
                      : 'bg-(--color-surface-2) border-(--color-border) text-(--color-muted-text) hover:text-(--color-on-surface)'
                  }`}
                >
                  {timeline}
                </button>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          {allUsedTags.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t border-(--color-border)/50">
              <div className="flex items-center gap-2 text-sm font-bold text-(--color-muted-text) min-w-[80px]">
                <Tag className="w-4 h-4" /> Tags:
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setTaskFilterTag(null)}
                  className={`px-3 py-1 rounded-full text-xs font-bold border cursor-pointer transition-colors ${
                    taskFilterTag === null ? activeTagClass : inactiveTagClass
                  }`}
                >
                  All Tags
                </button>
                {allUsedTags.map(tag => {
                  const isActive = taskFilterTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => setTaskFilterTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-bold border cursor-pointer transition-colors`}
                      style={isActive ? {
                        backgroundColor: getTagColor(tag),
                        color: getTagTextColor(tag),
                        borderColor: getTagTextColor(tag)
                      } : {
                        backgroundColor: 'transparent',
                        color: 'var(--color-muted-text)',
                        borderColor: 'var(--color-border)'
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
