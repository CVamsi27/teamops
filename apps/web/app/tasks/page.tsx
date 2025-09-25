"use client";
import ReanderTask from "@/components/tasks/render-task";
import CreateTask from "@/components/tasks/create-task";

export default function TasksPage() {
  return (
    <div className="grid md:grid-cols-2 grid-gap">
      <CreateTask />
      <ReanderTask />
    </div>
  );
}
