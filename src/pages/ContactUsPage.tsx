import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Mail, 
  MapPin, 
  Clock, 
  Send,
  MessageSquare,
  Sprout,
  CheckCircle2
} from "lucide-react";

export default function ContactUsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    plantType: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Validation Error",
        description: "Please fill in all the required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate sending message to backend/email
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitted(true);
    toast({
      title: "Message Sent!",
      description: "Thank you! Our plant experts will get back to you shortly.",
    });

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
      plantType: "",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-5xl mx-auto px-4 animate-fade-in">
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
              Contact Our Experts
            </h1>
            <p className="text-muted-foreground mt-2">
              Have questions about a diagnosis, suggestions, or experiencing an issue? Send us a message and we'll reply as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info Sidebar */}
            <div className="space-y-6 lg:col-span-1">
              <Card className="border-0 shadow-lg bg-gradient-hero text-primary-foreground overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/80 to-primary/45" />
                <CardContent className="p-6 relative z-10 space-y-6">
                  <h3 className="text-lg font-bold flex items-center gap-2 border-b border-white/20 pb-3">
                    <Sprout className="w-5 h-5" />
                    Support Info
                  </h3>
                  
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-primary-foreground/75 uppercase tracking-wider font-semibold">Email Us</p>
                      <a href="mailto:support@plantguard.ai" className="font-medium hover:underline text-sm md:text-base">
                        support@plantguard.ai
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-primary-foreground/75 uppercase tracking-wider font-semibold">Expert Hours</p>
                      <p className="font-medium text-sm">Mon - Fri: 8:00 AM - 6:00 PM</p>
                      <p className="text-xs text-primary-foreground/70">Saturday: 9:00 AM - 2:00 PM</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-primary-foreground/75 uppercase tracking-wider font-semibold">HQ Location</p>
                      <p className="font-medium text-sm">Greenhouse Complex B</p>
                      <p className="text-xs text-primary-foreground/70">Agricultural Technology Park, CA</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    Pathology Consulting
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    For farm-wide disease outbreaks, you can attach high-resolution leaf cluster images or request a local agronomist referral through our help channel.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 md:p-8">
                  {submitted ? (
                    <div className="text-center py-12 space-y-4 animate-scale-in">
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                      </div>
                      <h2 className="text-2xl font-bold">Message Received!</h2>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Thank you for reaching out. We have received your query and one of our AI support representatives or plant pathologists will email you shortly.
                      </p>
                      <Button variant="outline" className="mt-4" onClick={() => setSubmitted(false)}>
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                          <Input
                            id="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject <span className="text-destructive">*</span></Label>
                          <Input
                            id="subject"
                            placeholder="How can we help you?"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="plantType">Plant Type (optional)</Label>
                          <Input
                            id="plantType"
                            placeholder="e.g. Tomato, Orchid, Apple tree"
                            value={formData.plantType}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message / Details <span className="text-destructive">*</span></Label>
                        <Textarea
                          id="message"
                          placeholder="Describe the leaf health issue, app bug, or questions you have..."
                          value={formData.message}
                          onChange={handleChange}
                          rows={5}
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        variant="hero"
                        size="lg"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          "Sending Message..."
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
