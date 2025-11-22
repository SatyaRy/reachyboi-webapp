import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import crypto from "crypto";

function formatReqTime(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const y = date.getUTCFullYear();
  const m = pad(date.getUTCMonth() + 1);
  const d = pad(date.getUTCDate());
  const h = pad(date.getUTCHours());
  const i = pad(date.getUTCMinutes());
  const s = pad(date.getUTCSeconds());
  return `${y}${m}${d}${h}${i}${s}`;
}

function buildHash(values: string[], secret: string) {
  const concatenated = values.join("");
  const hmac = crypto.createHmac("sha512", secret);
  hmac.update(concatenated);
  return hmac.digest("base64");
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_email", user.email)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ subscriptions: data || [] });
  } catch (error: any) {
    console.error("[subscriptions] GET error", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const plan_name = body.plan_name || "Standard";
    const price = Number(body.price || 12);

    const baseUrl = (process.env.PAYWAY_BASE_URL || "").replace(/\/$/, "");
    const apiUrl = `${baseUrl || "https://checkout-sandbox.payway.com.kh"}/api/payment-gateway/v1/payments/purchase`;
    const merchantId = process.env.PAYWAY_MERCHANT_ID;
    const publicKey = process.env.PAYWAY_PUBLIC_KEY;
    const privateKey = process.env.PAYWAY_RSA_PRIVATE_KEY;

    if (!apiUrl || !merchantId || !publicKey || !privateKey) {
      return NextResponse.json(
        { error: "Payment configuration missing. Contact support @frost_4x." },
        { status: 500 }
      );
    }

    const orderId = crypto.randomUUID();
    const returnUrl = `${request.nextUrl.origin}/subscribe?status=success&order=${orderId}`;
    const cancelUrl = `${request.nextUrl.origin}/subscribe?status=cancelled&order=${orderId}`;
    const continueSuccessUrl = returnUrl;
    const reqTime = formatReqTime(new Date());
    const paymentOption = body.payment_option || "abapay";

    // Build multipart form payload
    const form = new FormData();
    form.append("req_time", reqTime);
    form.append("merchant_id", merchantId);
    form.append("tran_id", orderId);
    form.append("amount", price.toFixed(2));
    form.append("payment_option", paymentOption);
    form.append("return_url", returnUrl);
    form.append("cancel_url", cancelUrl);
    form.append("continue_success_url", continueSuccessUrl);
    form.append("currency", "USD");

    // Hash uses the concatenation of all included fields in order
    const hashValues: string[] = [
      reqTime,
      merchantId,
      orderId,
      price.toFixed(2),
      returnUrl,
      cancelUrl,
      continueSuccessUrl,
      "USD",
    ];

    const hash = buildHash(hashValues, publicKey);
    form.append("hash", hash);

    let checkoutUrl: string | null = null;
    let paywayTransactionId: string | null = null;

    try {
      console.info("[subscriptions] PayWay request", {
        apiUrl,
        merchantId,
        orderId,
        amount: price.toFixed(2),
        paymentOption,
        returnUrl,
        cancelUrl,
      });

      const response = await fetch(apiUrl, {
        method: "POST",
        body: form,
        redirect: "manual",
      });

      const contentType = response.headers.get("content-type") || "";
      let bodyText = "";
      let result: any = {};

      try {
        if (contentType.includes("application/json")) {
          result = await response.json();
        } else {
          bodyText = await response.text();
        }
      } catch (parseError) {
        console.error("[subscriptions] PayWay parse error", parseError);
      }

      const locationHeader = response.headers.get("location");

      if (!response.ok && !(response.status === 302 && locationHeader)) {
        console.error("[subscriptions] PayWay HTTP error", {
          status: response.status,
          statusText: response.statusText,
          body: bodyText || result,
          location: locationHeader,
        });
        throw new Error(
          `PayWay error: ${response.status} ${
            response.statusText
          } ${bodyText || JSON.stringify(result)}`
        );
      }

      checkoutUrl =
        locationHeader ||
        result?.payment_url ||
        result?.redirect_url ||
        result?.deeplink ||
        result?.qr_url ||
        result?.url ||
        null;
      paywayTransactionId =
        result?.tran_id || result?.transaction_id || result?.order_id || orderId;

      if (result?.error_code === "6") {
        throw new Error(
          "PayWay error 6 (wrong domain). Ensure your domain is whitelisted in PayWay."
        );
      }

      console.info("[subscriptions] PayWay response", {
        checkoutUrl,
        paywayTransactionId,
        result,
        location: response.headers.get("location"),
      });
    } catch (paywayError: any) {
      console.error("[subscriptions] PayWay error", paywayError);
      // Continue but mark status failed for visibility
    }

    const status = checkoutUrl ? "pending" : "failed";

    const { data, error } = await supabase
      .from("subscriptions")
      .insert({
        user_email: user.email,
        plan_name,
        price,
        payway_transaction_id: paywayTransactionId || orderId,
        payway_checkout_url: checkoutUrl,
        status,
      })
      .select("*")
      .single();

    if (error) {
      console.error("[subscriptions] insert error", error);
      return NextResponse.json(
        { error: "Failed to start subscription" },
        { status: 500 }
      );
    }

    if (!checkoutUrl) {
      return NextResponse.json(
        {
          subscription: data,
          error:
            "Unable to create PayWay checkout. Please contact support @frost_4x.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      subscription: data,
      checkout_url: checkoutUrl,
    });
  } catch (error: any) {
    console.error("[subscriptions] POST error", error);
    return NextResponse.json(
      { error: "Failed to start subscription" },
      { status: 500 }
    );
  }
}
