interface HeroSectionProps {
  title: string;
  subtitle: string;
  description: string;
  tagline: string;
}

export default function HeroSection({ title, subtitle, description, tagline }: HeroSectionProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-7xl md:text-9xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent leading-none tracking-tight font-handwritten">
        {title}
      </h1>
      <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto rounded-full"></div>
      <p className="text-2xl md:text-3xl text-gray-700 dark:text-gray-200 font-light tracking-wide font-display">
        {subtitle}
      </p>
      <div className="space-y-4 max-w-2xl mx-auto">
        <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-light font-body">
          {description}
        </p>
        <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed font-body">
          {tagline}
        </p>
      </div>
    </div>
  );
}

