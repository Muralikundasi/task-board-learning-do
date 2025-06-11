import type { Task, CreateTaskRequest, UpdateTaskRequest, ApiResponse } from "@/types/task"

const API_BASE_URL = "/api"

export class TaskApiClient {
  // GET /api/tasks
  static async getAllTasks(): Promise<Task[]> {
    const response = await fetch(`${API_BASE_URL}/tasks`)
    const result: ApiResponse<Task[]> = await response.json()

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch tasks")
    }

    return result.data || []
  }

  // POST /api/tasks
  static async createTask(taskData: CreateTaskRequest): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    })

    const result: ApiResponse<Task> = await response.json()

    if (!result.success) {
      throw new Error(result.error || "Failed to create task")
    }

    return result.data!
  }

  // PUT /api/tasks/[id]
  static async updateTask(id: string, updates: UpdateTaskRequest): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    })

    const result: ApiResponse<Task> = await response.json()

    if (!result.success) {
      throw new Error(result.error || "Failed to update task")
    }

    return result.data!
  }

  // DELETE /api/tasks/[id]
  static async deleteTask(id: string): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "DELETE",
    })

    const result: ApiResponse<Task> = await response.json()

    if (!result.success) {
      throw new Error(result.error || "Failed to delete task")
    }

    return result.data!
  }
}
