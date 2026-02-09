import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mic, Palette, Download, Zap, Type } from "lucide-react";
import { memo } from "react";

export const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Heading */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Создавайте{" "}
            <span className="text-gradient-brand">красивые карусели</span>
            {" "}для Instagram
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
            Загрузите фотографии, надиктуйте текст голосом, настройте стиль 
            и скачайте готовую карусель. Готово за минуту!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in">
            <Button 
              size="lg" 
              className="bg-gradient-brand hover:opacity-90 transition-opacity shadow-glow text-lg px-8"
              asChild
            >
              <Link to="/editor">
                Создать карусель бесплатно
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Features preview */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <FeatureCard icon={Mic} title="Голосовой ввод" />
            <FeatureCard icon={Type} title="10 шрифтов" />
            <FeatureCard icon={Palette} title="Настройка стиля" />
            <FeatureCard icon={Download} title="Экспорт в ZIP" />
            <FeatureCard icon={Zap} title="Готово за минуту" />
          </div>
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}

const FeatureCard = memo(({ icon: Icon, title }: FeatureCardProps) => {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border shadow-soft">
      <div className="w-10 h-10 rounded-lg bg-gradient-brand flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-sm font-medium text-foreground">{title}</span>
    </div>
  );
});

FeatureCard.displayName = "FeatureCard";
