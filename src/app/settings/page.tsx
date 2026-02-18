"use client";

import { useState } from "react";
import { Server, Plug, PlugZap, RotateCcw, Check } from "lucide-react";
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
    </div>
  );
}
