import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * 1. GET Method - Database theke shob tasks fetch kora
 * URL: http://localhost:3000/api/tasks
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const completedParam = searchParams.get("completed");

    // Query filter dynamically build kora
    const whereClause: { completed?: boolean } = {};
    if (completedParam !== null) {
      whereClause.completed = completedParam === "true";
    }

    // Prisma diye database query (SELECT * FROM tasks WHERE ...)
    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc", // Latest task shobcheye agey dekhabe
      },
    });

    return NextResponse.json(
      {
        success: true,
        count: tasks.length,
        data: tasks,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tasks from database" },
      { status: 500 }
    );
  }
}

/**
 * 2. POST Method - Database e notun task save kora
 * URL: http://localhost:3000/api/tasks
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validation
    if (!body.title || typeof body.title !== "string" || body.title.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error: "Title is required and cannot be empty",
        },
        { status: 400 }
      );
    }

    // Prisma diye database e INSERT kora
    const newTask = await prisma.task.create({
      data: {
        title: body.title.trim(),
        description: body.description || null,
        completed: body.completed ?? false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Task created successfully in SQLite database",
        data: newTask,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create task" },
      { status: 500 }
    );
  }
}
