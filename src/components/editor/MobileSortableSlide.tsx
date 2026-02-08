import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";
import type { SlideData } from "@/pages/Editor";

interface MobileSortableSlideProps {
  slide: SlideData;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export const MobileSortableSlide = ({
  slide,
  index,
  isActive,
  onClick,
  onDelete,
}: MobileSortableSlideProps) => {
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
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all touch-manipulation ${
        isDragging ? "opacity-50 scale-105" : ""
      } ${
        isActive
          ? "border-primary shadow-glow"
          : "border-transparent"
      }`}
      onClick={onClick}
    >
      {/* Image */}
      {slide.image && (
        <img
          src={slide.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      )}

      {/* Slide number badge */}
      <div className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white text-[10px] flex items-center justify-center font-medium">
        {index + 1}
      </div>

      {/* Delete button - only show on active */}
      {isActive && (
        <button
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center shadow-sm z-10"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
