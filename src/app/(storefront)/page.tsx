import HeroSection from '@/components/storefront/HeroSection';
import SpeciesGrid from '@/components/storefront/SpeciesGrid';
import TherapeuticPills from '@/components/storefront/TherapeuticPills';

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <SpeciesGrid />
      <TherapeuticPills />
    </div>
  );
}
