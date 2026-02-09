import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DndContext,
  closestCenter,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Upload,
  Type,
  Palette,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Move,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus,
  ArrowLeft,
  Download,
  Mic,
  MicOff,
  Save,
  Loader2,
} from "lucide-react";
import type { SlideData, TextStyle, AspectRatio } from "@/pages/Editor";
import { MobileSortableSlide } from "./MobileSortableSlide";
import { MobileStyleSheet } from "./MobileStyleSheet";

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}
interface MobileEditorProps {
  slides: SlideData[];
  activeSlideIndex: number;
  aspectRatio: AspectRatio;
  textStyle: TextStyle;
  fullText: string;
  projectTitle: string;
  isSaving: boolean;
  onImagesUpload: (files: File[]) => void;
  onActiveSlideChange: (index: number) => void;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  onTextStyleChange: (style: TextStyle) => void;
  onFullTextChange: (text: string) => void;
  onDistributeText: () => void;
  onReorderSlides: (startIndex: number, endIndex: number) => void;
  onDeleteSlide: (slideId: string) => void;
  onSlideTextChange: (slideId: string, text: string) => void;
  onPositionChange: (slideId: string, position: { x: number; y: number }) => void;
  onPositionModeChange: (slideId: string, mode: SlideData["positionMode"]) => void;
  onSaveProject: () => void;
  onProjectTitleChange: (title: string) => void;
  onDownload: () => void;
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

export const MobileEditor = ({
  slides,
  activeSlideIndex,
  aspectRatio,
  textStyle,
  fullText,
  projectTitle,
  isSaving,
  onImagesUpload,
  onActiveSlideChange,
  onAspectRatioChange,
  onTextStyleChange,
  onFullTextChange,
  onDistributeText,
  onReorderSlides,
  onDeleteSlide,
  onSlideTextChange,
  onPositionChange,
  onPositionModeChange,
  onSaveProject,
  onProjectTitleChange,
  onDownload,
}: MobileEditorProps) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isTextSheetOpen, setIsTextSheetOpen] = useState(false);
  const [isStyleSheetOpen, setIsStyleSheetOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition
  const startRecording = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Ваш браузер не поддерживает запись голоса");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ru-RU";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      onFullTextChange(fullText + (fullText ? " " : "") + transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [fullText, onFullTextChange]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  );

  const activeSlide = slides[activeSlideIndex];
  const aspectRatioClass = aspectRatio === "1:1" ? "aspect-square" : "aspect-[4/5]";

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        onImagesUpload(files);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [onImagesUpload]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = slides.findIndex((s) => s.id === active.id);
      const newIndex = slides.findIndex((s) => s.id === over.id);
      onReorderSlides(oldIndex, newIndex);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (activeSlide?.positionMode !== "manual") return;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current || !activeSlide) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    onPositionChange(activeSlide.id, {
      x: Math.max(10, Math.min(90, x)),
      y: Math.max(10, Math.min(90, y)),
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const textStyles: React.CSSProperties = activeSlide ? {
    fontSize: `${Math.min(textStyle.fontSize, 24)}px`,
    color: textStyle.color,
    textShadow: textStyle.shadowEnabled
      ? `0 2px ${textStyle.shadowBlur}px ${textStyle.shadowColor}`
      : undefined,
    WebkitTextStroke: textStyle.strokeEnabled
      ? `${textStyle.strokeWidth}px ${textStyle.strokeColor}`
      : undefined,
    left: `${activeSlide.textPosition.x}%`,
    top: `${activeSlide.textPosition.y}%`,
    transform: "translate(-50%, -50%)",
  } : {};

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-card safe-area-top">
        <button
          className="flex items-center gap-1 text-foreground"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <input
          type="text"
          value={projectTitle}
          onChange={(e) => onProjectTitleChange(e.target.value)}
          className="text-sm font-semibold text-foreground bg-transparent text-center border-none outline-none max-w-[120px]"
          placeholder="Без названия"
        />
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs px-2 h-8"
            onClick={onSaveProject}
            disabled={isSaving || slides.length === 0}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
          </Button>
          <Button
            size="sm"
            className="bg-gradient-brand text-xs px-2 h-8"
            disabled={slides.length === 0}
            onClick={onDownload}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Main Preview Area - fills remaining space */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Preview Canvas */}
        <div className="flex-1 flex items-center justify-center p-3 bg-muted/30">
          {activeSlide ? (
            <div
              ref={containerRef}
              className={`relative ${aspectRatioClass} w-full max-h-full bg-muted rounded-xl overflow-hidden shadow-soft`}
              style={{ maxWidth: aspectRatio === "1:1" ? "calc(100dvh - 280px)" : "calc((100dvh - 280px) * 0.8)" }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Image */}
              {activeSlide.image && (
                <img
                  src={activeSlide.image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />
              )}

              {/* Text overlay */}
              <div
                className={`absolute ${getFontClass(textStyle.fontFamily)} font-semibold text-center max-w-[85%] pointer-events-none`}
                style={textStyles}
              >
                {textStyle.backgroundEnabled && activeSlide.text && (
                  <div
                    className="absolute inset-0 -m-2 rounded"
                    style={{
                      backgroundColor: textStyle.backgroundColor,
                      opacity: textStyle.backgroundOpacity / 100,
                      borderRadius: `${textStyle.backgroundRadius}px`,
                    }}
                  />
                )}
                <span className="relative z-10 whitespace-pre-wrap text-sm leading-tight">
                  {activeSlide.text || "Нажмите Аа для добавления текста"}
                </span>
              </div>

              {/* Slide counter */}
              <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/50 text-white text-xs font-medium">
                {activeSlideIndex + 1} / {slides.length}
              </div>

              {/* Navigation arrows */}
              {slides.length > 1 && (
                <>
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center disabled:opacity-30"
                    onClick={() => onActiveSlideChange(activeSlideIndex - 1)}
                    disabled={activeSlideIndex === 0}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center disabled:opacity-30"
                    onClick={() => onActiveSlideChange(activeSlideIndex + 1)}
                    disabled={activeSlideIndex >= slides.length - 1}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          ) : (
            <button
              className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-muted-foreground/30 rounded-xl"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-brand flex items-center justify-center">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <span className="text-muted-foreground text-sm">Добавить фотографии</span>
            </button>
          )}
        </div>

        {/* Position Mode Strip */}
        {activeSlide && (
          <div className="flex items-center justify-center gap-1 px-2 py-2 bg-card border-t">
            {[
              { mode: "fixed-top" as const, icon: AlignVerticalJustifyStart, label: "Верх" },
              { mode: "fixed-center" as const, icon: AlignVerticalJustifyCenter, label: "Центр" },
              { mode: "fixed-bottom" as const, icon: AlignVerticalJustifyEnd, label: "Низ" },
              { mode: "manual" as const, icon: Move, label: "Ручное" },
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  activeSlide.positionMode === mode
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => onPositionModeChange(activeSlide.id, mode)}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px]">{label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Thumbnail Strip with DnD */}
        <div className="h-16 border-t bg-card">
          <ScrollArea className="h-full w-full">
            <div className="flex items-center gap-2 p-1.5 h-full">
              {/* Add photo button */}
              <button
                className="flex-shrink-0 w-12 h-12 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
                disabled={slides.length >= 10}
              >
                <Plus className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Sortable slides */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={slides.map((s) => s.id)}
                  strategy={horizontalListSortingStrategy}
                >
                  {slides.map((slide, index) => (
                    <MobileSortableSlide
                      key={slide.id}
                      slide={slide}
                      index={index}
                      isActive={index === activeSlideIndex}
                      onClick={() => onActiveSlideChange(index)}
                      onDelete={() => onDeleteSlide(slide.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Text Input Area - always visible */}
        <div className="px-3 py-2 border-t bg-card space-y-2 shrink-0">
          <Textarea
            placeholder="Введите весь текст поста здесь..."
            className="w-full min-h-[60px] max-h-[80px] text-sm resize-none"
            value={fullText}
            onChange={(e) => onFullTextChange(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              className="flex-1 h-8"
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-3.5 h-3.5 mr-1" />
                  Стоп
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 mr-1" />
                  Голос
                </>
              )}
            </Button>
            <Button
              size="sm"
              className="flex-1 h-8 bg-gradient-brand"
              onClick={onDistributeText}
              disabled={!fullText.trim() || slides.length === 0}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Распределить
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-around py-2 px-4 border-t bg-card safe-area-bottom shrink-0">
        {/* Text Sheet */}
        <Sheet open={isTextSheetOpen} onOpenChange={setIsTextSheetOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <Type className="w-6 h-6" />
              <span className="text-xs">Текст</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70dvh] rounded-t-2xl">
            <SheetHeader className="pb-2">
              <SheetTitle>Текст</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100%-60px)]">
              <div className="space-y-4 pb-6">
                {/* Full text input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Весь текст поста</label>
                  <Textarea
                    placeholder="Введите текст для карусели..."
                    className="min-h-[100px]"
                    value={fullText}
                    onChange={(e) => onFullTextChange(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 bg-gradient-brand"
                      onClick={() => {
                        onDistributeText();
                        setIsTextSheetOpen(false);
                      }}
                      disabled={!fullText.trim() || slides.length === 0}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Распределить
                    </Button>
                  </div>
                </div>

                {/* Per-slide text */}
                {slides.length > 0 && (
                  <div className="space-y-3 pt-3 border-t">
                    <label className="text-sm font-medium">Текст на слайдах</label>
                    {slides.map((slide, index) => (
                      <div key={slide.id} className="flex gap-2">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {slide.image && (
                            <img
                              src={slide.image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <Textarea
                          placeholder={`Слайд ${index + 1}...`}
                          className="min-h-[48px] text-sm flex-1"
                          value={slide.text}
                          onChange={(e) => onSlideTextChange(slide.id, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        {/* Style Sheet */}
        <Sheet open={isStyleSheetOpen} onOpenChange={setIsStyleSheetOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <Palette className="w-6 h-6" />
              <span className="text-xs">Стиль</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80dvh] rounded-t-2xl">
            <SheetHeader className="pb-2">
              <SheetTitle>Стиль текста</SheetTitle>
            </SheetHeader>
            <MobileStyleSheet
              textStyle={textStyle}
              aspectRatio={aspectRatio}
              onTextStyleChange={onTextStyleChange}
              onAspectRatioChange={onAspectRatioChange}
            />
          </SheetContent>
        </Sheet>

        {/* Upload button */}
        <button
          className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => fileInputRef.current?.click()}
          disabled={slides.length >= 10}
        >
          <Upload className="w-6 h-6" />
          <span className="text-xs">Фото</span>
        </button>
      </div>
    </div>
  );
};
