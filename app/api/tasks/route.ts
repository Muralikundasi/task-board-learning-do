import { type NextRequest, NextResponse } from "next/server"
import type { Task, CreateTaskRequest, ApiResponse } from "@/types/task"

// In-memory storage for tasks
const tasks: Task[] = [
  {
    id: "1",
    title: "Design Homepage",
    description: "Create wireframes and mockups for the new homepage layout",
    status: "todo",
    createdAt: new Date("2024-01-15T10:00:00Z"),
  },
  {
    id: "2",
    title: "Setup Database",
    description: "Configure PostgreSQL database and create initial schema",
    status: "in-progress",
    createdAt: new Date("2024-01-14T14:30:00Z"),
  },
  {
    id: "3",
    title: "User Authentication",
    description: "Implement login and registration functionality",
    status: "done",
    createdAt: new Date("2024-01-13T09:15:00Z"),
  },
]

// GET /api/tasks - Get all tasks
export async function GET() {
  try {
    const response: ApiResponse<Task[]> = {
      success: true,
      data: tasks,
      message: `Retrieved ${tasks.length} tasks successfully`,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error("Error fetching tasks:", error)

    const errorResponse: ApiResponse = {
      success: false,
      error: "Failed to fetch tasks",
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// POST /api/tasks - Create new task
export async function POST(request: NextRequest) {
  try {
    const body: CreateTaskRequest = await request.json()

    // Validate required fields
    if (!body.title || !body.description || !body.status) {
      const errorResponse: ApiResponse = {
        success: false,
        error: "Missing required fields: title, description, and status are required",
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Validate title and description are not empty strings
    if (body.title.trim() === "" || body.description.trim() === "") {
      const errorResponse: ApiResponse = {
        success: false,
        error: "Title and description cannot be empty",
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Validate status
    const validStatuses = ["todo", "in-progress", "done"]
    if (!validStatuses.includes(body.status)) {
      const errorResponse: ApiResponse = {
        success: false,
        error: "Invalid status. Must be one of: todo, in-progress, done",
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Create new task
    const newTask: Task = {
      id: Date.now().toString(),
      title: body.title.trim(),
      description: body.description.trim(),
      status: body.status,
      createdAt: new Date(),
    }

    // Add to tasks array
    tasks.push(newTask)

    const response: ApiResponse<Task> = {
      success: true,
      data: newTask,
      message: "Task created successfully",
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)

    const errorResponse: ApiResponse = {
      success: false,
      error: "Failed to create task. Please check your request data.",
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
