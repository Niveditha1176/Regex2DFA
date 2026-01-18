import { Loader2 } from "lucide-react";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function Loader({ size = "md", text }: LoaderProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div 
      className="flex flex-col items-center justify-center gap-3"
      data-testid="loader-container"
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
        <Loader2 
          className={`${sizeClasses[size]} text-primary animate-spin relative z-10`}
          data-testid="loader-spinner"
        />
      </div>
      {text && (
        <p 
          className="text-sm text-muted-foreground animate-pulse"
          data-testid="loader-text"
        >
          {text}
        </p>
      )}
    </div>
  );
}
