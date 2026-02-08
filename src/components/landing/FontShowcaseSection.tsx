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

export const FontShowcaseSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            10 красивых шрифтов
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Подберите идеальный шрифт для вашего стиля. Все шрифты поддерживают русский язык.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-5xl mx-auto">
          {fonts.map((font, index) => (
            <div
              key={font.name}
              className="group relative bg-card rounded-xl border p-6 hover:border-primary/50 hover:shadow-glow transition-all cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Font sample */}
              <div className={`text-2xl md:text-3xl font-semibold text-center mb-3 ${font.className}`}>
                {font.sample}
              </div>
              
              {/* Font name on hover */}
              <div className="absolute inset-0 flex items-center justify-center bg-primary/95 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-primary-foreground font-medium text-sm">
                  {font.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
