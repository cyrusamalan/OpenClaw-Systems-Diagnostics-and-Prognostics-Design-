"use client";

import { useState } from "react";
import {
  Server,
  Plug,
  PlugZap,
  RotateCcw,
  Check,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useConnectionStore } from "@/store/connection-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";

const statusVariant: Record<string, "active" | "idle" | "error" | "busy"> = {
  connected: "active",
  disconnected: "error",
  connecting: "busy",
  error: "error",
};

export default function SettingsPage() {
  const { config, status, setConfig, connect, disconnect } =
    useConnectionStore();

  const [host, setHost] = useState(config.host);
  const [port, setPort] = useState(String(config.port));
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [saved, setSaved] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const isDirty =
    host !== config.host ||
    port !== String(config.port) ||
    apiKey !== config.apiKey;

  function handleSave() {
    setConfig({
      host: host.trim(),
      port: Number(port),
      apiKey: apiKey.trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    setHost(config.host);
    setPort(String(config.port));
    setApiKey(config.apiKey);
  }

  function handleTestConnection() {
    handleSave();
    connect();
  }

  async function handleResetToAnthropic() {
    setResetting(true);
    setDialogOpen(false);
    try {
      const res = await fetch("/api/openclaw/reset-provider", {
        method: "POST",
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error || "Failed to reset provider");
      } else {
        toast.success("Reset to Anthropic and restarted gateway");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Network error — is the server running?"
      );
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-mono">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure the connection to your OpenClaw instance.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Connection form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Server className="h-5 w-5 text-primary" />
              OpenClaw Connection
            </CardTitle>
            <CardDescription>
              Enter the host, port, and API key for the OpenClaw instance you
              want to control.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="host"
                className="text-sm font-medium leading-none"
              >
                Host
              </label>
              <Input
                id="host"
                placeholder="e.g. localhost or 192.168.1.100"
                value={host}
                onChange={(e) => setHost(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Hostname or IP address of the machine running OpenClaw.
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="port"
                className="text-sm font-medium leading-none"
              >
                Port
              </label>
              <Input
                id="port"
                type="number"
                placeholder="8080"
                value={port}
                onChange={(e) => setPort(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The port OpenClaw&apos;s API is exposed on.
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="apiKey"
                className="text-sm font-medium leading-none"
              >
                API Key
              </label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Authentication key for the OpenClaw API. Leave blank if none is
                required.
              </p>
            </div>
          </CardContent>

          <Separator />

          <CardFooter className="flex justify-between pt-6">
            <Button
              variant="ghost"
              size="sm"
              disabled={!isDirty}
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!isDirty && !saved}
                onClick={handleSave}
              >
                {saved ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Saved
                  </>
                ) : (
                  "Save"
                )}
              </Button>
              <Button size="sm" onClick={handleTestConnection}>
                <PlugZap className="h-4 w-4 mr-2" />
                Save &amp; Connect
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Status sidebar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plug className="h-5 w-5 text-primary" />
              Status
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Connection</span>
              <Badge variant={statusVariant[status]}>{status}</Badge>
            </div>

            <Separator />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Host</span>
                <span className="font-mono">{config.host}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Port</span>
                <span className="font-mono">{config.port}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">API Key</span>
                <span className="font-mono">
                  {config.apiKey ? "••••••••" : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Protocol</span>
                <span className="font-mono uppercase">
                  {config.connectionType}
                </span>
              </div>
            </div>

            <Separator />

            <Button
              variant={status === "disconnected" ? "default" : "destructive"}
              size="sm"
              className="w-full"
              onClick={status === "disconnected" ? connect : disconnect}
            >
              {status === "disconnected" ? (
                <>
                  <PlugZap className={cn("h-4 w-4 mr-2")} />
                  Connect
                </>
              ) : (
                <>
                  <Plug className="h-4 w-4 mr-2" />
                  Disconnect
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Danger zone */}
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Destructive actions that modify your OpenClaw configuration and
            restart the gateway.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-destructive/30 p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Reset Provider to Anthropic</p>
              <p className="text-xs text-muted-foreground">
                Removes the Ollama provider, sets Anthropic as active, changes
                the default model to{" "}
                <code className="text-xs">claude-sonnet-4-5</code>, and
                restarts the gateway.
              </p>
            </div>

            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={resetting}
                  className="ml-4 shrink-0"
                >
                  {resetting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Resetting…
                    </>
                  ) : (
                    "Reset Provider to Anthropic"
                  )}
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will overwrite your{" "}
                    <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">
                      ~/.openclaw/openclaw.json
                    </code>{" "}
                    configuration:
                    <ul className="mt-3 list-disc pl-5 space-y-1 text-left">
                      <li>
                        Delete the <strong>ollama:default</strong> provider
                        profile
                      </li>
                      <li>
                        Set <strong>anthropic:default</strong> as the active
                        provider
                      </li>
                      <li>
                        Change the default model to{" "}
                        <strong>anthropic/claude-sonnet-4-5</strong>
                      </li>
                      <li>
                        Kill all OpenClaw processes and restart the gateway
                      </li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel asChild>
                    <Button variant="outline" size="sm">
                      Cancel
                    </Button>
                  </AlertDialogCancel>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleResetToAnthropic}
                  >
                    Yes, reset to Anthropic
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
