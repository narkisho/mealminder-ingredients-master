import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button 
              onClick={() => navigate("/")}
              className="text-2xl font-display font-bold text-primary hover:text-primary/80 transition-colors"
            >
              MealMind
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/login")}
              className="text-sm font-medium"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate("/register")}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};