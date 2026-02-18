import { NextResponse } from "next/server";
import { exec, spawn } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const IS_WINDOWS = process.platform === "win32";

function wslExec(command: string): Promise<{ stdout: string; stderr: string }> {
  if (IS_WINDOWS) {
    return execAsync(`wsl -- bash -lc "${command.replace(/"/g, '\\"')}"`);
  }
  return execAsync(command);
}

function wslWrite(path: string, content: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const shellCmd = `cat > ${path}`;
    const args = IS_WINDOWS
      ? ["--", "bash", "-lc", shellCmd]
      : ["-lc", shellCmd];
    const bin = IS_WINDOWS ? "wsl" : "bash";

    const child = spawn(bin, args, { stdio: ["pipe", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (d: Buffer) => (stderr += d.toString()));
    child.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(stderr || `exit ${code}`))
    );
    child.stdin.write(content);
    child.stdin.end();
  });
}

export async function POST() {
  try {
    const configPath = "~/.openclaw/openclaw.json";
    const { stdout } = await wslExec(`cat ${configPath}`);

    let config: Record<string, unknown>;
    try {
      config = JSON.parse(stdout.trim());
    } catch {
      return NextResponse.json(
        { error: "Failed to parse openclaw.json" },
        { status: 500 }
      );
    }

    const data = config as {
      auth?: {
        profiles?: Record<string, unknown>;
        active?: string;
      };
      agents?: {
        defaults?: {
          model?: string;
          [k: string]: unknown;
        };
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };

    if (!data.auth) data.auth = {};
    if (!data.auth.profiles) data.auth.profiles = {};

    delete data.auth.profiles["ollama:default"];

    if (!data.auth.profiles["anthropic:default"]) {
      data.auth.profiles["anthropic:default"] = {};
    }
    data.auth.active = "anthropic:default";

    if (!data.agents) data.agents = {};
    if (!data.agents.defaults) data.agents.defaults = {};
    data.agents.defaults.model = "anthropic/claude-sonnet-4-5";

    const json = JSON.stringify(data, null, 2);
    await wslWrite(configPath, json);

    // pkill may fail if no process is running — that's fine
    try {
      await wslExec("pkill -f openclaw || true");
    } catch {
      // ignore
    }

    // Brief pause then restart the gateway in the background
    wslExec("sleep 1 && nohup openclaw gateway --force > /dev/null 2>&1 &").catch(
      () => {}
    );

    return NextResponse.json({
      ok: true,
      message: "Reset to Anthropic and restarted gateway",
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
