import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { styles } from '../utils/styles'

interface CameraScannerProps {
  onScanned: (data: string) => void
  onClose: () => void
}

export default function CameraScanner({ onScanned, onClose }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animFrameRef = useRef<number>(0)
  const [error, setError] = useState('')

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.setAttribute('playsinline', 'true')
        videoRef.current.play()
        scanLoop()
      }
    } catch {
      setError('Could not access camera. Please check permissions in your device settings.')
    }
  }

  const stopCamera = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  const scanLoop = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(scanLoop)
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const qrCode = jsQR(imageData.data, canvas.width, canvas.height)

    if (qrCode) {
      stopCamera()
      onScanned(qrCode.data)
      return
    }

    animFrameRef.current = requestAnimationFrame(scanLoop)
  }

  return (
    <div className="mt-4">
      {error ? (
        <div className="text-red-600 text-center py-8 px-4">{error}</div>
      ) : (
        <>
          <div className="relative rounded-lg overflow-hidden border-2 border-blue-400 bg-black">
            <video ref={videoRef} className="w-full" playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-52 h-52 border-2 border-white/60 rounded-lg" />
            </div>
          </div>
          <div className="text-center text-sm text-gray-500 mt-2">
            Point your camera at a QR code
          </div>
        </>
      )}
      <div className="flex justify-center mt-3">
        <button type="button" className={styles.button} onClick={() => { stopCamera(); onClose() }}>
          Cancel
        </button>
      </div>
    </div>
  )
}
