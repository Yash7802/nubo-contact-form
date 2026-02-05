import { NextRequest, NextResponse } from "next/server";

interface CheckDuplicateRequest {
  email: string;
  mobile: string;
}

interface DuplicateLead {
  name: string;
  lead_name: string;
  email: string;
  mobile_no: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckDuplicateRequest = await request.json();
    const { email, mobile } = body;

    if (!email && !mobile) {
      return NextResponse.json(
        { error: "Email or mobile is required" },
        { status: 400 }
      );
    }

    const frappeUrl = process.env.FRAPPE_URL;
    const apiKey = process.env.FRAPPE_API_KEY;
    const apiSecret = process.env.FRAPPE_API_SECRET;

    if (!frappeUrl || !apiKey || !apiSecret) {
      console.error("Missing Frappe CRM configuration");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const duplicates: DuplicateLead[] = [];

    // Check for duplicate by email
    if (email) {
      const emailFilter = JSON.stringify([["email", "=", email]]);
      const emailResponse = await fetch(
        `${frappeUrl}/api/resource/CRM Lead?filters=${encodeURIComponent(emailFilter)}&fields=["name","lead_name","email","mobile_no"]`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${apiKey}:${apiSecret}`,
          },
        }
      );

      if (emailResponse.ok) {
        const emailData = await emailResponse.json();
        if (emailData.data && emailData.data.length > 0) {
          duplicates.push(...emailData.data);
        }
      }
    }

    // Check for duplicate by mobile
    if (mobile) {
      const mobileFilter = JSON.stringify([["mobile_no", "=", mobile]]);
      const mobileResponse = await fetch(
        `${frappeUrl}/api/resource/CRM Lead?filters=${encodeURIComponent(mobileFilter)}&fields=["name","lead_name","email","mobile_no"]`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${apiKey}:${apiSecret}`,
          },
        }
      );

      if (mobileResponse.ok) {
        const mobileData = await mobileResponse.json();
        if (mobileData.data && mobileData.data.length > 0) {
          // Avoid adding duplicates if same lead found by both email and mobile
          for (const lead of mobileData.data) {
            if (!duplicates.find((d) => d.name === lead.name)) {
              duplicates.push(lead);
            }
          }
        }
      }
    }

    if (duplicates.length > 0) {
      // Determine which field matched
      const matchedFields: string[] = [];
      for (const dup of duplicates) {
        if (dup.email === email) matchedFields.push("email");
        if (dup.mobile_no === mobile) matchedFields.push("mobile");
      }
      const uniqueMatchedFields = [...new Set(matchedFields)];

      return NextResponse.json({
        isDuplicate: true,
        duplicates: duplicates.map((d) => ({
          name: d.lead_name,
          email: d.email,
          mobile: d.mobile_no,
        })),
        matchedFields: uniqueMatchedFields,
        message: `Lead already exists with matching ${uniqueMatchedFields.join(" and ")}`,
      });
    }

    return NextResponse.json({
      isDuplicate: false,
      duplicates: [],
      matchedFields: [],
      message: "No duplicate found",
    });
  } catch (error) {
    console.error("Error checking duplicate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
