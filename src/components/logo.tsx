import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
  href?: string
  className?: string
  width?: number
  height?: number
}

export function Logo({ 
  href = '/', 
  className = '', 
  width = 150,
  height = 60
}: LogoProps) {
  const content = (
    <div className="flex items-center">
      <Image
        src="/logo.png"
        alt="RestoRise"
        width={width}
        height={height}
        className="h-auto object-contain"
        priority
      />
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {content}
      </Link>
    )
  }

  return content
}

