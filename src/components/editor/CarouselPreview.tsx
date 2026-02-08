import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { SlideData, TextStyle, AspectRatio } from "@/pages/Editor";

interface CarouselPreviewProps {
  slides: SlideData[];
  activeSlideIndex: number;
  aspectRatio: AspectRatio;
  textStyle: TextStyle;
  onSlideClick: (index: number) => void;
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

export const CarouselPreview = ({
  slides,
  activeSlideIndex,
  aspectRatio,
  textStyle,
  onSlideClick,
}: CarouselPreviewProps) => {
  const aspectRatioClass = aspectRatio === "1:1" ? "aspect-square" : "aspect-[4/5]";

  return (
    <div className="h-32 border-t bg-card">
      <ScrollArea className="h-full w-full">
        <div className="flex gap-3 p-3 h-full">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              className={`relative flex-shrink-0 h-full ${aspectRatioClass} rounded-lg overflow-hidden border-2 transition-all ${
                index === activeSlideIndex
                  ? "border-primary shadow-glow"
                  : "border-transparent hover:border-muted-foreground/30"
              }`}
              onClick={() => onSlideClick(index)}
            >
              {/* Image */}
              {slide.image && (
                <img
                  src={slide.image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              {/* Text overlay (scaled down) */}
              {slide.text && (
                <div
                  className={`absolute ${getFontClass(textStyle.fontFamily)} font-semibold text-center max-w-[80%] text-[6px] leading-tight`}
                  style={{
                    color: textStyle.color,
                    left: `${slide.textPosition.x}%`,
                    top: `${slide.textPosition.y}%`,
                    transform: "translate(-50%, -50%)",
                    textShadow: textStyle.shadowEnabled
                      ? `0 1px 2px ${textStyle.shadowColor}`
                      : undefined,
                  }}
                >
                  {slide.text.slice(0, 50)}...
                </div>
              )}

              {/* Slide number */}
              <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center">
                {index + 1}
              </div>
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
