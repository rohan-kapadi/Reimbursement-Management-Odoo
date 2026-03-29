export async function compressImageToBase64(file: File, maxWidth: number = 1024): Promise<{ base64: string, type: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          return reject(new Error("Failed to get canvas context"))
        }

        ctx.drawImage(img, 0, 0, width, height)
        
        // Output JPEG
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8)
        
        // Split precisely to extract base64 payload cleanly
        const base64Data = dataUrl.split(",")[1]
        
        resolve({
          base64: base64Data,
          type: "image/jpeg"
        })
      }
      img.onerror = (error) => reject(new Error("Failed to load image for compression"))
    }
    reader.onerror = (error) => reject(new Error("Failed to read file target"))
  })
}
