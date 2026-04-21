import { useState, useRef, useEffect } from 'react'
import jsQR from 'jsqr'
import { decrypt, deterministicMnemonic } from '../utils/crypto'
import { styles } from '../utils/styles'
import { copyText } from '../utils/lib'
import Error from '../components/Error'
import CameraScanner from '../components/CameraScanner'

type Mode = 'choose' | 'file' | 'camera'

export default function QR2Text() {
  const [created, setCreated] = useState(false)
  const [text, setText] = useState('')
  const [password, setPassword] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileData, setFileData] = useState<string | null>(null)
  const [scannedData, setScannedData] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<Mode>('choose')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const hasQrData = !!(fileName || scannedData)

  useEffect(() => {
    if (!created && hasQrData) {
      passwordRef.current?.focus()
    }
  }, [hasQrData, created])

  const extractEncryptedData = (raw: string): string => {
    return raw.replace(/^https?:\/\/[^/]+\/\?ds=/, '')
  }

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setFileData(e.target?.result as string)
      setFileName(file.name)
      setError('')
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleCameraScanned = (data: string) => {
    setScannedData(data)
    setError('')
  }

  const handleDecrypt = () => {
    if (!password) {
      setError('Please enter a password.')
      return
    }

    if (scannedData) {
      const data = extractEncryptedData(scannedData)
      const decryptedText = decrypt(data, password)
      setText(decryptedText || deterministicMnemonic(password, data))
      setCreated(true)
      return
    }

    if (!fileData) {
      setError('Please upload a file or scan a QR code.')
      return
    }

    const image = new Image()
    image.src = fileData
    image.onload = () => {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')!
      canvas.width = image.width
      canvas.height = image.height
      context.drawImage(image, 0, 0)

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      const qrCode = jsQR(imageData.data, canvas.width, canvas.height)

      if (qrCode) {
        const data = extractEncryptedData(qrCode.data)
        const decryptedText = decrypt(data, password)
        setText(decryptedText || deterministicMnemonic(password, data))
        setCreated(true)
      } else {
        setError('No QR code found in the image.')
      }
    }
    image.onerror = () => {
      setError('Failed to load the image.')
    }
  }

  const reset = () => {
    setText('')
    setPassword('')
    setFileName('')
    setFileData(null)
    setScannedData(null)
    setCreated(false)
    setError('')
    setMode('choose')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="w-full max-w-[500px] mx-auto px-4">
      <div className="text-2xl pt-4 font-bold">QR to Text</div>

      {mode === 'choose' && !created && !hasQrData && (
        <div className="flex flex-col gap-3 mt-4">
          <button
            type="button"
            onClick={() => setMode('camera')}
            className="border-2 border-blue-400 bg-blue-50 rounded-lg p-5 text-center active:bg-blue-100 transition-colors"
          >
            <div className="text-2xl mb-1">&#128247;</div>
            <div className="font-bold text-blue-700">Scan with Camera</div>
            <div className="text-sm text-blue-600 mt-1">Point your camera at a QR code</div>
          </button>
          <button
            type="button"
            onClick={() => setMode('file')}
            className="border border-gray-300 rounded-lg p-5 text-center active:bg-gray-100 transition-colors"
          >
            <div className="text-2xl mb-1">&#128193;</div>
            <div className="font-bold text-gray-700">Upload File</div>
            <div className="text-sm text-gray-500 mt-1">Select a QR code image from your device</div>
          </button>
        </div>
      )}

      {mode === 'file' && !fileName && !created && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-dashed border-2 h-[150px] border-gray-400 rounded-lg p-4 text-center flex flex-col justify-center items-center active:bg-blue-50 transition-colors"
          >
            <div className="text-gray-500">Tap to select a QR code image</div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </button>
          <button
            type="button"
            className="mt-3 text-sm text-blue-500 active:text-blue-700 block mx-auto"
            onClick={() => setMode('choose')}
          >
            &larr; Back
          </button>
        </div>
      )}

      {mode === 'camera' && !scannedData && !created && (
        <CameraScanner
          onScanned={handleCameraScanned}
          onClose={() => setMode('choose')}
        />
      )}

      {hasQrData && !created && (
        <div className="pt-4">
          <div className="pb-2 text-gray-600 text-sm">
            {fileName ? `File: ${fileName}` : 'QR code scanned'}
          </div>
          <div className="pb-4">
            <div className={styles.labelB}>Password</div>
            <input
              ref={passwordRef}
              type="password"
              className={styles.textInput}
              placeholder="Enter password"
              value={password}
              onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
            />
          </div>
          <div className="flex justify-center gap-2">
            <button type="button" className={styles.button} onClick={handleDecrypt}>
              Decrypt
            </button>
            <button type="button" className={styles.button} onClick={reset}>
              Reset
            </button>
          </div>
        </div>
      )}

      {created && (
        <>
          <div className="pt-4">
            <div className={styles.labelB}>Plain text</div>
            <textarea
              readOnly
              className={styles.textInput}
              value={text}
              rows={6}
              onClick={() => copyText(text, 'Decrypted text')}
            />
            <div className={styles.comments + ' text-right'}>Tap text to copy</div>
          </div>
          <div className="flex justify-center mt-4">
            <button type="button" className={styles.button} onClick={reset}>
              Reset
            </button>
          </div>
        </>
      )}

      <Error text={error} clear={() => setError('')} />
    </div>
  )
}
