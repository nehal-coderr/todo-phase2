import { TaskCard } from "./task-card";
import type { Task } from "@/types/task";

interface TaskListProps {
  tasks: Task[];
  onEdit: (id: string) => void;
  onDelete: (task: Task) => void;
  onClick: (id: string) => void;
  deletingId?: string | null;
}

export function TaskList({
  tasks,
  onEdit,
  onDelete,
  onClick,
  deletingId,
}: TaskListProps) {
  const sorted = [...tasks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-3">
      {sorted.map((task) => (
        <TaskCard
          key={task.id}
          title={task.title}
          status={task.status}
          createdAt={task.createdAt}
          onEdit={() => onEdit(task.id)}
          onDelete={() => onDelete(task)}
          onClick={() => onClick(task.id)}
          isDeleting={deletingId === task.id}
        />
      ))}
    </div>
  );
}
