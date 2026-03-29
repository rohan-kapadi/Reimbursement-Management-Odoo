"use client"

import { useState, useTransition, useEffect } from "react"
import { submitExpense } from "@/lib/actions/expense"
import { extractReceiptData } from "@/lib/actions/ocr"
import { compressImageToBase64 } from "@/lib/utils/image"
import { useRouter } from "next/navigation"
import type { Expense } from "@/types/db"

/* ── Shared inline styles ── */
const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 42,
  border: "1.5px solid #e2e8f0",
  borderRadius: 10,
  padding: "0 14px",
  fontSize: 14,
  color: "#0f172a",
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
  transition: "all .15s",
  fontFamily: "inherit",
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#475569",
  marginBottom: 6,
}

export default function ExpenseForm({ baseCurrency, initialData }: { baseCurrency: string, initialData?: Expense }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isExtracting, setIsExtracting] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const [amount, setAmount] = useState<number>(initialData?.amount || 0)
  const [currency, setCurrency] = useState<string>(initialData?.currency || baseCurrency)
  const [merchant, setMerchant] = useState<string>(initialData?.merchant || "")
  const [category, setCategory] = useState<string>(initialData?.category || "TRAVEL")
  const [date, setDate] = useState<string>(initialData?.date || new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState<string>(initialData?.description || "")
  const [estimatedBase, setEstimatedBase] = useState<number | null>(null)

  useEffect(() => {
    if (amount <= 0 || currency === baseCurrency) {
      setEstimatedBase(null)
      return
    }

    const timeoutId = setTimeout(() => {
      fetch(`https://api.exchangerate-api.com/v4/latest/${currency}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.rates && data.rates[baseCurrency]) {
            setEstimatedBase(amount * data.rates[baseCurrency])
          }
        })
        .catch(() => setEstimatedBase(null))
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [amount, currency, baseCurrency])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return;
    setFileName(file.name)

    try {
      setIsExtracting(true)
      const { base64, type } = await compressImageToBase64(file, 1024)
      const data = await extractReceiptData(base64, type)

      if (data) {
        if (data.amount) setAmount(Number(data.amount))
        if (data.currency) setCurrency(data.currency)
        if (data.merchant && data.merchant !== "Unknown") setMerchant(data.merchant)
        if (data.category && data.category !== "Unknown") setCategory(data.category.toUpperCase())
        if (data.date && data.date !== "Unknown") setDate(data.date)
        if (data.description && data.description !== "Unknown") setDescription(data.description)
      }
    } catch (err: any) {
      alert(`OCR Extraction Failed: ${err.message}`)
    } finally {
      setIsExtracting(false)
    }
  }

  async function handleSubmit(formData: FormData) {
    if (isExtracting) return
    startTransition(async () => {
      try {
        await submitExpense(formData)
        alert("Expense submitted successfully!")
        router.refresh()
      } catch (err: any) {
        alert(err.message)
      }
    })
  }

  const getFieldStyle = (id: string): React.CSSProperties => ({
    ...inputStyle,
    borderColor: focusedField === id ? "#059669" : "#e2e8f0",
    boxShadow: focusedField === id ? "0 0 0 3px rgba(5,150,105,.12)" : "none",
  })

  return (
    <form action={handleSubmit} style={{
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: 20,
      padding: "24px 28px",
      boxShadow: "0 4px 20px rgba(0,0,0,.04), 0 1px 4px rgba(0,0,0,.02)",
      display: "flex", flexDirection: "column", gap: 20,
      position: "relative", overflow: "hidden"
    }}>
      {/* OCR Overlay */}
      {isExtracting && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(255,255,255,0.85)", backdropFilter: "blur(4px)",
          zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 12
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            border: "3px solid #a7f3d0", borderTopColor: "#059669",
            animation: "spin 1s linear infinite"
          }} />
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#065f46" }}>Reading receipt...</p>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>AI is extracting details</p>
          </div>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      <input type="hidden" name="expenseId" value={initialData?.id || ""} />

      {/* Upload Field */}
      <div>
        <label style={labelStyle}>Receipt Image {initialData ? "(optional)" : ""}</label>
        <label
          htmlFor="receipt-upload"
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
            padding: 24, borderRadius: 12,
            border: "1.5px dashed #cbd5e1",
            background: "#f8fafb", cursor: "pointer",
            transition: "all .2s"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#34d399"; e.currentTarget.style.background = "#effdf5" }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.background = "#f8fafb" }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "0 2px 8px rgba(0,0,0,.05)" }}>
            📤
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: "#475569" }}>
              {fileName ? fileName : "Click to upload receipt"}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>PNG, JPG, or WEBP — AI handles the rest</p>
          </div>
          <input
            id="receipt-upload"
            type="file"
            name="receiptFile"
            accept="image/*"
            required={!initialData}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </label>
      </div>

      {/* Amount + Currency */}
      <div>
        <label style={labelStyle}>Amount & Currency</label>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="number"
            name="amount"
            step="0.01"
            required
            placeholder="0.00"
            value={amount || ''}
            onChange={e => setAmount(parseFloat(e.target.value) || 0)}
            onFocus={() => setFocusedField("amount")}
            onBlur={() => setFocusedField(null)}
            style={{ ...getFieldStyle("amount"), flex: 1, paddingLeft: 16 }}
          />
          <select
            name="currency"
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            onFocus={() => setFocusedField("currency")}
            onBlur={() => setFocusedField(null)}
            style={{ ...getFieldStyle("currency"), width: 100, flexShrink: 0, paddingRight: 8 }}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="INR">INR</option>
            <option value="CAD">CAD</option>
            <option value="AUD">AUD</option>
          </select>
        </div>
        {estimatedBase !== null && (
          <p style={{ margin: "8px 0 0", fontSize: 12, fontWeight: 600, color: "#059669" }}>
            ≈ {estimatedBase.toFixed(2)} {baseCurrency} (Live rate)
          </p>
        )}
      </div>

      {/* Merchant */}
      <div>
        <label style={labelStyle}>Merchant</label>
        <input
          type="text"
          name="merchant"
          value={merchant}
          onChange={e => setMerchant(e.target.value)}
          required
          placeholder="e.g. Starbucks"
          onFocus={() => setFocusedField("merchant")}
          onBlur={() => setFocusedField(null)}
          style={getFieldStyle("merchant")}
        />
      </div>

      {/* Category + Date */}
      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Category</label>
          <select
            name="category"
            value={category}
            onChange={e => setCategory(e.target.value)}
            onFocus={() => setFocusedField("category")}
            onBlur={() => setFocusedField(null)}
            style={getFieldStyle("category")}
          >
            <option value="TRAVEL">Travel ✈️</option>
            <option value="MEALS">Meals 🍔</option>
            <option value="SOFTWARE">Software / IT 💻</option>
            <option value="OFFICE">Office Supplies 📎</option>
            <option value="OTHER">Other 📦</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Date</label>
          <input
            type="date"
            name="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
            onFocus={() => setFocusedField("date")}
            onBlur={() => setFocusedField(null)}
            style={getFieldStyle("date")}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label style={labelStyle}>Description / Notes</label>
        <textarea
          name="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
          rows={3}
          placeholder="Why was this required?"
          onFocus={() => setFocusedField("description")}
          onBlur={() => setFocusedField(null)}
          style={{ ...getFieldStyle("description"), height: "auto", paddingTop: 10, paddingBottom: 10, resize: "vertical" }}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending || isExtracting}
        style={{
          width: "100%", height: 46, borderRadius: 12, border: "none",
          background: (isPending || isExtracting) ? "#94a3b8" : "linear-gradient(135deg,#059669,#0d9488)",
          color: "#fff", fontSize: 15, fontWeight: 700,
          cursor: (isPending || isExtracting) ? "not-allowed" : "pointer",
          boxShadow: (isPending || isExtracting) ? "none" : "0 6px 20px rgba(5,150,105,.3)",
          marginTop: 8, fontFamily: "inherit"
        }}
      >
        {isPending ? "⏳ Submitting..." : initialData ? "Confirm Resubmission →" : "Submit Expense →"}
      </button>
    </form>
  )
}
