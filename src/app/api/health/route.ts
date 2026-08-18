import { NextResponse } from "next/server";
import { mizaneEnv, paymentsEnabled } from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    ok: true,
    env: mizaneEnv(),
    paymentsEnabled: paymentsEnabled(),
  });
}
