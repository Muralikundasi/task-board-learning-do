import { type NextRequest, NextResponse } from "next/server"
import type { Task, UpdateTaskRequest, ApiResponse } from "@/types/task"

// In-memory storage for tasks (shared with main route)
// Note: In a real app, this would be in a database or shared state management
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

// PUT /api/tasks/[id] - Update existing task
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body: UpdateTaskRequest = await request.json()

    // Find the task
    const taskIndex = tasks.findIndex((task) => task.id === id)

    if (taskIndex === -1) {
      const errorResponse: ApiResponse = {
        success: false,
        error: `Task with id ${id} not found`,
      }
      return NextResponse.json(errorResponse, { status: 404 })
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

    // Update the task
    const currentTask = tasks[taskIndex]
    const updatedTask: Task = {
      ...currentTask,
      ...(body.title !== undefined && { title: body.title.trim() }),
      ...(body.description !== undefined && { description: body.description.trim() }),
      ...(body.status !== undefined && { status: body.status }),
    }

    tasks[taskIndex] = updatedTask

    const response: ApiResponse<Task> = {
      success: true,
      data: updatedTask,
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

    // Find the task
    const taskIndex = tasks.findIndex((task) => task.id === id)

    if (taskIndex === -1) {
      const errorResponse: ApiResponse = {
        success: false,
        error: `Task with id ${id} not found`,
      }
      return NextResponse.json(errorResponse, { status: 404 })
    }

    // Get the task before deletion for response
    const deletedTask = tasks[taskIndex]

    // Remove the task
    tasks.splice(taskIndex, 1)

    const response: ApiResponse<Task> = {
      success: true,
      data: deletedTask,
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
