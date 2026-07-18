interface IconProps {
  name: string
  className?: string
  filled?: boolean
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700
}

export default function Icon({ 
  name, 
  className = '', 
  filled = false,
  weight = 300 
}: IconProps) {
  return (
    <span 
      className={`material-symbols-outlined ${className}`}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`
      }}
    >
      {name}
    </span>
  )
}