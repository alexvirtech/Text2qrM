import { useNavigate } from 'react-router-dom'

const items = [
  {
    title: 'Text to QR',
    text: 'Encrypt text and generate a QR code',
    href: '/text2qr',
  },
  {
    title: 'QR to Text',
    text: 'Scan or upload a QR code to decrypt',
    href: '/qr2text',
  },
  {
    title: 'Encrypt Text',
    text: 'Convert text into an encrypted string',
    href: '/enctext',
  },
  {
    title: 'Decrypt Text',
    text: 'Restore encrypted text with a password',
    href: '/dectext',
  },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="w-full max-w-[500px] mx-auto px-4 py-6">
      <div className="text-center mb-6">
        <div className="text-2xl font-bold text-gray-700">Text2QR</div>
        <div className="text-sm text-gray-500 mt-1">
          Secure offline encryption &amp; QR tools
        </div>
        <div className="mt-2 inline-block bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
          Works offline
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div
            key={item.href}
            onClick={() => navigate(item.href)}
            className="border border-slate-300 rounded-lg bg-white p-4 cursor-pointer shadow-sm active:bg-blue-50 transition-colors"
          >
            <div className="font-bold text-lg text-gray-700">{item.title}</div>
            <div className="text-sm text-gray-500">{item.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
