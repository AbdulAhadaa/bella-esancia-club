import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SkincareGallery from "@/components/SkincareGallery";
import NuaClubSection from "@/components/NuaClubSection";
import SimpleProductSection from "@/components/SimpleProductSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <SkincareGallery />
      <NuaClubSection />
      <SimpleProductSection />
      <Footer />
    </div>
  );
};

export default Index;
