import { NextRequest, NextResponse } from "next/server";

const PARL_BACKEND_URL = process.env.PARL_BACKEND_URL || "http://localhost:4141";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(`${PARL_BACKEND_URL}/query/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error in proxy";
    console.error("Error in /api/parl/query proxy:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
