import type { ApiResponse } from "@/types/task"

export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  }
}

export function createErrorResponse(error: string, statusCode?: number): ApiResponse {
  return {
    success: false,
    error,
  }
}

export function validateTaskStatus(status: string): boolean {
  const validStatuses = ["todo", "in-progress", "done"]
  return validStatuses.includes(status)
}

export function isValidString(value: any): boolean {
  return typeof value === "string" && value.trim().length > 0
}
