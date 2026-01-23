import { About } from "./components/About";
import { Activities } from "./components/Activities";
import { Contact } from "./components/Contacts";
import { Footer } from "./components/Footer";
import { Gallery } from "./components/Gallery";
import { Hero } from "./components/Hero";
import { Navbar } from "./components/Navbar";
import { News } from "./components/News";


const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <About />
      <Activities />
      <Gallery />
      <News />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;