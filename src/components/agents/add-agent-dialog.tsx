"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface AddAgentDialogProps {
  onCreated?: () => void;
}

export function AddAgentDialog({ onCreated }: AddAgentDialogProps) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [model, setModel] = useState("");

  function reset() {
    setName("");
    setWorkspace("");
    setModel("");
  }

  async function handleCreate() {
    if (!name.trim()) {
      toast.error("Agent name is required");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/proxy/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          workspace: workspace.trim() || undefined,
          model: model.trim() || undefined,
        }),
      });

      const body = await res.json();
      if (!res.ok) {
        toast.error(body.detail || body.error || "Failed to create agent");
      } else {
        toast.success(`Agent "${name.trim()}" created`);
        reset();
        setOpen(false);
        onCreated?.();
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Network error — is the proxy running?"
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <AlertDialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Agent
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create New Agent</AlertDialogTitle>
          <AlertDialogDescription>
            Spin up an isolated agent with its own workspace, personality, and
            channel bindings.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label htmlFor="agent-name" className="text-sm font-medium">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="agent-name"
              placeholder="e.g. coding, research, social"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="agent-workspace" className="text-sm font-medium">
              Workspace Path{" "}
              <span className="text-xs text-muted-foreground">(optional)</span>
            </label>
            <Input
              id="agent-workspace"
              placeholder="~/.openclaw/workspace-coding"
              value={workspace}
              onChange={(e) => setWorkspace(e.target.value)}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Defaults to <code>~/.openclaw/workspace-{"<name>"}</code> if left
              blank.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="agent-model" className="text-sm font-medium">
              Model{" "}
              <span className="text-xs text-muted-foreground">(optional)</span>
            </label>
            <Input
              id="agent-model"
              placeholder="e.g. anthropic/claude-sonnet-4-5"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Inherits the gateway default if left blank.
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" size="sm" disabled={creating}>
              Cancel
            </Button>
          </AlertDialogCancel>
          <Button size="sm" onClick={handleCreate} disabled={creating || !name.trim()}>
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Agent
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
