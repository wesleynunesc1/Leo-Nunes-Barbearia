import { NextResponse } from "next/server";
import { getVapidPublicKey } from "@/lib/pushNotifications";

export async function GET() {
  return NextResponse.json({
    publicKey: getVapidPublicKey(),
  });
}
