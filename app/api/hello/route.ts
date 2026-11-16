import { NextResponse } from "next/server";

// 1. GET Request handler
export async function GET() {
  return NextResponse.json({
    status: "success",
    message: "Hello from Next.js Backend API running inside Antigravity IDE!",
    timestamp: new Date().toISOString(),
  });
}

// 2. POST Request handler
export async function POST(request: Request) {
  try {
    const body = await request.json();

    return NextResponse.json({
      status: "success",
      message: "Data received successfully!",
      yourData: body,
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Invalid JSON format" },
      { status: 400 }
    );
  }
}

