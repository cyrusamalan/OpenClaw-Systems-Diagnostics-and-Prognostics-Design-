"use client";

import {
  Satellite,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  Activity,
  LayoutDashboard,
  Bot,
  ListTodo,
  Settings,
} from "lucide-react";
import { useTheme } from "./theme-provider";
import { useConnectionStore } from "@/store/connection-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Agents", icon: Bot, href: "/agents" },
  { label: "Tasks", icon: ListTodo, href: "/tasks" },
  { label: "Metrics", icon: Activity, href: "/metrics" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const connectionStatus = useConnectionStore((s) => s.status);

  const isConnected = connectionStatus === "connected";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="flex h-14 items-center px-6">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2 mr-8">
          <Satellite className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold tracking-tight font-mono">
            OpenClaw
          </span>
          <span className="text-xs text-muted-foreground font-mono ml-1">
            CTRL
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground gap-2"
              asChild
            >
              <a href={item.href}>
                <item.icon className="h-4 w-4" />
                <span className="hidden md:inline">{item.label}</span>
              </a>
            </Button>
          ))}
        </nav>

        {/* Right side controls */}
        <div className="ml-auto flex items-center gap-3">
          {/* Connection status */}
          <div
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-1 text-xs font-mono border",
              isConnected
                ? "border-status-active/30 text-status-active bg-status-active/5"
                : "border-status-error/30 text-status-error bg-status-error/5"
            )}
          >
            {isConnected ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            <span>{isConnected ? "Connected" : "Disconnected"}</span>
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                isConnected
                  ? "bg-status-active status-glow-active"
                  : "bg-status-error status-glow-error"
              )}
            />
          </div>

          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
