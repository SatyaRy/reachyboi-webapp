import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase-server";
import * as XLSX from "xlsx";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const supabaseAdmin = createServiceRoleClient();

    // Check if user is admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    // Verify admin status
    const { data: admin, error: adminError } = await supabaseAdmin
      .from("admins")
      .select("*")
      .eq("email", user.email)
      .single();

    if (adminError || !admin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Get the uploaded file
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Check file type
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Please upload an Excel file (.xlsx or .xls)",
        },
        { status: 400 }
      );
    }

    // Read the file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse Excel file
    const workbook = XLSX.read(buffer, { type: "buffer" });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const data: any[] = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return NextResponse.json(
        { error: "Excel file is empty" },
        { status: 400 }
      );
    }

    // Validate required columns
    const firstRow = data[0];
    if (!firstRow.email && !firstRow.Email) {
      return NextResponse.json(
        { error: 'Excel file must have an "email" column' },
        { status: 400 }
      );
    }

    if (
      !firstRow.exness_account_id &&
      !firstRow.Exness_Account_ID &&
      !firstRow["Exness Account ID"]
    ) {
      return NextResponse.json(
        {
          error:
            'Excel file must have an "exness_account_id" or "Exness Account ID" column',
        },
        { status: 400 }
      );
    }

    // Process and validate each row
    const usersToInsert = data.map((row, index) => {
      const email = row.email || row.Email;
      const exness_account_id =
        row.exness_account_id ||
        row.Exness_Account_ID ||
        row["Exness Account ID"];

      if (!email || !exness_account_id) {
        throw new Error(`Row ${index + 2}: Missing email or Exness Account ID`);
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error(`Row ${index + 2}: Invalid email format - ${email}`);
      }

      return {
        email: email.toLowerCase().trim(),
        exness_account_id: String(exness_account_id).trim(),
      };
    });

    // Insert/update users (upsert)
    const { data: insertedUsers, error: insertError } = await supabaseAdmin
      .from("authorized_users")
      .upsert(usersToInsert, {
        onConflict: "email,exness_account_id",
        ignoreDuplicates: false,
      })
      .select();

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: `Failed to insert users: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${usersToInsert.length} users`,
      inserted: insertedUsers?.length || 0,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process Excel file" },
      { status: 500 }
    );
  }
}
