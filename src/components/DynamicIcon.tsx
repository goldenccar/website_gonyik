import {
  ShieldCheck,
  Droplets,
  Layers,
  Leaf,
  Building2,
  Atom,
  Hexagon,
  Shirt,
  Award,
  Sun,
  Backpack,
  Shield,
  ArrowRight,
  Beaker,
  Microscope,
  CheckCircle,
  Circle,
  Wind,
  Ban,
  FlaskConical,
  Code2,
  type LucideProps,
} from 'lucide-react'

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  ShieldCheck,
  Droplets,
  Layers,
  Leaf,
  Building2,
  Atom,
  Hexagon,
  Shirt,
  Award,
  Sun,
  Backpack,
  Shield,
  ArrowRight,
  Beaker,
  Microscope,
  CheckCircle,
  Circle,
  Wind,
  Ban,
  FlaskConical,
  Code2,
}

interface DynamicIconProps extends LucideProps {
  name: string
}

export default function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const Icon = ICON_MAP[name] || Circle
  return <Icon {...props} />
}
