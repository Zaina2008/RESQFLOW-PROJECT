import {
  Activity,
  BellRing,
  Factory,
  Fingerprint,
  Flame,
  History,
  Layers,
  LayoutDashboard,
  Map as MapIcon,
  Settings,
  ShieldCheck,
} from "lucide-react";

export const NAV_ITEMS = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Live Monitoring", to: "/live-monitoring", icon: Activity },
  { label: "Fire Detection", to: "/fire-detection", icon: Flame },
  { label: "Thermal Fingerprinting", to: "/thermal-fingerprinting", icon: Fingerprint },
  { label: "Evidence Fusion", to: "/evidence-fusion", icon: Layers },
  { label: "GIS Map", to: "/gis-map", icon: MapIcon },
  { label: "Industrial Facilities", to: "/industrial-facilities", icon: Factory },
  { label: "Historical Analysis", to: "/historical-analysis", icon: History },
  { label: "Alerts", to: "/alerts", icon: BellRing },
  { label: "Verification Centre", to: "/verification", icon: ShieldCheck },
  { label: "Settings", to: "/settings", icon: Settings },
];
