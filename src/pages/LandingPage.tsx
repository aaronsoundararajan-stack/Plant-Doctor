import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Leaf, 
  Camera, 
  History, 
  Shield, 
  Zap, 
  Smartphone,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const features = [
  {
    icon: Camera,
    title: "Instant Scanning",
    description: "Upload or capture a photo of any plant leaf and get instant AI-powered analysis.",
  },
  {
    icon: Zap,
    title: "AI Detection",
    description: "Advanced machine learning identifies diseases with high accuracy and confidence scores.",
  },
  {
    icon: Shield,
    title: "Treatment Guidance",
    description: "Get organic and chemical treatment options plus prevention tips for each disease.",
  },
  {
    icon: History,
    title: "Crop History",
    description: "Track your plant health over time with a complete history of all your scans.",
  },
  {
    icon: Smartphone,
    title: "Mobile Ready",
    description: "Works perfectly on any device - scan plants directly from your phone in the field.",
  },
  {
    icon: Leaf,
    title: "Extensive Database",
    description: "Covers major crop diseases with detailed information on symptoms and causes.",
  },
];

const steps = [
  {
    step: "01",
    title: "Capture",
    description: "Take a photo of the affected plant leaf or upload an existing image.",
  },
  {
    step: "02",
    title: "Analyze",
    description: "Our AI examines the image for disease patterns, color changes, and symptoms.",
  },
  {
    step: "03",
    title: "Diagnose",
    description: "Get instant results with disease name, severity level, and confidence score.",
  },
  {
    step: "04",
    title: "Treat",
    description: "Follow recommended treatments and prevention tips to save your plants.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-16">
        <div 
          className="absolute inset-0 z-0 bg-gradient-to-r from-green-50 via-green-50/95 to-green-100"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
        </div>

        <div className="container relative z-10 mx-auto px-4 py-12 md:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
              <Leaf className="w-4 h-4" />
              AI-Powered Plant Health
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in">
              Protect Your Crops with{" "}
              <span className="text-gradient">Instant Disease Detection</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: "100ms" }}>
              Upload a photo of any plant leaf and get instant AI analysis. 
              Identify diseases, understand symptoms, and get treatment recommendations 
              to save your crops.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "200ms" }}>
              <Button 
                variant="hero" 
                size="xl" 
                onClick={() => navigate("/scan")}
                className="group"
              >
                Start Scanning
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="xl"
                onClick={() => navigate("/auth")}
              >
                Create Account
              </Button>
            </div>

            <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "300ms" }}>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                Free to use
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                No app required
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                Works online
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get plant disease diagnosis in four simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((item, index) => (
              <div 
                key={item.step}
                className="relative p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <span className="text-6xl font-bold text-primary/10 absolute top-4 right-4">
                  {item.step}
                </span>
                <div className="relative">
                  <h3 className="font-display text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful features to help you monitor and protect your plants
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card 
                key={feature.title}
                className="group hover:shadow-lg transition-all hover:-translate-y-1 border-0 bg-gradient-to-br from-card to-muted/30"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <Leaf className="w-12 h-12 text-primary-foreground/80 mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Protect Your Plants?
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Join thousands of farmers and gardeners who use PlantGuard to keep their crops healthy.
          </p>
          <Button 
            variant="glass" 
            size="xl" 
            onClick={() => navigate("/scan")}
            className="group"
          >
            Start Free Scan
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
