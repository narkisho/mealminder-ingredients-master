import React from 'react';
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import html2pdf from 'html2pdf.js';

interface FormattedRecipeProps {
  recipe: string;
}

export const FormattedRecipe = ({ recipe }: FormattedRecipeProps) => {
  const handlePrint = () => {
    const element = document.getElementById('recipe-content');
    const opt = {
      margin: 1,
      filename: 'my-recipe.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    if (element) {
      html2pdf().set(opt).from(element).save();
    }
  };

  // Split the recipe into sections based on common headers
  const formatRecipe = (text: string) => {
    const sections = text.split(/\n(?=[A-Z][A-Za-z\s]+:)/);
    return sections.map((section, index) => {
      const [header, ...content] = section.split(':');
      if (content.length === 0) return <p key={index} className="mb-4">{header}</p>;
      
      return (
        <div key={index} className="mb-6">
          <h3 className="text-xl font-display font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {header.trim()}:
          </h3>
          <div className="pl-4 border-l-2 border-primary/30">
            {content.join(':').split('\n').map((line, i) => (
              <p key={i} className="mb-2 text-gray-700">
                {line.trim()}
              </p>
            ))}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div 
        id="recipe-content"
        className="prose prose-lg max-w-none bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg"
      >
        <h2 className="text-2xl font-display font-bold mb-6 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Your Generated Recipe
        </h2>
        {formatRecipe(recipe)}
      </div>
      
      <Button
        onClick={handlePrint}
        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all duration-300"
      >
        <Printer className="h-4 w-4" />
        Save as PDF
      </Button>
    </div>
  );
};