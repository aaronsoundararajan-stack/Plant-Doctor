import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScanHistoryCard, ScanHistoryItem } from "@/components/dashboard/ScanHistoryCard";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Camera,
  History,
  Leaf,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Loader2,
} from "lucide-react";

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [scans, setScans] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchScans();
    }
  }, [user]);

  const fetchScans = async () => {
    try {
      const { data, error } = await supabase
        .from("scans")
        .select("*")
        .eq("user_id", user!.id)
        .order("scanned_at", { ascending: false });

      if (error) throw error;

      setScans(data as ScanHistoryItem[]);
    } catch (error) {
      console.error("Error fetching scans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScan = async (id: string) => {
    try {
      const { error } = await supabase.from("scans").delete().eq("id", id);

      if (error) throw error;

      setScans((prev) => prev.filter((scan) => scan.id !== id));
      toast({
        title: "Scan deleted",
        description: "The scan has been removed from your history.",
      });
    } catch (error) {
      console.error("Error deleting scan:", error);
      toast({
        title: "Error",
        description: "Failed to delete scan. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate stats
  const stats = {
    total: scans.length,
    healthy: scans.filter((s) => s.severity === "healthy").length,
    diseased: scans.filter((s) => s.severity && s.severity !== "healthy").length,
    thisMonth: scans.filter((s) => {
      const scanDate = new Date(s.scanned_at);
      const now = new Date();
      return (
        scanDate.getMonth() === now.getMonth() &&
        scanDate.getFullYear() === now.getFullYear()
      );
    }).length,
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              Welcome back, {profile?.full_name || "Plant Guardian"}!
            </h1>
            <p className="text-muted-foreground mt-2">
              Track your plant health and manage your scan history
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3 mb-8">
            <Button variant="hero" onClick={() => navigate("/scan")}>
              <Camera className="w-4 h-4 mr-2" />
              New Scan
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <History className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total Scans</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.healthy}</p>
                    <p className="text-xs text-muted-foreground">Healthy</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.diseased}</p>
                    <p className="text-xs text-muted-foreground">Diseased</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.thisMonth}</p>
                    <p className="text-xs text-muted-foreground">This Month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Scan History */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-primary" />
                Scan History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : scans.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">No scans yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by scanning your first plant to build your history
                  </p>
                  <Button variant="hero" onClick={() => navigate("/scan")}>
                    Scan Your First Plant
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scans.map((scan) => (
                    <ScanHistoryCard
                      key={scan.id}
                      scan={scan}
                      onDelete={handleDeleteScan}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
