import { Leaf } from "lucide-react";

export function AnalysisLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="relative w-32 h-32 mb-8">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-muted" />
        
        {/* Spinning ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        
        {/* Pulsing leaf icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <Leaf className="w-8 h-8 text-primary animate-leaf-sway" />
          </div>
        </div>
        
        {/* Scan line effect */}
        <div className="absolute inset-x-4 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full animate-scan-line" />
      </div>

      <h3 className="font-display text-2xl font-bold mb-2">Analyzing Your Plant</h3>
      <p className="text-muted-foreground text-center max-w-sm">
        Our AI is examining the leaf patterns, color variations, and symptoms to identify potential diseases...
      </p>

      <div className="flex gap-2 mt-6">
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}
