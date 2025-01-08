import { Button } from "@/components/ui/button";
import { Download, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GenerateRecipeButtonProps {
  isLoading: boolean;
  onGenerate: () => void;
  onDownload?: () => void;
  disabled?: boolean;
  className?: string;
}

export const GenerateRecipeButton = ({
  isLoading,
  onGenerate,
  onDownload,
  disabled,
  className
}: GenerateRecipeButtonProps) => {
  const handleDownload = () => {
    if (!onDownload) return;
    onDownload();
  };

  return (
    <div className={cn("space-y-3", className)}>
      <Button
        onClick={onGenerate}
        disabled={disabled || isLoading}
        className="w-full max-w-md group relative overflow-hidden transition-all duration-300"
      >
        <span className={cn(
          "inline-flex items-center gap-2 transition-transform duration-500",
          isLoading && "animate-[slide-up_0.5s_ease-out_forwards]"
        )}>
          <Wand2 className={cn(
            "transition-transform duration-300",
            isLoading ? "animate-spin" : "group-hover:rotate-12"
          )} />
          {isLoading ? "Generating Recipe..." : "Generate Recipe"}
        </span>
      </Button>

      {onDownload && (
        <Button
          variant="outline"
          onClick={handleDownload}
          className="w-full max-w-md group"
          disabled={disabled || isLoading}
        >
          <Download className="mr-2 h-4 w-4 group-hover:-translate-y-1 transition-transform duration-300" />
          Download Recipe
        </Button>
      )}
    </div>
  );
};