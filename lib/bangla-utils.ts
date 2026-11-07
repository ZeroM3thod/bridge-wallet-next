export const toBanglaDigit = (n: number | string): string => {
  return String(n).replace(/[0-9]/g, d => "০১২৩৪৫৬৭৮৯"[+d])
}

export const toBanglaAmount = (paisa: number): string => {
  const taka = paisa / 100
  return "৳ " + toBanglaDigit(taka.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
}

export const getFirstWord = (name: string): string => {
  return name.trim().split(/\s+/)[0] || ""
}
