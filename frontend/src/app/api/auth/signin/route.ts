import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase-server";
import * as bcrypt from "bcrypt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: "Server configuration missing Supabase environment variables" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { email, password, exness_account_id } = body;
    const normalizedEmail = (email || "").trim().toLowerCase();
    const normalizedExnessId = (exness_account_id || "").trim();

    if (!normalizedEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const supabaseAdmin = createServiceRoleClient();

    // Check if this is an admin login (has password field)
    if (password) {
      // Admin authentication
      const { data: admin, error } = await supabaseAdmin
        .from("admins")
        .select("*")
        .eq("email", normalizedEmail)
        .single();

      if (error || !admin) {
        return NextResponse.json(
          { error: "Invalid admin credentials" },
          { status: 401 }
        );
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(
        password,
        admin.password_hash
      );

      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Invalid admin credentials" },
          { status: 401 }
        );
      }

      // Create session for admin using Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password, // This needs the plain password, handled by Supabase
        });

      if (authError) {
        // If admin doesn't exist in Supabase Auth, create them with service role
        const { data: createdUser, error: createError } =
          await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              is_admin: true,
              role: "admin",
            },
          });

        if (createError) {
          console.error("Admin create error:", createError);
          return NextResponse.json(
            { error: "Failed to create admin session" },
            { status: 500 }
          );
        }

        // Try signing in again now that user exists
        const { data: retryData, error: retryError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (retryError) {
          console.error("Admin sign-in retry error:", retryError);
          return NextResponse.json(
            { error: "Failed to create admin session" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          user: {
            email: retryData.user?.email,
            is_admin: true,
            role: "admin" as const,
          },
          session: retryData.session,
        });
      }

      return NextResponse.json({
        success: true,
        user: {
          email: authData.user?.email,
          is_admin: true,
          role: "admin" as const,
        },
        session: authData.session,
      });
    }

    // Regular user authentication (email + exness_account_id)
    if (!normalizedExnessId) {
      return NextResponse.json(
        { error: "Exness Account ID is required for user login" },
        { status: 400 }
      );
    }

    // Check if user is authorized
    const { data: authorizedUser, error: userError } = await supabaseAdmin
      .from("authorized_users")
      .select("*")
      .ilike("email", normalizedEmail)
      .ilike("exness_account_id", normalizedExnessId)
      .single();

    if (userError || !authorizedUser) {
      return NextResponse.json(
        {
          error:
            "Invalid credentials. Please check your email and Exness Account ID.",
        },
        { status: 401 }
      );
    }

    // Create custom session (store in cookie)
    const session = {
      user: {
        email: authorizedUser.email,
        exness_account_id: authorizedUser.exness_account_id,
        is_admin: false,
        role: "user" as const,
      },
      expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    const response = NextResponse.json({
      success: true,
      user: session.user,
    });

    // Set session cookie
    response.cookies.set("custom_session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Sign-in error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
