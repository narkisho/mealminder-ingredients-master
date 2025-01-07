import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="hero-text animate-fade-in-up mb-6">
            Transform Your Kitchen <br className="hidden md:block" />
            Into a Culinary Studio
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in">
            Snap a photo of your ingredients, and let AI create personalized recipes 
            that match your dietary preferences and cooking style.
          </p>
          <Button
            onClick={() => navigate("/register")}
            className="bg-primary hover:bg-primary/90 text-white text-lg px-8 py-6 rounded-full animate-fade-in"
          >
            Start Cooking Today
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center mb-12">
            Discover the Magic of MealMind
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-sm card-hover animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-primary mb-4 text-4xl">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="section-title mb-6">
            Ready to Transform Your Cooking?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of home chefs who are already creating amazing meals with MealMind.
          </p>
          <Button
            onClick={() => navigate("/register")}
            className="bg-accent hover:bg-accent/90 text-white text-lg px-8 py-6 rounded-full"
          >
            Get Started Free
          </Button>
        </div>
      </section>
    </div>
  );
};

const features = [
  {
    icon: "📸",
    title: "Snap & Cook",
    description: "Take a photo of your ingredients and let AI suggest perfect recipes tailored to what you have.",
  },
  {
    icon: "🎯",
    title: "Personalized Recipes",
    description: "Get recipes that match your dietary preferences, skill level, and available time.",
  },
  {
    icon: "✨",
    title: "Smart Kitchen",
    description: "Track your pantry, plan meals, and reduce food waste with intelligent suggestions.",
  },
];

export default Index;