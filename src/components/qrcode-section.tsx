'use client'

import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download } from 'lucide-react'

interface QRCodeSectionProps {
  restaurant: {
    id: string
    name: string
    slug: string
  }
  reviewUrl: string
  plan?: string
}

export function QRCodeSection({ restaurant, reviewUrl }: QRCodeSectionProps) {

  const handleDownload = () => {
    const svg = document.getElementById('qrcode-svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')

      const downloadLink = document.createElement('a')
      downloadLink.download = `qrcode-${restaurant.slug}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  return (
    <Card className="border border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-[#2C2C2C]">QR Code</CardTitle>
        <CardDescription className="text-base">
          Téléchargez votre QR Code pour l'afficher sur vos tables
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-[#FF6B35]/30">
          <div id="qrcode-container">
            <QRCodeSVG
              id="qrcode-svg"
              value={reviewUrl}
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-gray-700">
            URL du QR Code:
          </p>
          <p className="text-xs text-gray-500 break-all bg-gray-50 p-2 rounded">
            {reviewUrl}
          </p>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={handleDownload} 
            className="gap-2 bg-[#FF6B35] hover:bg-[#E55A2B] text-white"
          >
            <Download className="h-4 w-4" />
            Télécharger le QR Code
          </Button>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-[#FF6B35]/20 rounded-xl p-4">
          <p className="text-sm text-[#2C2C2C]">
            <strong className="text-[#FF6B35]">Astuce:</strong> Imprimez ce QR Code et placez-le sur vos
            tables. Les clients pourront scanner et laisser un avis directement.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

