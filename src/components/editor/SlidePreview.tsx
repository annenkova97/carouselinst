import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlignVerticalJustifyStart, 
  AlignVerticalJustifyCenter, 
  AlignVerticalJustifyEnd,
  Move
} from "lucide-react";
import type { SlideData, TextStyle, AspectRatio } from "@/pages/Editor";

interface SlidePreviewProps {
  slide: SlideData;
  aspectRatio: AspectRatio;
  textStyle: TextStyle;
  onTextChange: (text: string) => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  onPositionModeChange: (mode: SlideData["positionMode"]) => void;
}

const getFontClass = (fontFamily: string) => {
  const fontMap: Record<string, string> = {
    "Montserrat": "font-montserrat",
    "Playfair Display": "font-playfair",
    "Roboto": "font-roboto",
    "Open Sans": "font-opensans",
    "Oswald": "font-oswald",
    "Merriweather": "font-merriweather",
    "Lato": "font-lato",
    "Raleway": "font-raleway",
    "Poppins": "font-poppins",
    "Pacifico": "font-pacifico",
  };
  return fontMap[fontFamily] || "font-montserrat";
};

export const SlidePreview = ({
  slide,
  aspectRatio,
  textStyle,
  onTextChange,
  onPositionChange,
  onPositionModeChange,
}: SlidePreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const aspectRatioClass = aspectRatio === "1:1" ? "aspect-square" : "aspect-[4/5]";

  const textStyles: React.CSSProperties = {
    fontSize: `${textStyle.fontSize}px`,
    color: textStyle.color,
    textShadow: textStyle.shadowEnabled
      ? `0 2px ${textStyle.shadowBlur}px ${textStyle.shadowColor}`
      : undefined,
    WebkitTextStroke: textStyle.strokeEnabled
      ? `${textStyle.strokeWidth}px ${textStyle.strokeColor}`
      : undefined,
    left: `${slide.textPosition.x}%`,
    top: `${slide.textPosition.y}%`,
    transform: "translate(-50%, -50%)",
  };

  const backgroundStyles: React.CSSProperties = textStyle.backgroundEnabled
    ? {
        backgroundColor: textStyle.backgroundColor,
        opacity: textStyle.backgroundOpacity / 100,
        borderRadius: `${textStyle.backgroundRadius}px`,
      }
    : {};

  const handleMouseDown = (e: React.MouseEvent) => {
    if (slide.positionMode !== "manual" || isEditing) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    onPositionChange({
      x: Math.max(10, Math.min(90, x)),
      y: Math.max(10, Math.min(90, y)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mouseup", handleMouseUp);
      return () => document.removeEventListener("mouseup", handleMouseUp);
    }
  }, [isDragging]);

  return (
    <div className="flex flex-col gap-4">
      {/* Position mode buttons */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant={slide.positionMode === "fixed-top" ? "default" : "outline"}
          size="sm"
          onClick={() => onPositionModeChange("fixed-top")}
        >
          <AlignVerticalJustifyStart className="w-4 h-4 mr-2" />
          Верх
        </Button>
        <Button
          variant={slide.positionMode === "fixed-center" ? "default" : "outline"}
          size="sm"
          onClick={() => onPositionModeChange("fixed-center")}
        >
          <AlignVerticalJustifyCenter className="w-4 h-4 mr-2" />
          Центр
        </Button>
        <Button
          variant={slide.positionMode === "fixed-bottom" ? "default" : "outline"}
          size="sm"
          onClick={() => onPositionModeChange("fixed-bottom")}
        >
          <AlignVerticalJustifyEnd className="w-4 h-4 mr-2" />
          Низ
        </Button>
        <Button
          variant={slide.positionMode === "manual" ? "default" : "outline"}
          size="sm"
          onClick={() => onPositionModeChange("manual")}
        >
          <Move className="w-4 h-4 mr-2" />
          Ручное
        </Button>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className={`relative ${aspectRatioClass} w-full max-w-lg bg-muted rounded-lg overflow-hidden shadow-soft cursor-${
          slide.positionMode === "manual" ? "move" : "default"
        }`}
        onMouseMove={handleMouseMove}
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

        {/* Text overlay */}
        <div
          ref={textRef}
          className={`absolute ${getFontClass(textStyle.fontFamily)} font-semibold text-center max-w-[80%] ${
            slide.positionMode === "manual" ? "cursor-move" : ""
          }`}
          style={textStyles}
          onMouseDown={handleMouseDown}
          onDoubleClick={() => setIsEditing(true)}
        >
          {/* Background */}
          {textStyle.backgroundEnabled && slide.text && (
            <div
              className="absolute inset-0 -m-3"
              style={backgroundStyles}
            />
          )}
          
          {/* Text content */}
          {isEditing ? (
            <Textarea
              value={slide.text}
              onChange={(e) => onTextChange(e.target.value)}
              onBlur={() => setIsEditing(false)}
              autoFocus
              className="relative z-10 bg-transparent border-none resize-none text-center focus:ring-0"
              style={{
                fontSize: `${textStyle.fontSize}px`,
                color: textStyle.color,
                fontFamily: "inherit",
              }}
            />
          ) : (
            <span className="relative z-10 whitespace-pre-wrap">
              {slide.text || "Дважды кликните для редактирования"}
            </span>
          )}
        </div>

        {/* Drag indicator */}
        {slide.positionMode === "manual" && !isEditing && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-xs">
            Перетащите текст
          </div>
        )}
      </div>
    </div>
  );
};
