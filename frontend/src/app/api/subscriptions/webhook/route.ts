import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";

const SUPPORT = "@frost_4x";

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createServiceRoleClient();
    const payload = await request.json().catch(() => ({}));

    const tranId =
      payload?.tran_id ||
      payload?.transaction_id ||
      payload?.order_id ||
      payload?.tranId;

    if (!tranId) {
      return NextResponse.json({ error: "Missing transaction id" }, { status: 400 });
    }

    // Attempt to confirm via Check Transaction API if configured
    const checkUrl =
      process.env.PAYWAY_CHECK_URL ||
      `${(process.env.PAYWAY_BASE_URL || "https://checkout-sandbox.payway.com.kh").replace(/\/$/, "")}/api/payment-gateway/v1/payments/check-transaction`;
    let paid = false;

    try {
      const checkResp = await fetch(checkUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant_id: process.env.PAYWAY_MERCHANT_ID,
          tran_id: tranId,
        }),
      });

      if (checkResp.ok) {
        const result = await checkResp.json();
        const status =
          result?.data?.status ||
          result?.status ||
          result?.payment_status ||
          result?.transaction_status;
        paid = ["0", 0, "APPROVED", "SUCCESS", "success"].includes(status);
      }
    } catch (err) {
      console.error("[payway webhook] check transaction failed", err);
    }

    const status = paid ? "active" : "pending";
    const nextBillingAt = paid
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { error } = await supabaseAdmin
      .from("subscriptions")
      .update({
        status: paid ? "active" : "pending",
        next_billing_at: nextBillingAt,
        updated_at: new Date().toISOString(),
      })
      .eq("payway_transaction_id", tranId);

    if (error) {
      console.error("[payway webhook] update error", error);
      return NextResponse.json(
        {
          error: "Failed to update subscription",
          support: `Contact ${SUPPORT}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, status });
  } catch (error: any) {
    console.error("[payway webhook] unexpected error", error);
    return NextResponse.json(
      { error: "Webhook processing failed", support: `Contact ${SUPPORT}` },
      { status: 500 }
    );
  }
}
