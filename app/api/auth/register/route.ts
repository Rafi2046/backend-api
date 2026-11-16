import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password } = body;

        // 1. Validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { success: false, error: "Name, email, and password are required" },
                { status: 400 }
            );
        }

        // 2. Email duplicate kina check
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { success: false, error: "User already exists with this email" },
                { status: 400 }
            );
        }

        // 3. Password Hash kora
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Database e User create kora
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "User registered successfully!",
                data: newUser,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Register error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to register user" },
            { status: 500 }
        );
    }
}