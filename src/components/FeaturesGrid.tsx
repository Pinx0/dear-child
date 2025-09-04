interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
}

interface FeaturesGridProps {
  features: Feature[];
}

export default function FeaturesGrid({ features }: FeaturesGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 max-w-3xl mx-auto">
      {features.map((feature, index) => (
        <div key={index} className="text-center space-y-2">
          <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradientFrom} ${feature.gradientTo} rounded-full mx-auto flex items-center justify-center`}>
            {feature.icon}
          </div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 font-display">{feature.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-body">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}
