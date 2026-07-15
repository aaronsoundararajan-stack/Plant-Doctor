import { useCallback, useState, useRef } from "react";
import { Camera, Upload, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
  onClear: () => void;
  disabled?: boolean;
}

export function ImageUploader({ onImageSelect, selectedImage, onClear, disabled }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }
    
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onImageSelect(file);
  }, [onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onClear();
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  if (selectedImage && previewUrl) {
    return (
      <div className="relative rounded-2xl overflow-hidden bg-muted animate-scale-in">
        <img
          src={previewUrl}
          alt="Selected plant"
          className="w-full h-64 md:h-80 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-4 right-4 rounded-full"
          onClick={handleClear}
          disabled={disabled}
        >
          <X className="w-4 h-4" />
        </Button>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-white font-medium truncate">{selectedImage.name}</p>
          <p className="text-white/70 text-sm">
            {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-2xl p-8 md:p-12 transition-all duration-200",
        isDragging
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-border hover:border-primary/50 hover:bg-muted/50",
        disabled && "opacity-50 pointer-events-none"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
          <ImageIcon className="w-10 h-10 text-primary" />
        </div>
        
        <div className="text-center">
          <h3 className="font-display text-xl font-semibold mb-2">
            Upload a leaf photo
          </h3>
          <p className="text-muted-foreground max-w-sm">
            Drag and drop an image, or use the buttons below to upload or take a photo
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="hero"
            size="lg"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            <Upload className="w-4 h-4" />
            Upload Image
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => cameraInputRef.current?.click()}
            disabled={disabled}
          >
            <Camera className="w-4 h-4" />
            Take Photo
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Supported: JPG, PNG, WebP • Max 10MB
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
