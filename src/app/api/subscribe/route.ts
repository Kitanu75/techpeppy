import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createOrToggleSubscription, getSubscriptions } from "@/lib/data/store";
import { getClientIp, checkRateLimit } from "@/lib/rateLimit";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const searchParams = req.nextUrl.searchParams;
    const clientId = searchParams.get("clientId") || searchParams.get("subscriberId") || "";
    const effectiveSubscriberId = user?.id || clientId;

    const result = await getSubscriptions(effectiveSubscriberId);
    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load subscriptions";
    console.error("GET /api/subscribe error:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const rateCheck = checkRateLimit(`subscribe_ip_${ip}`, 60, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many subscription requests. Please try again shortly." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      subscriberEmail,
      subscriberName,
      targetUserId,
      channelSlug,
      clientId,
      action,
    } = body || {};

    const user = await getCurrentUser();

    let resolvedId = "";
    let resolvedName = "";
    let resolvedEmail: string | undefined = undefined;
    let resolvedAvatar = "";

    const rawProvidedEmail =
      typeof subscriberEmail === "string" ? subscriberEmail.toLowerCase().trim() : "";

    if (rawProvidedEmail) {
      if (!EMAIL_REGEX.test(rawProvidedEmail)) {
        return NextResponse.json(
          { success: false, error: "Please enter a valid email address." },
          { status: 400 }
        );
      }
      resolvedEmail = rawProvidedEmail;
    }

    if (user) {
      resolvedId = user.id;
      resolvedName = user.name;
      resolvedEmail = resolvedEmail || user.email;
      resolvedAvatar = user.avatar;
    } else if (resolvedEmail) {
      resolvedId = `email_${resolvedEmail}`;
      const cleanName =
        typeof subscriberName === "string" && subscriberName.trim().length > 0
          ? subscriberName.trim().slice(0, 60).replace(/[<>]/g, "")
          : resolvedEmail.split("@")[0];
      resolvedName = cleanName;
      resolvedAvatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(resolvedEmail)}`;
    } else {
      const cleanClientId =
        typeof clientId === "string" ? clientId.trim().slice(0, 80) : "";
      resolvedId = cleanClientId || `guest_${ip}`;
      const cleanName =
        typeof subscriberName === "string" && subscriberName.trim().length > 0
          ? subscriberName.trim().slice(0, 60).replace(/[<>]/g, "")
          : "Engineering Reader";
      resolvedName = cleanName;
      resolvedAvatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(resolvedId)}`;
    }

    const cleanChannel =
      typeof channelSlug === "string" && channelSlug.trim().length > 0
        ? channelSlug.trim().slice(0, 64)
        : "publication";

    const cleanTargetUser =
      typeof targetUserId === "string" && targetUserId.trim().length > 0
        ? targetUserId.trim().slice(0, 80)
        : "usr_sandeep_author";

    const validAction: "subscribe" | "unsubscribe" | "toggle" =
      action === "subscribe" || action === "unsubscribe" ? action : "toggle";

    const result = await createOrToggleSubscription({
      subscriberId: resolvedId,
      subscriberEmail: resolvedEmail,
      subscriberName: resolvedName,
      subscriberAvatar: resolvedAvatar,
      targetUserId: cleanTargetUser,
      channelSlug: cleanChannel,
      action: validAction,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process subscription";
    console.error("POST /api/subscribe error:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

