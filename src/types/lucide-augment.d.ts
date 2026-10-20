import 'lucide-react-native';

declare module 'lucide-react-native' {
  interface LucideProps {
    /** SVG color shorthand — sets stroke and/or fill color */
    color?: string;
    /** SVG fill color */
    fill?: string;
    /** Stroke color */
    stroke?: string;
  }
}

