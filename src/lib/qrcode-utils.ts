/**
 * Get the base URL for QR codes, always using restorise.fr
 * This ensures QR codes always point to the correct domain
 */
export function getQRCodeBaseUrl(): string {
  // Always use restorise.fr for QR codes, regardless of NEXT_PUBLIC_URL
  return 'https://restorise.fr'
}

export function downloadQRCode(svgId: string, filename: string) {
  const svg = document.getElementById(svgId)
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
    downloadLink.download = filename
    downloadLink.href = pngFile
    downloadLink.click()
  }

  img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
}

