import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Mic, Move, Palette, Download, Zap } from "lucide-react";

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
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>Новый AI-ассистент для улучшения текста</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Создавайте{" "}
            <span className="text-gradient-brand">красивые карусели</span>
            {" "}для Instagram
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
            Загрузите фотографии, надиктуйте текст голосом, и наш AI разместит его так, 
            чтобы не перекрывать важные детали. Готово за минуту!
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
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <Link to="/templates">
                Посмотреть шаблоны
              </Link>
            </Button>
          </div>

          {/* Features preview */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <FeatureCard icon={Mic} title="Голосовой ввод" delay="0ms" />
            <FeatureCard icon={Move} title="Умное размещение" delay="100ms" />
            <FeatureCard icon={Palette} title="10 шрифтов" delay="200ms" />
            <FeatureCard icon={Sparkles} title="AI-улучшение" delay="300ms" />
            <FeatureCard icon={Download} title="Экспорт в ZIP" delay="400ms" />
            <FeatureCard icon={Zap} title="Готово за минуту" delay="500ms" />
          </div>
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  delay: string;
}

const FeatureCard = ({ icon: Icon, title, delay }: FeatureCardProps) => {
  return (
    <div 
      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border shadow-soft animate-fade-in"
      style={{ animationDelay: delay }}
    >
      <div className="w-10 h-10 rounded-lg bg-gradient-brand flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-sm font-medium text-foreground">{title}</span>
    </div>
  );
};
