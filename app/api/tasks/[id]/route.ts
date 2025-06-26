import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import type { Task, UpdateTaskRequest, ApiResponse } from "@/types/task"

// PUT /api/tasks/[id] - Update existing task
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body: UpdateTaskRequest = await request.json()

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      const errorResponse: ApiResponse = {
        success: false,
        error: "Invalid task ID format",
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Validate fields if provided
    if (body.title !== undefined && body.title.trim() === "") {
      const errorResponse: ApiResponse = {
        success: false,
        error: "Title cannot be empty",
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    if (body.description !== undefined && body.description.trim() === "") {
      const errorResponse: ApiResponse = {
        success: false,
        error: "Description cannot be empty",
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    if (body.status !== undefined) {
      const validStatuses = ["todo", "in-progress", "done"]
      if (!validStatuses.includes(body.status)) {
        const errorResponse: ApiResponse = {
          success: false,
          error: "Invalid status. Must be one of: todo, in-progress, done",
        }
        return NextResponse.json(errorResponse, { status: 400 })
      }
    }

    // Prepare update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (body.title !== undefined) {
      updateData.title = body.title.trim()
    }
    if (body.description !== undefined) {
      updateData.description = body.description.trim()
    }
    if (body.status !== undefined) {
      updateData.status = body.status
    }

    // Update task in database
    const { data: updatedTask, error } = await supabaseServer
      .from("tasks")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      if (error.code === "PGRST116") {
        const errorResponse: ApiResponse = {
          success: false,
          error: `Task with id ${id} not found`,
        }
        return NextResponse.json(errorResponse, { status: 404 })
      }
      const errorResponse: ApiResponse = {
        success: false,
        error: "Failed to update task in database",
      }
      return NextResponse.json(errorResponse, { status: 500 })
    }

    // Transform database row to Task object
    const transformedTask: Task = {
      id: updatedTask.id,
      title: updatedTask.title,
      description: updatedTask.description,
      status: updatedTask.status,
      created_at: updatedTask.created_at,
      updated_at: updatedTask.updated_at,
    }

    const response: ApiResponse<Task> = {
      success: true,
      data: transformedTask,
      message: "Task updated successfully",
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error("Error updating task:", error)

    const errorResponse: ApiResponse = {
      success: false,
      error: "Failed to update task. Please check your request data.",
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// DELETE /api/tasks/[id] - Delete task by id
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      const errorResponse: ApiResponse = {
        success: false,
        error: "Invalid task ID format",
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Delete task from database
    const { data: deletedTask, error } = await supabaseServer.from("tasks").delete().eq("id", id).select().single()

    if (error) {
      console.error("Supabase error:", error)
      if (error.code === "PGRST116") {
        const errorResponse: ApiResponse = {
          success: false,
          error: `Task with id ${id} not found`,
        }
        return NextResponse.json(errorResponse, { status: 404 })
      }
      const errorResponse: ApiResponse = {
        success: false,
        error: "Failed to delete task from database",
      }
      return NextResponse.json(errorResponse, { status: 500 })
    }

    // Transform database row to Task object
    const transformedTask: Task = {
      id: deletedTask.id,
      title: deletedTask.title,
      description: deletedTask.description,
      status: deletedTask.status,
      created_at: deletedTask.created_at,
      updated_at: deletedTask.updated_at,
    }

    const response: ApiResponse<Task> = {
      success: true,
      data: transformedTask,
      message: "Task deleted successfully",
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error("Error deleting task:", error)

    const errorResponse: ApiResponse = {
      success: false,
      error: "Failed to delete task",
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
