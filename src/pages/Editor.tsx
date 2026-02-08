import { useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { EditorSidebar } from "@/components/editor/EditorSidebar";
import { SlidePreview } from "@/components/editor/SlidePreview";
import { CarouselPreview } from "@/components/editor/CarouselPreview";
import { Button } from "@/components/ui/button";
import { Download, Save, ChevronLeft, ChevronRight } from "lucide-react";

export interface SlideData {
  id: string;
  image: string | null;
  text: string;
  textPosition: { x: number; y: number };
  positionMode: "fixed-top" | "fixed-center" | "fixed-bottom" | "smart" | "manual";
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  strokeEnabled: boolean;
  strokeColor: string;
  strokeWidth: number;
  backgroundEnabled: boolean;
  backgroundColor: string;
  backgroundOpacity: number;
  backgroundRadius: number;
}

export type AspectRatio = "1:1" | "4:5";

const defaultTextStyle: TextStyle = {
  fontFamily: "Montserrat",
  fontSize: 32,
  color: "#ffffff",
  shadowEnabled: true,
  shadowColor: "#000000",
  shadowBlur: 4,
  strokeEnabled: false,
  strokeColor: "#000000",
  strokeWidth: 2,
  backgroundEnabled: false,
  backgroundColor: "#000000",
  backgroundOpacity: 50,
  backgroundRadius: 8,
};

const Editor = () => {
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [textStyle, setTextStyle] = useState<TextStyle>(defaultTextStyle);
  const [fullText, setFullText] = useState("");

  const handleImagesUpload = useCallback((files: File[]) => {
    const newSlides: SlideData[] = files.map((file, index) => ({
      id: `slide-${Date.now()}-${index}`,
      image: URL.createObjectURL(file),
      text: "",
      textPosition: { x: 50, y: 50 },
      positionMode: "fixed-center" as const,
    }));
    setSlides((prev) => [...prev, ...newSlides].slice(0, 10));
  }, []);

  const handleTextChange = useCallback((slideId: string, text: string) => {
    setSlides((prev) =>
      prev.map((slide) =>
        slide.id === slideId ? { ...slide, text } : slide
      )
    );
  }, []);

  const handlePositionChange = useCallback((slideId: string, position: { x: number; y: number }) => {
    setSlides((prev) =>
      prev.map((slide) =>
        slide.id === slideId ? { ...slide, textPosition: position, positionMode: "manual" } : slide
      )
    );
  }, []);

  const handlePositionModeChange = useCallback((slideId: string, mode: SlideData["positionMode"]) => {
    setSlides((prev) =>
      prev.map((slide) => {
        if (slide.id !== slideId) return slide;
        
        let newPosition = slide.textPosition;
        if (mode === "fixed-top") newPosition = { x: 50, y: 15 };
        else if (mode === "fixed-center") newPosition = { x: 50, y: 50 };
        else if (mode === "fixed-bottom") newPosition = { x: 50, y: 85 };
        
        return { ...slide, positionMode: mode, textPosition: newPosition };
      })
    );
  }, []);

  const handleReorderSlides = useCallback((startIndex: number, endIndex: number) => {
    setSlides((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  const handleDeleteSlide = useCallback((slideId: string) => {
    setSlides((prev) => prev.filter((slide) => slide.id !== slideId));
    setActiveSlideIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const distributeText = useCallback(() => {
    if (!fullText.trim() || slides.length === 0) return;
    
    const sentences = fullText.split(/(?<=[.!?])\s+/).filter(Boolean);
    const slidesCount = slides.length;
    const sentencesPerSlide = Math.ceil(sentences.length / slidesCount);
    
    setSlides((prev) =>
      prev.map((slide, index) => {
        const start = index * sentencesPerSlide;
        const end = start + sentencesPerSlide;
        const slideText = sentences.slice(start, end).join(" ");
        return { ...slide, text: slideText };
      })
    );
  }, [fullText, slides.length]);

  const activeSlide = slides[activeSlideIndex];

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      
      <main className="flex-1 pt-16">
        <div className="flex h-[calc(100vh-64px)]">
          {/* Sidebar */}
          <EditorSidebar
            slides={slides}
            activeSlideIndex={activeSlideIndex}
            aspectRatio={aspectRatio}
            textStyle={textStyle}
            fullText={fullText}
            onImagesUpload={handleImagesUpload}
            onActiveSlideChange={setActiveSlideIndex}
            onAspectRatioChange={setAspectRatio}
            onTextStyleChange={setTextStyle}
            onFullTextChange={setFullText}
            onDistributeText={distributeText}
            onReorderSlides={handleReorderSlides}
            onDeleteSlide={handleDeleteSlide}
          />

          {/* Main Editor Area */}
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="h-14 border-b bg-card flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={activeSlideIndex === 0}
                  onClick={() => setActiveSlideIndex((prev) => prev - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground min-w-[80px] text-center">
                  {slides.length > 0 ? `${activeSlideIndex + 1} / ${slides.length}` : "0 / 0"}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={activeSlideIndex >= slides.length - 1}
                  onClick={() => setActiveSlideIndex((prev) => prev + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Сохранить
                </Button>
                <Button 
                  size="sm" 
                  className="bg-gradient-brand hover:opacity-90"
                  disabled={slides.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Скачать
                </Button>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
              {activeSlide ? (
                <SlidePreview
                  slide={activeSlide}
                  aspectRatio={aspectRatio}
                  textStyle={textStyle}
                  onTextChange={(text) => handleTextChange(activeSlide.id, text)}
                  onPositionChange={(pos) => handlePositionChange(activeSlide.id, pos)}
                  onPositionModeChange={(mode) => handlePositionModeChange(activeSlide.id, mode)}
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <p className="text-lg mb-2">Нет загруженных фотографий</p>
                  <p className="text-sm">Загрузите изображения в боковой панели слева</p>
                </div>
              )}
            </div>

            {/* Carousel strip */}
            {slides.length > 0 && (
              <CarouselPreview
                slides={slides}
                activeSlideIndex={activeSlideIndex}
                aspectRatio={aspectRatio}
                textStyle={textStyle}
                onSlideClick={setActiveSlideIndex}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Editor;
