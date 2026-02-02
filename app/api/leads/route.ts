import { NextRequest, NextResponse } from "next/server";

interface LeadData {
  fullName: string;
  mobile: string;
  email: string;
  companyName: string;
  service: string;
  source?: string;
  custom_lead_package?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LeadData = await request.json();

    const { fullName, mobile, email, companyName, service, source, custom_lead_package } = body;

    // Validate required fields
    if (!fullName || !mobile || !email || !companyName || !service) {
      return NextResponse.json(
        { error: "All fields are required" },
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

    // Create lead in Frappe CRM
    const response = await fetch(`${frappeUrl}/api/resource/CRM Lead`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${apiKey}:${apiSecret}`,
      },
      body: JSON.stringify({
        lead_name: fullName,
        first_name: fullName.split(" ")[0],
        last_name: fullName.split(" ").slice(1).join(" ") || "",
        mobile_no: mobile,
        email: email,
        organization: companyName,
        custom_service: service,
        source: source,
        custom_lead_package: custom_lead_package,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Frappe CRM Error:", errorData);
      return NextResponse.json(
        { error: "Failed to create lead in CRM" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(
      { message: "Lead created successfully", data },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
