import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Shield,
  Users,
  Leaf,
  History,
  Plus,
  Trash2,
  Edit,
  Loader2,
  X,
  Save,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Disease {
  id: string;
  name: string;
  description: string | null;
  symptoms: string | null;
  causes: string | null;
  spread_risk: string | null;
  organic_treatments: string | null;
  chemical_treatments: string | null;
  prevention_tips: string | null;
  affected_plants: string[] | null;
}

interface Stats {
  totalUsers: number;
  totalScans: number;
  totalDiseases: number;
  scansThisWeek: number;
}

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalScans: 0,
    totalDiseases: 0,
    scansThisWeek: 0,
  });
  const [loading, setLoading] = useState(true);
  const [editingDisease, setEditingDisease] = useState<Disease | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/auth");
      } else if (!isAdmin) {
        navigate("/dashboard");
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
      }
    }
  }, [user, isAdmin, authLoading, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      // Fetch diseases
      const { data: diseasesData, error: diseasesError } = await supabase
        .from("diseases")
        .select("*")
        .order("name");

      if (diseasesError) throw diseasesError;
      setDiseases(diseasesData || []);

      // Get stats
      const { count: scansCount } = await supabase
        .from("scans")
        .select("*", { count: "exact", head: true });

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { count: weekScansCount } = await supabase
        .from("scans")
        .select("*", { count: "exact", head: true })
        .gte("scanned_at", weekAgo.toISOString());

      setStats({
        totalUsers: 0, // Would need admin RPC to count users
        totalScans: scansCount || 0,
        totalDiseases: diseasesData?.length || 0,
        scansThisWeek: weekScansCount || 0,
      });
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDisease = async (disease: Partial<Disease>) => {
    try {
      if (editingDisease?.id) {
        // Update existing
        const { error } = await supabase
          .from("diseases")
          .update(disease)
          .eq("id", editingDisease.id);

        if (error) throw error;
        toast({ title: "Disease updated successfully" });
      } else {
        // Create new - ensure name is provided
        if (!disease.name) {
          throw new Error("Disease name is required");
        }
        const { error } = await supabase.from("diseases").insert({
          name: disease.name,
          description: disease.description,
          symptoms: disease.symptoms,
          causes: disease.causes,
          spread_risk: disease.spread_risk,
          organic_treatments: disease.organic_treatments,
          chemical_treatments: disease.chemical_treatments,
          prevention_tips: disease.prevention_tips,
          affected_plants: disease.affected_plants,
        });

        if (error) throw error;
        toast({ title: "Disease created successfully" });
      }

      setDialogOpen(false);
      setEditingDisease(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error saving disease",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteDisease = async (id: string) => {
    if (!confirm("Are you sure you want to delete this disease?")) return;

    try {
      const { error } = await supabase.from("diseases").delete().eq("id", id);

      if (error) throw error;
      toast({ title: "Disease deleted" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error deleting disease",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Admin Panel</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              Manage PlantGuard
            </h1>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <History className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalScans}</p>
                    <p className="text-xs text-muted-foreground">Total Scans</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalDiseases}</p>
                    <p className="text-xs text-muted-foreground">Diseases</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.scansThisWeek}</p>
                    <p className="text-xs text-muted-foreground">This Week</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">Admin</p>
                    <p className="text-xs text-muted-foreground">Your Role</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Disease Management */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-primary" />
                Disease Database
              </CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="hero"
                    onClick={() => setEditingDisease(null)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Disease
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingDisease ? "Edit Disease" : "Add New Disease"}
                    </DialogTitle>
                  </DialogHeader>
                  <DiseaseForm
                    disease={editingDisease}
                    onSave={handleSaveDisease}
                    onCancel={() => {
                      setDialogOpen(false);
                      setEditingDisease(null);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {diseases.map((disease) => (
                  <div
                    key={disease.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{disease.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {disease.description}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {disease.spread_risk || "Unknown"} risk
                        </span>
                        {disease.affected_plants?.slice(0, 3).map((plant) => (
                          <span
                            key={plant}
                            className="text-xs px-2 py-0.5 rounded-full bg-secondary/50"
                          >
                            {plant}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingDisease(disease);
                          setDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteDisease(disease.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

interface DiseaseFormProps {
  disease: Disease | null;
  onSave: (disease: Partial<Disease>) => void;
  onCancel: () => void;
}

function DiseaseForm({ disease, onSave, onCancel }: DiseaseFormProps) {
  const [formData, setFormData] = useState({
    name: disease?.name || "",
    description: disease?.description || "",
    symptoms: disease?.symptoms || "",
    causes: disease?.causes || "",
    spread_risk: disease?.spread_risk || "medium",
    organic_treatments: disease?.organic_treatments || "",
    chemical_treatments: disease?.chemical_treatments || "",
    prevention_tips: disease?.prevention_tips || "",
    affected_plants: disease?.affected_plants?.join(", ") || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      affected_plants: formData.affected_plants
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Disease Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="symptoms">Symptoms</Label>
        <Textarea
          id="symptoms"
          value={formData.symptoms}
          onChange={(e) =>
            setFormData({ ...formData, symptoms: e.target.value })
          }
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="causes">Causes</Label>
        <Textarea
          id="causes"
          value={formData.causes}
          onChange={(e) => setFormData({ ...formData, causes: e.target.value })}
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="spread_risk">Spread Risk</Label>
        <Select
          value={formData.spread_risk}
          onValueChange={(value) =>
            setFormData({ ...formData, spread_risk: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="organic_treatments">Organic Treatments</Label>
        <Textarea
          id="organic_treatments"
          value={formData.organic_treatments}
          onChange={(e) =>
            setFormData({ ...formData, organic_treatments: e.target.value })
          }
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="chemical_treatments">Chemical Treatments</Label>
        <Textarea
          id="chemical_treatments"
          value={formData.chemical_treatments}
          onChange={(e) =>
            setFormData({ ...formData, chemical_treatments: e.target.value })
          }
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="prevention_tips">Prevention Tips</Label>
        <Textarea
          id="prevention_tips"
          value={formData.prevention_tips}
          onChange={(e) =>
            setFormData({ ...formData, prevention_tips: e.target.value })
          }
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="affected_plants">Affected Plants (comma-separated)</Label>
        <Input
          id="affected_plants"
          value={formData.affected_plants}
          onChange={(e) =>
            setFormData({ ...formData, affected_plants: e.target.value })
          }
          placeholder="tomatoes, peppers, potatoes"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="hero">
          <Save className="w-4 h-4 mr-2" />
          Save Disease
        </Button>
      </div>
    </form>
  );
}
