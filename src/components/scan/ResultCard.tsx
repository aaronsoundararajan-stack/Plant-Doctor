import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Info, Leaf, Beaker, Shield, Sprout } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface ScanResult {
  disease_name: string;
  confidence: number;
  severity: "healthy" | "mild" | "moderate" | "severe";
  description: string;
  symptoms: string;
  causes: string;
  organic_treatments: string;
  chemical_treatments: string;
  prevention_tips: string;
  plant_type?: string;
  is_simulated?: boolean;
}

interface ResultCardProps {
  result: ScanResult;
  imageUrl: string;
}

const severityConfig = {
  healthy: {
    label: "Healthy",
    icon: CheckCircle,
    color: "healthy" as const,
    message: "Great news! Your plant appears healthy.",
  },
  mild: {
    label: "Mild",
    icon: Info,
    color: "mild" as const,
    message: "Early signs detected. Easy to treat with proper care.",
  },
  moderate: {
    label: "Moderate",
    icon: AlertTriangle,
    color: "moderate" as const,
    message: "Treatment recommended soon to prevent spread.",
  },
  severe: {
    label: "Severe",
    icon: AlertTriangle,
    color: "severe" as const,
    message: "Immediate action required to save the plant.",
  },
};

export function ResultCard({ result, imageUrl }: ResultCardProps) {
  const severity = severityConfig[result.severity];
  const SeverityIcon = severity.icon;

  const getConfidenceSeverity = (confidence: number) => {
    if (confidence >= 80) return "healthy";
    if (confidence >= 60) return "mild";
    if (confidence >= 40) return "moderate";
    return "severe";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Result Card */}
      <Card className="overflow-hidden shadow-lg border-0">
        <div className="relative">
          <img
            src={imageUrl}
            alt="Scanned plant"
            className="w-full h-48 md:h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <Badge variant={severity.color} className="mb-2">
              <SeverityIcon className="w-3 h-3 mr-1" />
              {severity.label}
            </Badge>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
              {result.disease_name}
            </h2>
            {result.plant_type && (
              <p className="text-white/80 flex items-center gap-1 mt-1">
                <Sprout className="w-4 h-4" />
                {result.plant_type}
              </p>
            )}
          </div>
        </div>

        <CardContent className="p-6">
          {/* Confidence Score */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Detection Confidence
              </span>
              <span className="text-lg font-bold text-foreground">
                {result.confidence}%
              </span>
            </div>
            <Progress 
              value={result.confidence} 
              severity={getConfidenceSeverity(result.confidence)}
              size="lg"
            />
          </div>

          {/* Severity Message */}
          <div className={`p-4 rounded-xl ${
            result.severity === "healthy" ? "bg-green-50 dark:bg-green-900/20" :
            result.severity === "mild" ? "bg-yellow-50 dark:bg-yellow-900/20" :
            result.severity === "moderate" ? "bg-orange-50 dark:bg-orange-900/20" :
            "bg-red-50 dark:bg-red-900/20"
          }`}>
            <p className="flex items-center gap-2 font-medium">
              <SeverityIcon className={`w-5 h-5 ${
                result.severity === "healthy" ? "text-green-600" :
                result.severity === "mild" ? "text-yellow-600" :
                result.severity === "moderate" ? "text-orange-600" :
                "text-red-600"
              }`} />
              {severity.message}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Details Tabs */}
      <Card className="shadow-lg border-0">
        <Tabs defaultValue="about" className="w-full">
          <CardHeader className="pb-0">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="about" className="gap-2">
                <Info className="w-4 h-4" />
                <span className="hidden sm:inline">About</span>
              </TabsTrigger>
              <TabsTrigger value="treatment" className="gap-2">
                <Beaker className="w-4 h-4" />
                <span className="hidden sm:inline">Treatment</span>
              </TabsTrigger>
              <TabsTrigger value="prevention" className="gap-2">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Prevention</span>
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="pt-6">
            <TabsContent value="about" className="mt-0 space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-primary" />
                  Description
                </h4>
                <p className="text-muted-foreground">{result.description}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Symptoms</h4>
                <p className="text-muted-foreground">{result.symptoms}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Causes</h4>
                <p className="text-muted-foreground">{result.causes}</p>
              </div>
            </TabsContent>

            <TabsContent value="treatment" className="mt-0 space-y-4">
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-400">
                  <Leaf className="w-4 h-4" />
                  Organic Treatments
                </h4>
                <p className="text-green-700 dark:text-green-300">{result.organic_treatments}</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <Beaker className="w-4 h-4" />
                  Chemical Treatments
                </h4>
                <p className="text-blue-700 dark:text-blue-300">{result.chemical_treatments}</p>
              </div>
            </TabsContent>

            <TabsContent value="prevention" className="mt-0">
              <div className="p-4 rounded-xl bg-primary/5">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Prevention Tips
                </h4>
                <p className="text-muted-foreground">{result.prevention_tips}</p>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
