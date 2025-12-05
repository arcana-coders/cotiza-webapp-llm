'use client'

import { useState } from 'react'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { QuotationPreview } from '@/components/chat/QuotationPreview'

export default function NewQuotationPage() {
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [quotationData, setQuotationData] = useState<any>(null)
  const [quotationId, setQuotationId] = useState<string | undefined>()

  const handleQuotationUpdate = (html: string, jsonData: any, newQuotationId?: string) => {
    if (html) {
      setPreviewHtml(html)
    }
    if (jsonData) {
      setQuotationData(jsonData)
    }
    if (newQuotationId) {
      setQuotationId(newQuotationId)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nueva Cotización</h1>
        <p className="text-gray-600">
          Describe tu cotización al asistente y se generará automáticamente
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-220px)]">
        {/* Chat Interface */}
        <div className="h-full">
          <ChatInterface
            quotationId={quotationId}
            onQuotationUpdate={handleQuotationUpdate}
          />
        </div>

        {/* Preview */}
        <div className="h-full">
          <QuotationPreview
            html={previewHtml}
            jsonData={quotationData}
            quotationId={quotationId}
          />
        </div>
      </div>
    </div>
  )
}
