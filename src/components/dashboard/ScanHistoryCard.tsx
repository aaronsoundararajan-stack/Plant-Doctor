import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, MapPin, Sprout, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export interface ScanHistoryItem {
  id: string;
  image_url: string;
  plant_type: string | null;
  disease_name: string | null;
  confidence: number | null;
  severity: "healthy" | "mild" | "moderate" | "severe" | null;
  notes: string | null;
  location: string | null;
  scanned_at: string;
}

interface ScanHistoryCardProps {
  scan: ScanHistoryItem;
  onDelete?: (id: string) => void;
  onClick?: () => void;
}

export function ScanHistoryCard({ scan, onDelete, onClick }: ScanHistoryCardProps) {
  const severityVariant = scan.severity || "healthy";

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative h-32">
        <img
          src={scan.image_url}
          alt={scan.disease_name || "Plant scan"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Badge 
          variant={severityVariant as any} 
          className="absolute top-2 left-2"
        >
          {scan.severity ? scan.severity.charAt(0).toUpperCase() + scan.severity.slice(1) : "Unknown"}
        </Badge>
        {onDelete && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(scan.id);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">
          {scan.disease_name || "Pending Analysis"}
        </h3>

        {scan.plant_type && (
          <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
            <Sprout className="w-3 h-3" />
            {scan.plant_type}
          </p>
        )}

        {scan.confidence !== null && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Confidence</span>
              <span>{scan.confidence}%</span>
            </div>
            <Progress 
              value={scan.confidence} 
              size="sm"
              severity={severityVariant as any}
            />
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {format(new Date(scan.scanned_at), "MMM d, yyyy")}
          </span>
          {scan.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {scan.location}
            </span>
          )}
        </div>

        {scan.notes && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">
            "{scan.notes}"
          </p>
        )}
      </CardContent>
    </Card>
  );
}