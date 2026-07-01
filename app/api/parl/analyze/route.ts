import { NextRequest, NextResponse } from "next/server";

const PARL_BACKEND_URL = process.env.PARL_BACKEND_URL || "http://localhost:4141";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Map request fields if necessary. The backend expects { organization_name, sector, context }
    // If the frontend sends context as a string, we can wrap it as a dictionary or accept it.
    // Let's make sure we pass it correctly:
    const backendPayload = {
      organization_name: body.organization_name,
      sector: body.sector,
      context: typeof body.context === "string" ? { text: body.context } : body.context,
    };

    const response = await fetch(`${PARL_BACKEND_URL}/spot/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Backend error: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in /api/parl/analyze proxy:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error in proxy" },
      { status: 500 }
    );
  }
}
