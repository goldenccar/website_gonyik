import { Droplets, Wind, Waves, CloudRain, CloudSun, ShieldCheck, Sun, Feather, Shield, Layers, Scissors } from 'lucide-react'

const icons = { droplets: Droplets, wind: Wind, waves: Waves, 'cloud-rain': CloudRain, 'cloud-sun': CloudSun, 'shield-check': ShieldCheck, sun: Sun, feather: Feather, shield: Shield, layers: Layers, scissors: Scissors }

export default function FeatureIcon({ name, size = 24 }: { name?: string; size?: number }) {
  const Icon = icons[name as keyof typeof icons]
  return Icon ? <Icon size={size} strokeWidth={1.5} aria-hidden="true" /> : null
}
