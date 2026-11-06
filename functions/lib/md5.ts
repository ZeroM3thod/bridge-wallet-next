const shifts = [7,12,17,22,5,9,14,20,4,11,16,23,6,10,15,21]
const constants = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) >>> 0)

export function md5(input: string): string {
  const bytes = new TextEncoder().encode(input)
  const length = bytes.length
  const paddedLength = Math.ceil((length + 9) / 64) * 64
  const data = new Uint8Array(paddedLength)
  data.set(bytes)
  data[length] = 0x80
  const view = new DataView(data.buffer)
  view.setUint32(paddedLength - 8, (length * 8) >>> 0, true)
  view.setUint32(paddedLength - 4, Math.floor(length / 0x20000000), true)
  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476
  for (let offset = 0; offset < paddedLength; offset += 64) {
    let a = a0, b = b0, c = c0, d = d0
    for (let i = 0; i < 64; i++) {
      let f: number, g: number, shift: number
      if (i < 16) { f = (b & c) | (~b & d); g = i; shift = shifts[i % 4] }
      else if (i < 32) { f = (d & b) | (~d & c); g = (5 * i + 1) % 16; shift = shifts[4 + i % 4] }
      else if (i < 48) { f = b ^ c ^ d; g = (3 * i + 5) % 16; shift = shifts[8 + i % 4] }
      else { f = c ^ (b | ~d); g = (7 * i) % 16; shift = shifts[12 + i % 4] }
      const word = view.getUint32(offset + g * 4, true)
      const sum = (a + f + constants[i] + word) >>> 0
      const rotated = (sum << shift) | (sum >>> (32 - shift))
      ;[a, d, c, b] = [d, c, b, (b + rotated) >>> 0]
    }
    a0 = (a0 + a) >>> 0; b0 = (b0 + b) >>> 0; c0 = (c0 + c) >>> 0; d0 = (d0 + d) >>> 0
  }
  return [a0, b0, c0, d0].map(n => [0,1,2,3].map(i => ((n >>> (i * 8)) & 255).toString(16).padStart(2, '0')).join('')).join('')
}
