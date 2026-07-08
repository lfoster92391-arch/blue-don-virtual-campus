import { NextResponse } from "next/server";

export function applyCorsHeaders(
  response: NextResponse,
  request: Request,
  allowedOrigins: string[],
): NextResponse {
  const origin = request.headers.get("origin");

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");
    response.headers.set("Vary", "Origin");
  }

  return response;
}

export function corsPreflightResponse(
  request: Request,
  allowedOrigins: string[],
): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return applyCorsHeaders(response, request, allowedOrigins);
}
