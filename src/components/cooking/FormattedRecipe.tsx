import React from 'react';
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import html2pdf from 'html2pdf.js';

interface FormattedRecipeProps {
  recipe: string;
  image?: string | null;
}

export const FormattedRecipe = ({ recipe, image }: FormattedRecipeProps) => {
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

  // Split the recipe into sections based on common headers and format them
  const formatRecipe = (text: string) => {
    const sections = text.split(/\n(?=\d+\.|[A-Za-z]+:|\*\*[^*]+:\*\*|\*\*[^*]+\*\*(?!\:))/);
    
    return sections.map((section, index) => {
      // Handle confidence scores and ingredient lists
      if (section.includes("(Confidence:")) {
        const [ingredient, confidence] = section.split("(Confidence:");
        return (
          <li key={index} className="mb-3 text-gray-700 list-none">
            <span className="font-semibold">{ingredient.replace(/\*/g, '').trim()}</span>
            <span className="text-gray-500 text-sm"> (Confidence: {confidence.replace(/[*)\n]/g, '').trim()})</span>
          </li>
        );
      }
      
      // Handle section headers
      if (section.startsWith("**")) {
        const [header, ...content] = section.split("\n");
        const headerText = header.replace(/\*\*/g, '').trim();
        
        return (
          <div key={index} className="mb-8">
            <h3 className="text-xl font-display font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent border-b-2 border-primary/20 pb-2">
              {headerText}
            </h3>
            <div className="pl-4 space-y-3">
              {content.map((line, i) => {
                // Handle bullet points
                if (line.trim().startsWith("•")) {
                  return (
                    <li key={i} className="list-none ml-4 text-gray-700">
                      {line.trim()}
                    </li>
                  );
                }
                // Handle numbered instructions
                if (line.trim().match(/^\d+\./)) {
                  return (
                    <div key={i} className="flex gap-2 text-gray-700">
                      <span className="font-semibold min-w-[24px]">{line.match(/^\d+/)[0]}.</span>
                      <p>{line.replace(/^\d+\.\s*/, "").trim()}</p>
                    </div>
                  );
                }
                // Handle key-value pairs (like "Yields:", "Prep time:")
                if (line.includes(":")) {
                  const [key, value] = line.split(":");
                  return (
                    <p key={i} className="text-gray-700">
                      <span className="font-semibold">{key.trim()}:</span>
                      <span>{value.trim()}</span>
                    </p>
                  );
                }
                // Regular text
                if (line.trim()) {
                  return (
                    <p key={i} className="text-gray-700">
                      {line.trim()}
                    </p>
                  );
                }
                return null;
              })}
            </div>
          </div>
        );
      }
      
      // Return regular text if no special formatting needed
      return section.trim() && (
        <p key={index} className="mb-4 text-gray-700">
          {section.trim()}
        </p>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div 
        id="recipe-content"
        className="prose prose-lg max-w-none bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg"
      >
        <h2 className="text-3xl font-display font-bold mb-8 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent border-b-2 border-primary/20 pb-4">
          Your Generated Recipe
        </h2>
        
        {image && (
          <div className="mb-8">
            <img
              src={image}
              alt="Recipe ingredients"
              className="max-h-64 mx-auto rounded-lg shadow-md"
            />
          </div>
        )}

        <div className="space-y-6">
          {formatRecipe(recipe)}
        </div>
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