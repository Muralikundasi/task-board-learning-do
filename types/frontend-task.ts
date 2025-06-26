// Frontend Task interface that matches what we use in components
export interface FrontendTask {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "done"
  createdAt: Date // Date object for frontend use
  created_at: string // ISO string from API
  updated_at?: string
}

export type TaskStatus = FrontendTask["status"]
