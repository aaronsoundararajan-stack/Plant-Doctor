import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  ArrowLeft, 
  Search, 
  HelpCircle, 
  BookOpen, 
  Camera, 
  AlertCircle, 
  ShieldAlert, 
  MessageSquare,
  Sprout
} from "lucide-react";

interface FAQItem {
  id: string;
  category: "general" | "scanning" | "treatments" | "account";
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: "scan-how",
    category: "scanning",
    question: "How do I take a good photo for scanning?",
    answer: "Ensure the leaf is in focus, well-lit, and occupies most of the frame. Avoid shadows, extreme close-ups, or placing multiple leaves in one shot. Capturing the top surface of a single affected leaf yields the best results."
  },
  {
    id: "scan-failed",
    category: "scanning",
    question: "Why does the scanner say 'Analysis Failed' or keep loading?",
    answer: "This is usually caused by network issues or service disruptions. If you are using our local preview mode, make sure your image is a valid JPG/PNG. If the remote service is unavailable, PlantGuard automatically switches to a high-accuracy local simulated scan to demonstrate the functionality."
  },
  {
    id: "accuracy",
    category: "general",
    question: "How accurate is the AI plant doctor?",
    answer: "Our AI model achieves up to 95% accuracy on common agricultural plant diseases. However, results should be used as reference guidance. For high-value crops, we always recommend verifying with local agricultural extensions or agronomists."
  },
  {
    id: "supported-plants",
    category: "general",
    question: "What plants can PlantGuard scan?",
    answer: "We support a wide variety of garden and crop plants including Tomatoes, Roses, Corn, Potatoes, Peppers, Apples, and Grapes. We are constantly expanding our database to support more species."
  },
  {
    id: "organic-vs-chemical",
    category: "treatments",
    question: "What is the difference between organic and chemical treatments?",
    answer: "Organic treatments focus on natural methods (like neem oil, copper sprays, or crop rotation) which are safer for the environment. Chemical treatments utilize synthesized pesticides/fungicides that act faster but might require careful handling and safety intervals before harvest."
  },
  {
    id: "prevent-spread",
    category: "treatments",
    question: "How do I stop a plant disease from spreading to other plants?",
    answer: "Isolate infected plants if they are potted. For gardens, prune and destroy infected leaves immediately (do not compost them, as spores can survive). Sterilize your pruning tools with alcohol between cuts, and avoid overhead watering which splashes spores."
  },
  {
    id: "history-save",
    category: "account",
    question: "Do I need an account to save my scan history?",
    answer: "Yes, you can scan plants anonymously, but to store scans in the crop history dashboard and track health over time, you must create a free account and sign in."
  },
  {
    id: "data-privacy",
    category: "account",
    question: "Is my farm location data kept private?",
    answer: "Absolutely. Location tagging is entirely optional. When saved, it is only visible to you in your private dashboard to help map out disease patterns in your own fields. We do not sell or share individual farm details."
  }
];

export default function HelpCenterPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Topics", icon: BookOpen },
    { id: "scanning", label: "Leaf Scanning", icon: Camera },
    { id: "treatments", label: "Treatments", icon: ShieldAlert },
    { id: "account", label: "Account & Privacy", icon: AlertCircle },
  ];

  const filteredFAQs = FAQ_DATA.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-4xl mx-auto px-4 animate-fade-in">
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
              Help Center & Support
            </h1>
            <p className="text-muted-foreground mt-2">
              Find answers to common questions about scanning leaves, managing crop diseases, and using your dashboard.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for articles, questions, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-base rounded-2xl border-border bg-card shadow-sm hover:border-primary/50 focus-visible:ring-primary"
            />
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${
                    isActive 
                      ? "bg-primary/10 border-primary text-primary font-medium" 
                      : "bg-card border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm text-center">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* FAQs Accordion */}
          <Card className="border-0 shadow-lg mb-12">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                Frequently Asked Questions
              </h2>

              {filteredFAQs.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFAQs.map((faq, index) => (
                    <AccordionItem key={faq.id} value={faq.id} className={index === filteredFAQs.length - 1 ? "border-b-0" : ""}>
                      <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary transition-colors py-4">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed text-sm pt-1 pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-1">No results found</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                    We couldn't find any FAQs matching "{searchQuery}". Try searching for different terms or browse categories.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Still Need Help Card */}
          <Card className="border-0 bg-gradient-hero text-primary-foreground shadow-lg overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/40" />
            <CardContent className="p-8 md:p-10 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left space-y-2">
                <h3 className="text-2xl font-bold flex items-center justify-center md:justify-start gap-2">
                  <MessageSquare className="w-6 h-6" />
                  Still have questions?
                </h3>
                <p className="text-primary-foreground/80 max-w-md">
                  Can't find the answer you're looking for? Reach out to our plant pathologist team directly. We are here to help!
                </p>
              </div>
              <Button 
                variant="glass" 
                size="lg" 
                onClick={() => navigate("/contact")}
                className="whitespace-nowrap shrink-0 group shadow-md"
              >
                Contact Our Support
                <Sprout className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
