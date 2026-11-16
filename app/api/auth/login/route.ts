import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // 1. Validation
        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: "Email and password are required" },
                { status: 400 }
            );
        }

        // 2. User khuje ber kora
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Invalid email or password" },
                { status: 401 } // 401 Unauthorized
            );
        }

        // 3. Password match kore kina check kora
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, error: "Invalid email or password" },
                { status: 401 }
            );
        }

        // 4. JWT Token generate kora (Ei token tai Frontend e pathabo)
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: "7d" } // 7 din por token expire hobe
        );

        return NextResponse.json(
            {
                success: true,
                message: "Login successful!",
                token, // <-- JWT Token!
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to login" },
            { status: 500 }
        );
    }
}