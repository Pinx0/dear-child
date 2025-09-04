import BackgroundGradient from '@/components/BackgroundGradient';
import HeroSection from '@/components/HeroSection';
import GitHubButton from '@/components/GitHubButton';
import FeaturesGrid from '@/components/FeaturesGrid';
import { HeartIcon, ImageIcon, ClockIcon } from '@/components/icons/FeatureIcons';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <BackgroundGradient />

      <div className="relative z-10 text-center space-y-12 max-w-4xl mx-auto px-8">
        <HeroSection 
          title="Dear Child"
          subtitle="Memory Time Vault"
          description="A digital time capsule for precious childhood memories"
          tagline="Preserve every moment from birth to 18. When they turn 18, they'll discover a treasure trove of memories from those who love them most."
        />

        <GitHubButton href="https://github.com/Pinx0/dear-child">
          Create your own
        </GitHubButton>

        <FeaturesGrid features={features} />
      </div>
    </div>
  );
}

// Feature definitions moved to bottom for better organization
const features = [
  {
    icon: <HeartIcon />,
    title: "Private & Secure",
    description: "Only whitelisted family members",
    gradientFrom: "from-emerald-500",
    gradientTo: "to-teal-500"
  },
  {
    icon: <ImageIcon />,
    title: "Media Rich",
    description: "Photos, videos & audio",
    gradientFrom: "from-teal-500",
    gradientTo: "to-cyan-500"
  },
  {
    icon: <ClockIcon />,
    title: "Time Capsule",
    description: "Unlock at age 18",
    gradientFrom: "from-cyan-500",
    gradientTo: "to-emerald-500"
  }
];