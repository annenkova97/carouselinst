import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Square, RectangleVertical } from "lucide-react";
import type { TextStyle, AspectRatio } from "@/pages/Editor";

interface MobileStyleSheetProps {
  textStyle: TextStyle;
  aspectRatio: AspectRatio;
  onTextStyleChange: (style: TextStyle) => void;
  onAspectRatioChange: (ratio: AspectRatio) => void;
}

const fonts = [
  { name: "Montserrat", className: "font-montserrat", sample: "Аа" },
  { name: "Playfair Display", className: "font-playfair", sample: "Аа" },
  { name: "Roboto", className: "font-roboto", sample: "Аа" },
  { name: "Open Sans", className: "font-opensans", sample: "Аа" },
  { name: "Oswald", className: "font-oswald", sample: "Аа" },
  { name: "Merriweather", className: "font-merriweather", sample: "Аа" },
  { name: "Lato", className: "font-lato", sample: "Аа" },
  { name: "Raleway", className: "font-raleway", sample: "Аа" },
  { name: "Poppins", className: "font-poppins", sample: "Аа" },
  { name: "Pacifico", className: "font-pacifico", sample: "Аа" },
];

const presets = [
  { name: "Минимализм", style: { color: "#ffffff", shadowEnabled: false, strokeEnabled: false, backgroundEnabled: false } },
  { name: "Яркий", style: { color: "#ff6b6b", shadowEnabled: true, shadowColor: "#000000", shadowBlur: 8 } },
  { name: "Элегантный", style: { color: "#f8f4e3", shadowEnabled: true, shadowColor: "#1a1a1a", shadowBlur: 4 } },
  { name: "Контраст", style: { color: "#ffffff", strokeEnabled: true, strokeColor: "#000000", strokeWidth: 3 } },
  { name: "Пастель", style: { color: "#ffecd2", backgroundEnabled: true, backgroundColor: "#667eea", backgroundOpacity: 80 } },
];

export const MobileStyleSheet = ({
  textStyle,
  aspectRatio,
  onTextStyleChange,
  onAspectRatioChange,
}: MobileStyleSheetProps) => {
  const updateStyle = (updates: Partial<TextStyle>) => {
    onTextStyleChange({ ...textStyle, ...updates });
  };

  return (
    <ScrollArea className="h-[calc(100%-40px)]">
      <div className="space-y-5 pb-8 px-1">
        {/* Aspect Ratio */}
        <div className="space-y-2">
          <Label>Формат</Label>
          <div className="flex gap-2">
            <Button
              variant={aspectRatio === "4:5" ? "default" : "outline"}
              size="sm"
              className={`flex-1 ${aspectRatio === "4:5" ? "bg-gradient-brand" : ""}`}
              onClick={() => onAspectRatioChange("4:5")}
            >
              <RectangleVertical className="w-4 h-4 mr-2" />
              4:5
            </Button>
            <Button
              variant={aspectRatio === "1:1" ? "default" : "outline"}
              size="sm"
              className={`flex-1 ${aspectRatio === "1:1" ? "bg-gradient-brand" : ""}`}
              onClick={() => onAspectRatioChange("1:1")}
            >
              <Square className="w-4 h-4 mr-2" />
              1:1
            </Button>
          </div>
        </div>

        {/* Fonts - Horizontal scroll */}
        <div className="space-y-2">
          <Label>Шрифт</Label>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {fonts.map((font) => (
              <button
                key={font.name}
                className={`flex-shrink-0 w-14 h-14 rounded-lg border flex items-center justify-center transition-colors ${
                  textStyle.fontFamily === font.name
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-muted"
                }`}
                onClick={() => updateStyle({ fontFamily: font.name })}
              >
                <span className={`text-xl ${font.className}`}>{font.sample}</span>
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
          <Label>Размер: {textStyle.fontSize}px</Label>
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
              className="w-14 h-10 p-1 cursor-pointer"
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
            <div className="flex gap-2 items-center pl-2 border-l-2 border-primary/30">
              <Input
                type="color"
                value={textStyle.shadowColor}
                onChange={(e) => updateStyle({ shadowColor: e.target.value })}
                className="w-10 h-10 p-1 cursor-pointer"
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
            <div className="flex gap-2 items-center pl-2 border-l-2 border-primary/30">
              <Input
                type="color"
                value={textStyle.strokeColor}
                onChange={(e) => updateStyle({ strokeColor: e.target.value })}
                className="w-10 h-10 p-1 cursor-pointer"
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
            <div className="space-y-2 pl-2 border-l-2 border-primary/30">
              <div className="flex gap-2 items-center">
                <Input
                  type="color"
                  value={textStyle.backgroundColor}
                  onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                  className="w-10 h-10 p-1 cursor-pointer"
                />
                <div className="flex-1">
                  <Label className="text-xs">Прозрачность: {textStyle.backgroundOpacity}%</Label>
                  <Slider
                    value={[textStyle.backgroundOpacity]}
                    onValueChange={([value]) => updateStyle({ backgroundOpacity: value })}
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>
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
          )}
        </div>
      </div>
    </ScrollArea>
  );
};
