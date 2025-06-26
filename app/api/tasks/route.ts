import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import type { Task, CreateTaskRequest, ApiResponse, TaskRow } from "@/types/task"

// GET /api/tasks - Get all tasks
export async function GET() {
  try {
    const { data: tasks, error } = await supabaseServer
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      const errorResponse: ApiResponse = {
        success: false,
        error: "Failed to fetch tasks from database",
      }
      return NextResponse.json(errorResponse, { status: 500 })
    }

    // Transform database rows to Task objects
    const transformedTasks: Task[] = (tasks as TaskRow[]).map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      created_at: task.created_at,
      updated_at: task.updated_at,
    }))

    const response: ApiResponse<Task[]> = {
      success: true,
      data: transformedTasks,
      message: `Retrieved ${transformedTasks.length} tasks successfully`,
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

    // Insert new task into database
    const { data: newTask, error } = await supabaseServer
      .from("tasks")
      .insert([
        {
          title: body.title.trim(),
          description: body.description.trim(),
          status: body.status,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      const errorResponse: ApiResponse = {
        success: false,
        error: "Failed to create task in database",
      }
      return NextResponse.json(errorResponse, { status: 500 })
    }

    // Transform database row to Task object
    const transformedTask: Task = {
      id: newTask.id,
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
      created_at: newTask.created_at,
      updated_at: newTask.updated_at,
    }

    const response: ApiResponse<Task> = {
      success: true,
      data: transformedTask,
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
