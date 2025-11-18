'use client';

import { Agent, AgentLog } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime } from '@/lib/utils';

export function AgentDashboard({ agents }: { agents: Agent[] }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard des Agents IA</h2>

      {/* Vue d'ensemble */}
      <div className="grid md:grid-cols-5 gap-4">
        {['idle', 'thinking', 'working', 'completed', 'error'].map((status) => {
          const count = agents.filter((a) => a.status === status).length;
          return (
            <Card key={status}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">{count}</p>
                  <p className="text-sm text-muted-foreground capitalize">{status}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Liste des agents */}
      <div className="grid gap-4">
        {agents.map((agent) => (
          <Card key={agent.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{agent.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{agent.description}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={agent.status} />
                  <p className="text-sm mt-1">{agent.progress}%</p>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Barre de progression */}
              <div className="mb-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${agent.progress}%` }}
                  />
                </div>
              </div>

              {/* Tâche actuelle */}
              {agent.currentTask && (
                <p className="text-sm mb-3">
                  <span className="font-medium">Tâche actuelle:</span> {agent.currentTask}
                </p>
              )}

              {/* Logs récents */}
              {agent.logs.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium text-sm mb-2">Logs récents:</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto bg-gray-50 p-3 rounded text-xs font-mono">
                    {agent.logs.slice(-5).map((log) => (
                      <div key={log.id} className="flex gap-2">
                        <span className="text-gray-500">{formatDateTime(log.timestamp)}</span>
                        <LogLevelBadge level={log.level} />
                        <span>{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Screenshots */}
              {agent.screenshots.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium text-sm mb-2">
                    Screenshots ({agent.screenshots.length}):
                  </p>
                  <div className="flex gap-2 overflow-x-auto">
                    {agent.screenshots.slice(-3).map((screenshot) => (
                      <div key={screenshot.id} className="flex-shrink-0">
                        <img
                          src={screenshot.url}
                          alt={screenshot.description}
                          className="w-32 h-24 object-cover rounded border"
                        />
                        <p className="text-xs mt-1 text-center">{screenshot.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Agent['status'] }) {
  const colors = {
    idle: 'bg-gray-200 text-gray-800',
    thinking: 'bg-blue-200 text-blue-800',
    working: 'bg-yellow-200 text-yellow-800',
    completed: 'bg-green-200 text-green-800',
    error: 'bg-red-200 text-red-800',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status]}`}>
      {status}
    </span>
  );
}

function LogLevelBadge({ level }: { level: AgentLog['level'] }) {
  const colors = {
    info: 'text-blue-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    success: 'text-green-600',
  };

  const symbols = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    success: '✅',
  };

  return <span className={colors[level]}>{symbols[level]}</span>;
}
