import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * 1. GET Single Task
 * URL: http://localhost:3000/api/tasks/:id
 */
export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { success: false, error: "Invalid task ID" },
        { status: 400 }
      );
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 } // Not Found
      );
    }

    return NextResponse.json({ success: true, data: task }, { status: 200 });
  } catch (error) {
    console.error("Error fetching single task:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

/**
 * 2. PATCH Method - Task update kora (e.g. completed: true or title change)
 * URL: http://localhost:3000/api/tasks/:id
 */
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { success: false, error: "Invalid task ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Task exists kina check kora
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    // Smart Boolean Parser (handle both boolean false and string "false")
    let parsedCompleted: boolean | undefined = undefined;
    if (body.completed !== undefined) {
      if (typeof body.completed === "string") {
        parsedCompleted = body.completed.toLowerCase() === "true";
      } else {
        parsedCompleted = Boolean(body.completed);
      }
    }

    // Database update
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: body.title !== undefined ? body.title.trim() : undefined,
        description: body.description !== undefined ? body.description : undefined,
        completed: parsedCompleted,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Task updated successfully",
        data: updatedTask,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update task" },
      { status: 500 }
    );
  }
}

/**
 * 3. DELETE Method - Database theke task remove kora
 * URL: http://localhost:3000/api/tasks/:id
 */
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { success: false, error: "Invalid task ID" },
        { status: 400 }
      );
    }

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Task #${taskId} deleted successfully`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
