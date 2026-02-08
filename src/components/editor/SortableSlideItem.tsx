import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2 } from "lucide-react";
import type { SlideData } from "@/pages/Editor";

interface SortableSlideItemProps {
  slide: SlideData;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const SortableSlideItem = ({
  slide,
  index,
  isActive,
  onClick,
  onDelete,
}: SortableSlideItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
        isActive
          ? "border-primary bg-primary/5"
          : "hover:bg-muted"
      } ${isDragging ? "shadow-lg" : ""}`}
      onClick={onClick}
    >
      <div
        {...attributes}
        {...listeners}
        className="touch-none cursor-grab active:cursor-grabbing p-1"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
        {slide.image && (
          <img
            src={slide.image}
            alt=""
            className="w-full h-full object-cover pointer-events-none"
            draggable={false}
          />
        )}
      </div>
      <span className="text-sm flex-1">Слайд {index + 1}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(e);
        }}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};
