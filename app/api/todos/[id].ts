import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UpdateTodoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  priority: z.enum(["low", "medium", "high"]),
  duedate: z.date().optional(),
});

const GetDeleteSchema = z.object({
  id: z.string(),
});

// Update a todo
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = UpdateTodoSchema.parse(await req.json());
    const todo = await db.task.findUnique({
      where: { id: data.id },
      select: { createdById: true },
    });

    if (!todo || todo.createdById !== session?.user?.email) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await db.task.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.duedate,
      },
    });

    return NextResponse.json({ message: "Todo updated successfully!" });
  } catch (e) {
    return NextResponse.json(
      { message: "An error occurred" },
      { status: 500 }
    );
  }
}

// Get a specific todo
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ message: "Todo ID is required" }, { status: 400 });
    }

    const todo = await db.task.findUnique({
      where: { id },
      include: {
        createdBy: { select: { name: true, email: true } },
        comments: { include: { user: { select: { name: true } } } },
      },
    });

    if (!todo) {
      return NextResponse.json({ message: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json(todo);
  } catch (e) {
    return NextResponse.json(
      { message: "An error occurred" },
      { status: 500 }
    );
  }
}

// Delete a todo
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = GetDeleteSchema.parse(await req.json());
    const todo = await db.task.findUnique({
      where: { id: data.id },
      select: { createdById: true },
    });

    if (!todo || todo.createdById !== session.user.email) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await db.task.delete({
      where: { id: data.id },
    });

    return NextResponse.json({ message: "Todo deleted successfully!" });
  } catch (e) {
    return NextResponse.json(
      { message: "An error occurred" },
      { status: 500 }
    );
  }
}
