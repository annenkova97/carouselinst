import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-brand opacity-10" />
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Готовы создать свою первую карусель?
          </h2>

          <p className="text-lg text-muted-foreground mb-8">
            Начните прямо сейчас — это бесплатно. Загрузите фотографии 
            и создайте профессиональную карусель за минуту.
          </p>

          <Button 
            size="lg" 
            className="bg-gradient-brand hover:opacity-90 transition-opacity shadow-glow text-lg px-8"
            asChild
          >
            <Link to="/editor">
              Создать карусель
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
