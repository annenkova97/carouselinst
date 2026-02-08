import { Upload, Type, Wand2, Download, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Загрузите фотографии",
    description: "Добавьте до 10 фотографий в любом порядке. Перетаскивайте для сортировки.",
  },
  {
    icon: Type,
    title: "Введите или надиктуйте текст",
    description: "Напишите текст или используйте голосовой ввод. AI разобьёт его по слайдам.",
  },
  {
    icon: Wand2,
    title: "Настройте стиль",
    description: "Выберите шрифт, цвета, тени. Или используйте готовый пресет.",
  },
  {
    icon: Download,
    title: "Скачайте карусель",
    description: "Экспортируйте все слайды одним ZIP-архивом или по отдельности.",
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Как это работает
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Четыре простых шага от загрузки фотографий до готовой карусели
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={step.title}
              className="relative group"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
              )}
              
              <div className="relative bg-card rounded-2xl p-6 border shadow-soft hover:shadow-glow transition-shadow">
                {/* Step number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-sm font-bold shadow-glow">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>

                {/* Content */}
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="flex flex-wrap justify-center gap-6 mt-12">
          {[
            "Без водяных знаков",
            "Работает на мобильных",
            "Сохранение проектов",
            "Русский интерфейс",
          ].map((benefit) => (
            <div key={benefit} className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
