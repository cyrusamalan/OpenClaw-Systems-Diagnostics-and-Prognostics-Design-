import { NextRequest, NextResponse } from "next/server";

const PROXY_URL =
  process.env.PROXY_INTERNAL_URL ??
  `http://${process.env.NEXT_PUBLIC_OPENCLAW_HOST ?? "localhost"}:${process.env.NEXT_PUBLIC_OPENCLAW_PORT ?? "8080"}`;

async function proxyRequest(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join("/");
  const url = new URL(`/api/${path}`, PROXY_URL);

  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const apiKey =
    process.env.OPENCLAW_API_KEY ??
    process.env.NEXT_PUBLIC_OPENCLAW_API_KEY;
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const isSSE = path === "logs/stream";

  try {
    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      const body = await request.text();
      if (body) fetchOptions.body = body;
    }

    const upstream = await fetch(url.toString(), fetchOptions);

    if (isSSE) {
      return new Response(upstream.body, {
        status: upstream.status,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Proxy connection failed";
    return NextResponse.json(
      { error: message, proxyTarget: url.toString() },
      { status: 502 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PATCH = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
