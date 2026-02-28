"use client";

import { Clock, Upload, AlertCircle, CheckCircle2, ChevronDown } from "lucide-react";
import { useState } from "react";

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: "uploaded" | "stat_edited" | "override_applied" | "status_changed";
  field: string;
  previousValue: any;
  newValue: any;
  editedBy: string;
  reason?: string;
}

interface AuditLogViewerProps {
  logs: AuditLogEntry[];
}

const AuditLogViewer = ({ logs }: AuditLogViewerProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getActionIcon = (action: string) => {
    switch (action) {
      case "uploaded":
        return Upload;
      case "stat_edited":
        return AlertCircle;
      case "override_applied":
        return AlertCircle;
      case "status_changed":
        return CheckCircle2;
      default:
        return Clock;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "uploaded":
        return "bg-accent/10 text-accent";
      case "stat_edited":
        return "bg-yellow-500/10 text-yellow-500";
      case "override_applied":
        return "bg-orange-500/10 text-orange-500";
      case "status_changed":
        return "bg-green-500/10 text-green-500";
      default:
        return "bg-muted/50 text-muted-foreground";
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return timestamp;
    }
  };

  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return timestamp;
    }
  };

  if (logs.length === 0) {
    return (
      <div className="bg-muted/20 rounded-lg p-6 text-center">
        <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
        <p className="text-xs font-montserrat text-muted-foreground">No audit log entries yet</p>
      </div>
    );
  }

  // Sort logs by timestamp descending (newest first)
  const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-3">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-6 bottom-0 w-0.5 bg-gradient-to-b from-border/50 to-transparent" />

        {/* Log entries */}
        <div className="space-y-4">
          {sortedLogs.map((log, idx) => {
            const Icon = getActionIcon(log.action);
            const isExpanded = expandedId === log.id;

            return (
              <div key={log.id} className="relative pl-12">
                {/* Timeline dot */}
                <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${getActionColor(log.action)}`}>
                  <Icon className="w-4 h-4" />
                </div>

                {/* Entry card */}
                <div className="bg-muted/20 rounded-lg p-3 border border-border/30 hover:border-border/50 transition-colors">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    className="w-full text-left flex items-start justify-between gap-2"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-montserrat font-bold text-foreground capitalize">
                          {log.action.replace(/_/g, " ")}
                        </p>
                        <span className="text-[9px] font-montserrat text-muted-foreground">{formatDate(log.timestamp)}</span>
                      </div>
                      <p className="text-[9px] font-montserrat text-muted-foreground">{formatTime(log.timestamp)} • by {log.editedBy}</p>

                      {!isExpanded && log.action === "stat_edited" && (
                        <p className="text-[9px] font-montserrat text-foreground mt-1">
                          {log.field}: <span className="text-destructive">{log.previousValue}</span> →{" "}
                          <span className="text-accent">{log.newValue}</span>
                        </p>
                      )}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
                      <div className="bg-background/50 rounded p-2">
                        <p className="text-[9px] font-montserrat font-bold text-muted-foreground mb-1 uppercase tracking-wider">
                          Details
                        </p>
                        <div className="space-y-1">
                          <p className="text-[9px] font-montserrat text-foreground">
                            <span className="text-muted-foreground">Field:</span> {log.field}
                          </p>
                          {log.action === "stat_edited" && (
                            <>
                              <p className="text-[9px] font-montserrat text-foreground">
                                <span className="text-muted-foreground">Previous:</span>{" "}
                                <span className="text-destructive font-bold">{log.previousValue}</span>
                              </p>
                              <p className="text-[9px] font-montserrat text-foreground">
                                <span className="text-muted-foreground">New:</span>{" "}
                                <span className="text-accent font-bold">{log.newValue}</span>
                              </p>
                            </>
                          )}
                          {log.reason && (
                            <p className="text-[9px] font-montserrat text-foreground italic">
                              <span className="text-muted-foreground">Reason:</span> {log.reason}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AuditLogViewer;
