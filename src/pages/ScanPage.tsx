import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ImageUploader } from "@/components/scan/ImageUploader";
import { AnalysisLoader } from "@/components/scan/AnalysisLoader";
import { ResultCard, ScanResult } from "@/components/scan/ResultCard";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  Save, 
  RotateCcw, 
  MapPin,
  Sprout,
  AlertCircle,
  WifiOff
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type ScanState = "upload" | "analyzing" | "result" | "error";

const getMockResult = (type: string): ScanResult => {
  const normalizedType = type.toLowerCase().trim();
  
  if (normalizedType.includes("tomato")) {
    return {
      disease_name: "Early Blight (Alternaria solani)",
      confidence: 89,
      severity: "moderate",
      description: "Early blight is a common tomato disease caused by the fungus Alternaria solani. It can affect almost all parts of the tomato plants, including the leaves, stems, and fruits.",
      symptoms: "Dark, concentric spots resembling targets on older leaves first. Infected leaves often turn yellow and drop off, exposing fruit to sunscald.",
      causes: "High humidity, overhead watering, wet foliage, and warm temperatures (24-29°C) favor spore dispersal and infection.",
      organic_treatments: "Prune lower leaves to improve air circulation. Apply copper-based organic fungicides or neem oil weekly. Apply thick mulch around the base of the plant to prevent soil-borne spores from splashing onto foliage.",
      chemical_treatments: "Apply preventative chemical fungicides containing chlorothalonil, mancozeb, or copper octanoate at the first sign of symptoms.",
      prevention_tips: "Practice crop rotation (avoid planting solanaceous crops in the same spot for 3 years). Water at the soil level using drip irrigation rather than overhead sprinklers. Space plants at least 2-3 feet apart.",
      plant_type: "Tomato",
      is_simulated: true
    };
  }

  if (normalizedType.includes("rose")) {
    return {
      disease_name: "Black Spot (Diplocarpon rosae)",
      confidence: 94,
      severity: "mild",
      description: "Black spot is the most common and serious fungal disease of roses, causing severe defoliation that weakens the plant.",
      symptoms: "Circular black spots with feathery margins on the upper leaf surfaces, surrounded by yellow tissue. Affected leaves drop prematurely.",
      causes: "Spores overwinter in fallen leaves and infected twigs. Warm, humid, and wet leaf conditions are necessary for infection to spread.",
      organic_treatments: "Rake and dispose of all fallen leaves. Spray foliage with a baking soda mixture (1 tbsp baking soda + 1 tsp horticultural oil in 1 gallon of water) or sulfur-based sprays.",
      chemical_treatments: "Use system fungicides containing tebuconazole, triticonazole, or triforine at 7-14 day intervals.",
      prevention_tips: "Plant in full sun (6+ hours/day). Water roses early in the morning at the soil level. Prune canes in late winter to keep the center of the bush open for airflow.",
      plant_type: "Rose",
      is_simulated: true
    };
  }

  if (normalizedType.includes("corn") || normalizedType.includes("maize")) {
    return {
      disease_name: "Common Rust (Puccinia sorghi)",
      confidence: 85,
      severity: "moderate",
      description: "Common rust is a fungal disease of corn leaves that is common in temperate and subtropical regions under cool, moist conditions.",
      symptoms: "Elongated golden-brown to cinnamon-brown pustules on both upper and lower leaf surfaces. Pustules rupture, releasing powdery rust-colored spores.",
      causes: "Rust spores are carried by wind from southern overwintering regions. Cool temperatures (16-23°C) and high relative humidity trigger germination.",
      organic_treatments: "Remove crop debris at the end of the season. No highly effective organic sprays exist for field-scale rust, but sulfur dusts can help garden sweet corn.",
      chemical_treatments: "For commercial sweet corn or high-infection hybrid seed fields, apply fungicides such as pyraclostrobin or azoxystrobin early in the disease cycle.",
      prevention_tips: "Plant rust-resistant corn hybrids. Plant early in the season to avoid late-summer peak spore counts. Rotate crops to non-grass species.",
      plant_type: "Corn/Maize",
      is_simulated: true
    };
  }

  if (normalizedType.includes("potato")) {
    return {
      disease_name: "Late Blight (Phytophthora infestans)",
      confidence: 91,
      severity: "severe",
      description: "Late blight is a destructive fungal-like disease that causes rapid decay of potato foliage and tubers. This pathogen was responsible for the historic Irish Potato Famine.",
      symptoms: "Dark, water-soaked lesions on leaves that expand rapidly. In humid weather, a white fuzzy mold develops on the underside of the leaves. Tubers show dry, reddish-brown rot.",
      causes: "Wet conditions with moderate temperatures (15-21°C) and persistent high humidity. The pathogen spread rapidly via wind-borne sporangia.",
      organic_treatments: "Destroy all infected plants immediately. Apply copper-based organic sprays protectively. Avoid planting seed potatoes from infected crops.",
      chemical_treatments: "Apply protective fungicides containing chlorothalonil, fluazinam, or cyazofamid before infection is observed or when blight warnings are active.",
      prevention_tips: "Buy certified disease-free seed potatoes. Hill soil over tubers to protect them from spores washed from leaves. Practice strict sanitation and remove cull piles.",
      plant_type: "Potato",
      is_simulated: true
    };
  }

  // Fallback for general or unknown plant type
  return {
    disease_name: "Powdery Mildew (Erysiphaceae family)",
    confidence: 92,
    severity: "mild",
    description: "Powdery mildew is a widespread fungal disease affecting a vast range of plants. It is easily recognized and rarely fatal, but can severely stunt growth and reduce yields.",
    symptoms: "White or gray powdery spots or patches covering leaf surfaces, stems, and fruits. Leaves may curl, turn yellow, and wither.",
    causes: "High humidity at night followed by warm, dry daytime conditions. Crowded plantings, shade, and poor airflow create ideal environments.",
    organic_treatments: "Spray leaves with neem oil, horticultural oil, or potassium bicarbonate solutions. Alternatively, spray a diluted milk-water mixture (1:9) in bright sunlight.",
    chemical_treatments: "Apply synthetic fungicides containing myclobutanil, triadimefon, or propiconazole according to instructions.",
    prevention_tips: "Choose resistant plant cultivars. Place plants in full sun and space them adequately. Avoid overhead watering, and prune to open up dense plant canopies.",
    plant_type: type || "General Leaf",
    is_simulated: true
  };
};

export default function ScanPage() {
  const [state, setState] = useState<ScanState>("upload");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [plantType, setPlantType] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleImageSelect = useCallback((file: File) => {
    setSelectedImage(file);
    setImageUrl(URL.createObjectURL(file));
  }, []);

  const handleClear = useCallback(() => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setSelectedImage(null);
    setImageUrl("");
    setState("upload");
    setResult(null);
  }, [imageUrl]);

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setState("analyzing");
    setErrorMessage("");

    try {
      // Convert image to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Extract base64 data after the comma
          const base64Data = result.split(",")[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(selectedImage);
      const base64Image = await base64Promise;

      // Call the edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-plant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            image: base64Image,
            plantType: plantType || undefined,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Analysis failed");
      }

      const data = await response.json();
      setResult(data);
      setState("result");
    } catch (error) {
      console.error("Analysis error:", error);
      console.warn("Attempting local mock analysis fallback...");
      
      toast({
        title: "Analysis Service Notice",
        description: "Remote AI is currently unavailable. Switched to offline simulation mode.",
        variant: "default",
      });

      // Introduce a slight delay to feel like it's analyzing
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockResult = getMockResult(plantType);
      setResult(mockResult);
      setState("result");
    }
  };

  const handleSaveScan = async () => {
    if (!user || !result || !selectedImage) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to save scans.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      // Upload image to storage
      const fileName = `${user.id}/${Date.now()}-${selectedImage.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("scan-images")
        .upload(fileName, selectedImage);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("scan-images")
        .getPublicUrl(fileName);

      // Find disease ID if exists
      const { data: diseaseData } = await supabase
        .from("diseases")
        .select("id")
        .eq("name", result.disease_name)
        .maybeSingle();

      // Save scan to database
      const { error: insertError } = await supabase.from("scans").insert({
        user_id: user.id,
        image_url: urlData.publicUrl,
        plant_type: plantType || result.plant_type || null,
        disease_name: result.disease_name,
        disease_id: diseaseData?.id || null,
        confidence: result.confidence,
        severity: result.severity,
        notes: notes || null,
        location: location || null,
      });

      if (insertError) throw insertError;

      toast({
        title: "Scan saved!",
        description: "Your scan has been saved to your history.",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Failed to save",
        description: "There was an error saving your scan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRetry = () => {
    setState("upload");
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-20 pb-12">
        <div className="container max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              Scan Your Plant
            </h1>
            <p className="text-muted-foreground mt-2">
              Upload a photo to identify diseases and get treatment recommendations
            </p>
          </div>

          {/* Upload State */}
          {state === "upload" && (
            <div className="space-y-6 animate-fade-in">
              <ImageUploader
                onImageSelect={handleImageSelect}
                selectedImage={selectedImage}
                onClear={handleClear}
              />

              {selectedImage && (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <Label htmlFor="plantType" className="flex items-center gap-2">
                        <Sprout className="w-4 h-4 text-primary" />
                        Plant Type (optional)
                      </Label>
                      <Input
                        id="plantType"
                        placeholder="e.g., Tomato, Rose, Corn..."
                        value={plantType}
                        onChange={(e) => setPlantType(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location" className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        Location (optional)
                      </Label>
                      <Input
                        id="location"
                        placeholder="e.g., Garden, Greenhouse, Field A..."
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full"
                      onClick={analyzeImage}
                    >
                      Analyze Plant
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Analyzing State */}
          {state === "analyzing" && <AnalysisLoader />}

          {/* Error State */}
          {state === "error" && (
            <Card className="border-destructive/50 animate-fade-in">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  {errorMessage.includes("network") || errorMessage.includes("offline") ? (
                    <WifiOff className="w-8 h-8 text-destructive" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-destructive" />
                  )}
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">
                  Analysis Failed
                </h3>
                <p className="text-muted-foreground mb-6">
                  {errorMessage || "Something went wrong. Please try again."}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={handleClear}>
                    Upload Different Image
                  </Button>
                  <Button variant="hero" onClick={handleRetry}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Result State */}
          {state === "result" && result && (
            <div className="space-y-6">
              {result.is_simulated && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/30 rounded-xl text-sm flex gap-3 items-start animate-fade-in shadow-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <span className="font-bold">Offline Preview Mode:</span> The remote plant analysis service is currently not configured or returned an error (e.g. invalid API keys). A high-fidelity offline mock result was generated for demonstration.
                  </div>
                </div>
              )}
              <ResultCard result={result} imageUrl={imageUrl} />

              {/* Save Options */}
              {user && (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-semibold">Save to History</h3>
                    <div>
                      <Label htmlFor="notes">Notes (optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any notes about this scan..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mt-2"
                        rows={3}
                      />
                    </div>
                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full"
                      onClick={handleSaveScan}
                      disabled={saving}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "Saving..." : "Save Scan"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {!user && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground mb-4">
                      Sign in to save this scan to your history
                    </p>
                    <Button variant="hero" onClick={() => navigate("/auth")}>
                      Sign In to Save
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={handleClear}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Scan Another Plant
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
