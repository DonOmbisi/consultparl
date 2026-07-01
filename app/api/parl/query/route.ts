import { NextRequest, NextResponse } from "next/server";

const PARL_BACKEND_URL = process.env.PARL_BACKEND_URL || "http://localhost:4141";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    try {
      const response = await fetch(`${PARL_BACKEND_URL}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (e) {
      console.warn("Backend query endpoint not available yet:", e);
    }

    // Return the placeholder message as requested by the Stage Five spec
    return NextResponse.json({
      answer: "The PARL Intelligence query engine is currently offline or not yet fully implemented. It will be available when Stage Ten is complete.",
      evidence: "System placeholder response."
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error in query proxy" },
      { status: 500 }
    );
  }
}
