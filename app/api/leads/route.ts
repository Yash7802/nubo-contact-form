import { NextRequest, NextResponse } from "next/server";

interface LeadData {
  fullName: string;
  mobile: string;
  email: string;
  companyName: string;
  services: string[];
  comment?: string;
  custom_lead_type?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LeadData = await request.json();

    const { fullName, mobile, email, companyName, services, comment, custom_lead_type } = body;


    // Validate required fields
    if (!fullName || !mobile || !email || !companyName) {
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
    const leadPackages = Array.isArray(services) && services.length > 0
      ? services.map(s => ({ lead_package: s }))
      : [];

    const payload: Record<string, unknown> = {
      lead_name: fullName,
      first_name: fullName.split(" ")[0],
      last_name: fullName.split(" ").slice(1).join(" ") || "",
      mobile_no: mobile,
      email: email,
      organization: companyName,
      custom_service: Array.isArray(services) && services.length > 0 ? services[0] : "",
      custom_ask_us: comment || "",
      custom_lead_type: custom_lead_type || "",
      source: "Nubo Contact Form",
    };

    // Only add table field if there are services selected
    if (leadPackages.length > 0) {
      payload.custom_lead_purpose = leadPackages;
    }

    const response = await fetch(`${frappeUrl}/api/resource/CRM Lead`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${apiKey}:${apiSecret}`,
      },
      body: JSON.stringify(payload),
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
