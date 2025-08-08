import React from "react";
import {
  LucideProps,
  Footprints,
  HeartPulse,
  Moon as LucideMoon,
  Apple as LucideApple,
  Droplets as LucideDroplets,
  Brain as LucideBrain,
  BarChart3 as LucideBarChart3,
  Settings as LucideSettings,
  AlertTriangle as LucideAlertTriangle,
  Activity as LucideActivity,
  Target as LucideTarget,
  Zap as LucideZap,
  RotateCcw as LucideRotateCcw,
  Play as LucidePlay,
  Pause as LucidePause,
  User as LucideUser,
  Home as LucideHome,
  TrendingUp as LucideTrendingUp,
  TrendingDown as LucideTrendingDown,
  Battery as LucideBattery,
  Smartphone as LucideSmartphone,
  Download as LucideDownload,
  Upload as LucideUpload,
  Info as LucideInfo,
  CheckCircle as LucideCheckCircle,
  Heart as LucideHeart,
  MapPin as LucideMapPin,
  Clock as LucideClock,
  Minus as LucideMinus,
  Calendar as LucideCalendar,
  Award as LucideAward,
  Camera as LucideCamera,
  Square as LucideSquare,
  Mountain as LucideMountain,
  Wind as LucideWind,
  Plus as LucidePlus,
  AlertCircle as LucideAlertCircle,
  Smile as LucideSmile,
  Frown as LucideFrown,
  Meh as LucideMeh,
  Sun as LucideSun,
  PieChart as LucidePieChart,
  Edit3 as LucideEdit3,
  Trash2 as LucideTrash2,
  Search as LucideSearch,
  ChefHat as LucideChefHat,
  ChevronLeft as LucideChevronLeft,
  ChevronRight as LucideChevronRight,
  X as LucideX,
} from "lucide-react";

// Helper to enforce Nothing-style defaults (24x24, 2px stroke, rounded caps)
const withDefaults = (props: LucideProps): LucideProps => ({
  size: props.size ?? 24,
  strokeWidth: props.strokeWidth ?? 2,
  strokeLinecap: props.strokeLinecap ?? "round",
  strokeLinejoin: props.strokeLinejoin ?? "round",
  ...props,
});

// Core metric icons (Nothing naming)
export const Steps = (props: LucideProps) => (
  <Footprints {...withDefaults(props)} />
);
export const HeartRate = (props: LucideProps) => (
  <HeartPulse {...withDefaults(props)} />
);
export const Sleep = (props: LucideProps) => <LucideMoon {...withDefaults(props)} />;
export const Nutrition = (props: LucideProps) => (
  <LucideApple {...withDefaults(props)} />
);
export const Hydration = (props: LucideProps) => (
  <LucideDroplets {...withDefaults(props)} />
);
export const Stress = (props: LucideProps) => <LucideBrain {...withDefaults(props)} />;
export const Analytics = (props: LucideProps) => (
  <LucideBarChart3 {...withDefaults(props)} />
);

// Re-exports matching common Lucide names used across the app
export const Settings = (props: LucideProps) => (
  <LucideSettings {...withDefaults(props)} />
);
export const AlertTriangle = (props: LucideProps) => (
  <LucideAlertTriangle {...withDefaults(props)} />
);
export const Activity = (props: LucideProps) => (
  <LucideActivity {...withDefaults(props)} />
);
export const Target = (props: LucideProps) => <LucideTarget {...withDefaults(props)} />;
export const Zap = (props: LucideProps) => <LucideZap {...withDefaults(props)} />;
export const RotateCcw = (props: LucideProps) => (
  <LucideRotateCcw {...withDefaults(props)} />
);
export const Play = (props: LucideProps) => <LucidePlay {...withDefaults(props)} />;
export const Pause = (props: LucideProps) => <LucidePause {...withDefaults(props)} />;
export const User = (props: LucideProps) => <LucideUser {...withDefaults(props)} />;
export const Home = (props: LucideProps) => <LucideHome {...withDefaults(props)} />;
export const TrendingUp = (props: LucideProps) => (
  <LucideTrendingUp {...withDefaults(props)} />
);
export const TrendingDown = (props: LucideProps) => (
  <LucideTrendingDown {...withDefaults(props)} />
);
export const Battery = (props: LucideProps) => <LucideBattery {...withDefaults(props)} />;
export const Smartphone = (props: LucideProps) => (
  <LucideSmartphone {...withDefaults(props)} />
);
export const Download = (props: LucideProps) => (
  <LucideDownload {...withDefaults(props)} />
);
export const Upload = (props: LucideProps) => <LucideUpload {...withDefaults(props)} />;
export const Info = (props: LucideProps) => <LucideInfo {...withDefaults(props)} />;
export const CheckCircle = (props: LucideProps) => (
  <LucideCheckCircle {...withDefaults(props)} />
);
export const Heart = (props: LucideProps) => <LucideHeart {...withDefaults(props)} />;
export const BarChart3 = (props: LucideProps) => (
  <LucideBarChart3 {...withDefaults(props)} />
);
export const MapPin = (props: LucideProps) => <LucideMapPin {...withDefaults(props)} />;
export const Clock = (props: LucideProps) => <LucideClock {...withDefaults(props)} />;
export const Minus = (props: LucideProps) => <LucideMinus {...withDefaults(props)} />;
export const Calendar = (props: LucideProps) => (
  <LucideCalendar {...withDefaults(props)} />
);
export const Award = (props: LucideProps) => <LucideAward {...withDefaults(props)} />;
export const Camera = (props: LucideProps) => <LucideCamera {...withDefaults(props)} />;
export const Square = (props: LucideProps) => <LucideSquare {...withDefaults(props)} />;
export const Mountain = (props: LucideProps) => <LucideMountain {...withDefaults(props)} />;
export const Wind = (props: LucideProps) => <LucideWind {...withDefaults(props)} />;
export const Plus = (props: LucideProps) => <LucidePlus {...withDefaults(props)} />;
export const AlertCircle = (props: LucideProps) => (
  <LucideAlertCircle {...withDefaults(props)} />
);
export const Smile = (props: LucideProps) => <LucideSmile {...withDefaults(props)} />;
export const Frown = (props: LucideProps) => <LucideFrown {...withDefaults(props)} />;
export const Meh = (props: LucideProps) => <LucideMeh {...withDefaults(props)} />;
export const Sun = (props: LucideProps) => <LucideSun {...withDefaults(props)} />;
export const Moon = (props: LucideProps) => <LucideMoon {...withDefaults(props)} />;
export const Brain = (props: LucideProps) => <LucideBrain {...withDefaults(props)} />;
export const Droplets = (props: LucideProps) => (
  <LucideDroplets {...withDefaults(props)} />
);
export const Apple = (props: LucideProps) => <LucideApple {...withDefaults(props)} />;
export const PieChart = (props: LucideProps) => (
  <LucidePieChart {...withDefaults(props)} />
);
export const Edit3 = (props: LucideProps) => <LucideEdit3 {...withDefaults(props)} />;
export const Trash2 = (props: LucideProps) => <LucideTrash2 {...withDefaults(props)} />;
export const Search = (props: LucideProps) => <LucideSearch {...withDefaults(props)} />;
export const ChefHat = (props: LucideProps) => <LucideChefHat {...withDefaults(props)} />;
export const ChevronLeft = (props: LucideProps) => (
  <LucideChevronLeft {...withDefaults(props)} />
);
export const ChevronRight = (props: LucideProps) => (
  <LucideChevronRight {...withDefaults(props)} />
);
export const X = (props: LucideProps) => <LucideX {...withDefaults(props)} />;
