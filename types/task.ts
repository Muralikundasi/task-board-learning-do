export interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "done"
  createdAt: Date
}

export type TaskStatus = Task["status"]

// API request/response types
export interface CreateTaskRequest {
  title: string
  description: string
  status: TaskStatus
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  status?: TaskStatus
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
