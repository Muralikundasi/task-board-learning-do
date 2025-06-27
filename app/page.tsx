"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import type { Task, TaskStatus } from "@/types/task"
import { TaskApiClient } from "@/lib/api-client"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: "todo", title: "To Do", color: "border-l-blue-500" },
  { id: "in-progress", title: "In Progress", color: "border-l-yellow-500" },
  { id: "done", title: "Done", color: "border-l-green-500" },
]

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newTask, setNewTask] = useState({ title: "", description: "", status: "todo" as TaskStatus })
  const { toast } = useToast()
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editedTitle, setEditedTitle] = useState("")

  // Load tasks on component mount
  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setIsLoading(true)
      const fetchedTasks = await TaskApiClient.getAllTasks()
      setTasks(fetchedTasks)
    } catch (error) {
      console.error("Error loading tasks:", error)
      toast({
        title: "Error",
        description: "Failed to load tasks. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addTask = async () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in the title.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsCreating(true)
      const createdTask = await TaskApiClient.createTask({
        title: newTask.title,
        status: newTask.status,
        // Only include description if it's not empty
        ...(newTask.description.trim() ? { description: newTask.description } : {})
      })

      setTasks([createdTask, ...tasks])
      setNewTask({ title: "", description: "", status: "todo" })
      setIsDialogOpen(false)

      toast({
        title: "Success",
        description: "Task created successfully!",
      })
    } catch (error) {
      console.error("Error creating task:", error)
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      await TaskApiClient.deleteTask(taskId)
      setTasks(tasks.filter((task) => task.id !== taskId))

      toast({
        title: "Success",
        description: "Task deleted successfully!",
      })
    } catch (error) {
      console.error("Error deleting task:", error)
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status)
  }

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    // Optimistically update UI
    const newStatus = destination.droppableId as TaskStatus
    setTasks((prev) => {
      const task = prev.find((t) => t.id === draggableId)
      if (!task) return prev
      return prev.map((t) => (t.id === draggableId ? { ...t, status: newStatus } : t))
    })

    // Update in database
    try {
      await TaskApiClient.updateTask(draggableId, { status: newStatus })
      toast({
        title: "Success",
        description: "Task moved successfully!",
      })
    } catch (error) {
      // Revert optimistic update on error
      setTasks((prev) => {
        const task = prev.find((t) => t.id === draggableId)
        if (!task) return prev
        return prev.map((t) => (t.id === draggableId ? { ...t, status: source.droppableId as TaskStatus } : t))
      })

      console.error("Error moving task:", error)
      toast({
        title: "Error",
        description: "Failed to move task. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading tasks...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Management Board</h1>
          <p className="text-gray-600 mb-6">Organize and track your tasks efficiently</p>

          {/* Add Task Button */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mb-6">
                <Plus className="w-4 h-4 mr-2" />
                Add New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>Create a new task and assign it to a column.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Enter task title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value as TaskStatus })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={addTask} disabled={isCreating}>
                  {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isCreating ? "Creating..." : "Add Task"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Task Board */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {COLUMNS.map((column) => (
              <Droppable droppableId={column.id} key={column.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-white rounded-lg shadow-sm border flex flex-col"
                  >
                    {/* Column Header */}
                    <div className={`p-4 border-b border-l-4 ${column.color}`}>
                      <h2 className="font-semibold text-gray-900">{column.title}</h2>
                      <p className="text-sm text-gray-500 mt-1">{getTasksByStatus(column.id).length} tasks</p>
                    </div>
                    {/* Tasks */}
                    <div className="p-4 space-y-3 min-h-[400px] flex-1">
                      {getTasksByStatus(column.id).map((task, idx) => (
                        <Draggable draggableId={task.id} index={idx} key={task.id}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                              <Card className="group hover:shadow-md transition-shadow">
                                <CardHeader>
                                  <CardTitle
                                    className="cursor-pointer"
                                    onClick={() => {
                                      setEditingTaskId(task.id)
                                      setEditedTitle(task.title)
                                    }}
                                  >
                                    {editingTaskId === task.id ? (
                                      <Input
                                        autoFocus
                                        value={editedTitle}
                                        onChange={e => setEditedTitle(e.target.value)}
                                        onBlur={async () => {
                                          if (editedTitle.trim() && editedTitle !== task.title) {
                                            await TaskApiClient.updateTask(task.id, { title: editedTitle })
                                            setTasks(prev =>
                                              prev.map(t => t.id === task.id ? { ...t, title: editedTitle } : t)
                                            )
                                          }
                                          setEditingTaskId(null)
                                        }}
                                        onKeyDown={async e => {
                                          if (e.key === "Enter") {
                                            if (editedTitle.trim() && editedTitle !== task.title) {
                                              await TaskApiClient.updateTask(task.id, { title: editedTitle })
                                              setTasks(prev =>
                                                prev.map(t => t.id === task.id ? { ...t, title: editedTitle } : t)
                                              )
                                            }
                                            setEditingTaskId(null)
                                          }
                                          if (e.key === "Escape") {
                                            setEditingTaskId(null)
                                          }
                                        }}
                                        className="flex-1"
                                      />
                                    ) : (
                                      task.title
                                    )}
                                  </CardTitle>
                                  <CardDescription>
                                    {task.description || "No description"}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0">
                                  <div className="text-xs text-gray-400">
                                    Created: {new Date(task.created_at).toLocaleDateString()}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {getTasksByStatus(column.id).length === 0 && (
                        <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                          No tasks in {column.title.toLowerCase()}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{getTasksByStatus("todo").length}</div>
              <p className="text-sm text-gray-600">Tasks to do</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{getTasksByStatus("in-progress").length}</div>
              <p className="text-sm text-gray-600">In progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{getTasksByStatus("done").length}</div>
              <p className="text-sm text-gray-600">Completed</p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
