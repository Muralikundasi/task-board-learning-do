"use client"

import { useState } from "react"
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
import { Plus, Trash2 } from "lucide-react"
import type { Task, TaskStatus } from "@/types/task"

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: "todo", title: "To Do", color: "border-l-blue-500" },
  { id: "in-progress", title: "In Progress", color: "border-l-yellow-500" },
  { id: "done", title: "Done", color: "border-l-green-500" },
]

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Design Homepage",
      description: "Create wireframes and mockups for the new homepage layout",
      status: "todo",
      createdAt: new Date(),
    },
    {
      id: "2",
      title: "Setup Database",
      description: "Configure PostgreSQL database and create initial schema",
      status: "in-progress",
      createdAt: new Date(),
    },
    {
      id: "3",
      title: "User Authentication",
      description: "Implement login and registration functionality",
      status: "done",
      createdAt: new Date(),
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTask, setNewTask] = useState({ title: "", description: "", status: "todo" as TaskStatus })

  const addTask = () => {
    if (newTask.title.trim() && newTask.description.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        createdAt: new Date(),
      }
      setTasks([...tasks, task])
      setNewTask({ title: "", description: "", status: "todo" })
      setIsDialogOpen(false)
    }
  }

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
  }

  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)))
  }

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status)
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
                <Button type="submit" onClick={addTask}>
                  Add Task
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Task Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COLUMNS.map((column) => (
            <div key={column.id} className="bg-white rounded-lg shadow-sm border">
              {/* Column Header */}
              <div className={`p-4 border-b border-l-4 ${column.color}`}>
                <h2 className="font-semibold text-gray-900">{column.title}</h2>
                <p className="text-sm text-gray-500 mt-1">{getTasksByStatus(column.id).length} tasks</p>
              </div>

              {/* Tasks */}
              <div className="p-4 space-y-3 min-h-[400px]">
                {getTasksByStatus(column.id).map((task) => (
                  <Card key={task.id} className="group hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm font-medium leading-tight">{task.title}</CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-xs leading-relaxed mb-3">{task.description}</CardDescription>

                      {/* Move Task Buttons */}
                      <div className="flex gap-1 flex-wrap">
                        {COLUMNS.filter((col) => col.id !== task.status).map((col) => (
                          <Button
                            key={col.id}
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => moveTask(task.id, col.id)}
                          >
                            Move to {col.title}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {getTasksByStatus(column.id).length === 0 && (
                  <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                    No tasks in {column.title.toLowerCase()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

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
    </div>
  )
}
