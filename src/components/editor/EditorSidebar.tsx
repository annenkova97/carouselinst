import { useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { 
  Upload, 
  Mic, 
  Sparkles, 
  Square,
  RectangleVertical
} from "lucide-react";
import type { SlideData, TextStyle, AspectRatio } from "@/pages/Editor";
import { SortableSlideItem } from "./SortableSlideItem";

interface EditorSidebarProps {
  slides: SlideData[];
  activeSlideIndex: number;
  aspectRatio: AspectRatio;
  textStyle: TextStyle;
  fullText: string;
  onImagesUpload: (files: File[]) => void;
  onActiveSlideChange: (index: number) => void;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  onTextStyleChange: (style: TextStyle) => void;
  onFullTextChange: (text: string) => void;
  onDistributeText: () => void;
  onReorderSlides: (startIndex: number, endIndex: number) => void;
  onDeleteSlide: (slideId: string) => void;
  onSlideTextChange: (slideId: string, text: string) => void;
}

const fonts = [
  { name: "Montserrat", className: "font-montserrat", sample: "Карусель" },
  { name: "Playfair Display", className: "font-playfair", sample: "Элегант" },
  { name: "Roboto", className: "font-roboto", sample: "Простота" },
  { name: "Open Sans", className: "font-opensans", sample: "Чёткость" },
  { name: "Oswald", className: "font-oswald", sample: "МОЩНОСТЬ" },
  { name: "Merriweather", className: "font-merriweather", sample: "Классика" },
  { name: "Lato", className: "font-lato", sample: "Гармония" },
  { name: "Raleway", className: "font-raleway", sample: "Стиль" },
  { name: "Poppins", className: "font-poppins", sample: "Современно" },
  { name: "Pacifico", className: "font-pacifico", sample: "Креатив" },
];

const presets = [
  { name: "Минимализм", style: { color: "#ffffff", shadowEnabled: false, strokeEnabled: false, backgroundEnabled: false } },
  { name: "Яркий", style: { color: "#ff6b6b", shadowEnabled: true, shadowColor: "#000000", shadowBlur: 8 } },
  { name: "Элегантный", style: { color: "#f8f4e3", shadowEnabled: true, shadowColor: "#1a1a1a", shadowBlur: 4 } },
  { name: "Контраст", style: { color: "#ffffff", strokeEnabled: true, strokeColor: "#000000", strokeWidth: 3 } },
  { name: "Пастель", style: { color: "#ffecd2", backgroundEnabled: true, backgroundColor: "#667eea", backgroundOpacity: 80 } },
];

export const EditorSidebar = ({
  slides,
  activeSlideIndex,
  aspectRatio,
  textStyle,
  fullText,
  onImagesUpload,
  onActiveSlideChange,
  onAspectRatioChange,
  onTextStyleChange,
  onFullTextChange,
  onDistributeText,
  onReorderSlides,
  onDeleteSlide,
  onSlideTextChange,
}: EditorSidebarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sensors for both mouse/touch drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const updateStyle = (updates: Partial<TextStyle>) => {
    onTextStyleChange({ ...textStyle, ...updates });
  };

  return (
    <div className="w-80 border-r bg-card flex flex-col">
      <Tabs defaultValue="images" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4 grid grid-cols-3">
          <TabsTrigger value="images">Фото</TabsTrigger>
          <TabsTrigger value="text">Текст</TabsTrigger>
          <TabsTrigger value="style">Стиль</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          {/* Images Tab */}
          <TabsContent value="images" className="p-4 space-y-4">
            {/* Aspect Ratio */}
            <div className="space-y-2">
              <Label>Формат</Label>
              <div className="flex gap-2">
                <Button
                  variant={aspectRatio === "4:5" ? "default" : "outline"}
                  size="sm"
                  className={aspectRatio === "4:5" ? "bg-gradient-brand" : ""}
                  onClick={() => onAspectRatioChange("4:5")}
                >
                  <RectangleVertical className="w-4 h-4 mr-2" />
                  4:5
                </Button>
                <Button
                  variant={aspectRatio === "1:1" ? "default" : "outline"}
                  size="sm"
                  className={aspectRatio === "1:1" ? "bg-gradient-brand" : ""}
                  onClick={() => onAspectRatioChange("1:1")}
                >
                  <Square className="w-4 h-4 mr-2" />
                  1:1
                </Button>
              </div>
            </div>

            {/* Upload */}
            <div className="space-y-2">
              <Label>Загрузить фотографии ({slides.length}/10)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={slides.length >= 10}
              >
                <Upload className="w-4 h-4 mr-2" />
                Выбрать файлы
              </Button>
            </div>

            {/* Slides List with Drag and Drop */}
            {slides.length > 0 && (
              <div className="space-y-2">
                <Label>Порядок слайдов (перетащите для изменения)</Label>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={slides.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {slides.map((slide, index) => (
                        <SortableSlideItem
                          key={slide.id}
                          slide={slide}
                          index={index}
                          isActive={index === activeSlideIndex}
                          onClick={() => onActiveSlideChange(index)}
                          onDelete={(e) => {
                            e.stopPropagation();
                            onDeleteSlide(slide.id);
                          }}
                          onTextChange={(text) => onSlideTextChange(slide.id, text)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </TabsContent>

          {/* Text Tab */}
          <TabsContent value="text" className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>Весь текст поста</Label>
              <Textarea
                placeholder="Введите или надиктуйте текст для карусели..."
                className="min-h-[120px]"
                value={fullText}
                onChange={(e) => onFullTextChange(e.target.value)}
              />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Mic className="w-4 h-4 mr-2" />
                  Надиктовать
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Улучшить
                </Button>
              </div>
            </div>

            <Button
              variant="default"
              className="w-full bg-gradient-brand hover:opacity-90"
              onClick={onDistributeText}
              disabled={!fullText.trim() || slides.length === 0}
            >
              Распределить по слайдам
            </Button>

            {/* Text fields for ALL slides */}
            {slides.length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <Label className="text-base font-semibold">Текст на слайдах</Label>
                {slides.map((slide, index) => (
                  <div key={slide.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded overflow-hidden bg-muted flex-shrink-0">
                        {slide.image && (
                          <img
                            src={slide.image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <Label className="text-sm text-muted-foreground">
                        Слайд {index + 1}
                      </Label>
                    </div>
                    <Textarea
                      placeholder={`Текст для слайда ${index + 1}...`}
                      className="min-h-[60px] text-sm"
                      value={slide.text}
                      onChange={(e) => onSlideTextChange(slide.id, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Style Tab */}
          <TabsContent value="style" className="p-4 space-y-4">
            {/* Font Selection */}
            <div className="space-y-2">
              <Label>Шрифт</Label>
              <div className="grid grid-cols-2 gap-2">
                {fonts.map((font) => (
                  <button
                    key={font.name}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      textStyle.fontFamily === font.name
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => updateStyle({ fontFamily: font.name })}
                  >
                    <span className={`text-lg ${font.className}`}>
                      {font.sample}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <Label>Готовые стили</Label>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={() => updateStyle(preset.style as Partial<TextStyle>)}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <Label>Размер шрифта: {textStyle.fontSize}px</Label>
              <Slider
                value={[textStyle.fontSize]}
                onValueChange={([value]) => updateStyle({ fontSize: value })}
                min={12}
                max={72}
                step={1}
              />
            </div>

            {/* Text Color */}
            <div className="space-y-2">
              <Label>Цвет текста</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={textStyle.color}
                  onChange={(e) => updateStyle({ color: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={textStyle.color}
                  onChange={(e) => updateStyle({ color: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Shadow */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Тень</Label>
                <Switch
                  checked={textStyle.shadowEnabled}
                  onCheckedChange={(checked) => updateStyle({ shadowEnabled: checked })}
                />
              </div>
              {textStyle.shadowEnabled && (
                <div className="space-y-2 pl-4 border-l-2">
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={textStyle.shadowColor}
                      onChange={(e) => updateStyle({ shadowColor: e.target.value })}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <div className="flex-1">
                      <Label className="text-xs">Размытие: {textStyle.shadowBlur}px</Label>
                      <Slider
                        value={[textStyle.shadowBlur]}
                        onValueChange={([value]) => updateStyle({ shadowBlur: value })}
                        min={0}
                        max={20}
                        step={1}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stroke */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Обводка</Label>
                <Switch
                  checked={textStyle.strokeEnabled}
                  onCheckedChange={(checked) => updateStyle({ strokeEnabled: checked })}
                />
              </div>
              {textStyle.strokeEnabled && (
                <div className="space-y-2 pl-4 border-l-2">
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={textStyle.strokeColor}
                      onChange={(e) => updateStyle({ strokeColor: e.target.value })}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <div className="flex-1">
                      <Label className="text-xs">Толщина: {textStyle.strokeWidth}px</Label>
                      <Slider
                        value={[textStyle.strokeWidth]}
                        onValueChange={([value]) => updateStyle({ strokeWidth: value })}
                        min={1}
                        max={10}
                        step={1}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Background */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Подложка</Label>
                <Switch
                  checked={textStyle.backgroundEnabled}
                  onCheckedChange={(checked) => updateStyle({ backgroundEnabled: checked })}
                />
              </div>
              {textStyle.backgroundEnabled && (
                <div className="space-y-2 pl-4 border-l-2">
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={textStyle.backgroundColor}
                      onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <div className="flex-1 space-y-2">
                      <div>
                        <Label className="text-xs">Прозрачность: {textStyle.backgroundOpacity}%</Label>
                        <Slider
                          value={[textStyle.backgroundOpacity]}
                          onValueChange={([value]) => updateStyle({ backgroundOpacity: value })}
                          min={0}
                          max={100}
                          step={5}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Скругление: {textStyle.backgroundRadius}px</Label>
                        <Slider
                          value={[textStyle.backgroundRadius]}
                          onValueChange={([value]) => updateStyle({ backgroundRadius: value })}
                          min={0}
                          max={24}
                          step={2}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};
