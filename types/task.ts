export interface Task {
  id: string // UUID from Supabase
  title: string
  description?: string
  status: "todo" | "in-progress" | "done"
  created_at: string // ISO string from Supabase
  updated_at?: string // ISO string from Supabase
}

export type TaskStatus = Task["status"]

// Database types for Supabase
export interface TaskRow {
  id: string
  title: string
  description?: string
  status: TaskStatus
  created_at: string
  updated_at: string
}

// API request/response types
export interface CreateTaskRequest {
  title: string
  description?: string
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
