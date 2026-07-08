import { NextResponse } from "next/server";

import { getAllowedApiOrigins } from "@/config/integration";
import { getHealthStatus } from "@/lib/health";
import { applyCorsHeaders, corsPreflightResponse } from "@/lib/cors";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return corsPreflightResponse(request, getAllowedApiOrigins());
}

export async function GET(request: Request) {
  const response = NextResponse.json(await getHealthStatus());
  return applyCorsHeaders(response, request, getAllowedApiOrigins());
}
