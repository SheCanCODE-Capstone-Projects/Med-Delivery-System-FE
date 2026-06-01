import { NextRequest, NextResponse } from 'next/server';

const BACKEND = 'https://meddelivery.up.railway.app';

// Headers that must not be forwarded to the backend
const DROP_REQ_HEADERS = new Set([
  'host', 'connection', 'transfer-encoding', 'keep-alive',
  'upgrade-insecure-requests', 'proxy-authorization',
  'content-length', // Recalculated from the buffered body
  'cookie',         // App uses Bearer tokens, not cookies — avoid session interference
  'origin',         // Browser CORS header — meaningless in server-to-server; triggers Spring Security CORS check
  'referer',        // Browser navigation header — not needed by the backend API
]);

// Headers that must not be forwarded back to the browser
const DROP_RES_HEADERS = new Set([
  'connection', 'transfer-encoding', 'keep-alive',
]);

async function proxy(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const backendUrl = `${BACKEND}/api/${path.join('/')}${req.nextUrl.search}`;

  // Build forwarded headers (strip hop-by-hop headers)
  const forwardHeaders = new Headers();
  req.headers.forEach((value, key) => {
    if (!DROP_REQ_HEADERS.has(key.toLowerCase())) {
      forwardHeaders.set(key, value);
    }
  });

  const hasBody = !['GET', 'HEAD'].includes(req.method);
  // Buffer the body so we get the correct content-length and avoid stream-consumed issues
  const body = hasBody ? await req.arrayBuffer() : undefined;

  let backendRes: Response;
  try {
    backendRes = await fetch(backendUrl, {
      method: req.method,
      headers: forwardHeaders,
      body,
      redirect: 'manual',
    });
  } catch {
    return NextResponse.json(
      { message: 'Server is unavailable. It may be starting up — please try again in a moment.' },
      { status: 503 }
    );
  }

  // Spring Security returns 302 → Google OAuth for unauthenticated/unauthorised requests.
  // Convert this to a standard 401 so the browser apiClient can handle it properly.
  if (backendRes.status === 301 || backendRes.status === 302 || backendRes.status === 303) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const resHeaders = new Headers();
  backendRes.headers.forEach((value, key) => {
    if (!DROP_RES_HEADERS.has(key.toLowerCase())) {
      resHeaders.set(key, value);
    }
  });

  return new NextResponse(backendRes.body, {
    status: backendRes.status,
    statusText: backendRes.statusText,
    headers: resHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
