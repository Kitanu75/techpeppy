import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getNotifications, markNotificationsRead } from "@/lib/data/store";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const clientId = req.nextUrl.searchParams.get("clientId") || undefined;
    const result = await getNotifications(user?.id, clientId);
    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load notifications";
    console.error("GET /api/notifications error:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

async function handleMarkRead(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json().catch(() => ({}));
    const notificationId =
      typeof body?.notificationId === "string" ? body.notificationId : undefined;
    const clientId =
      typeof body?.clientId === "string" ? body.clientId : undefined;
    const markAll = Boolean(body?.markAll);

    if (!markAll && !notificationId) {
      return NextResponse.json(
        { success: false, error: "Provide notificationId or markAll: true" },
        { status: 400 }
      );
    }

    const result = await markNotificationsRead({
      notificationId,
      markAll,
      recipientId: user?.id,
      clientId,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update notifications";
    console.error("PATCH /api/notifications error:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  return handleMarkRead(req);
}

export async function POST(req: NextRequest) {
  return handleMarkRead(req);
}

