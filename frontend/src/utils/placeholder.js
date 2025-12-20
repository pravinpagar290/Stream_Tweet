export function placeholderDataUrl(
  width = 300,
  height = 200,
  text = "No Image"
) {
  const fontSize = Math.max(12, Math.floor(Math.min(width, height) / 10));
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>
    <rect width='100%' height='100%' fill='#1f2937' />
    <text x='50%' y='50%' fill='#9ca3af' font-family='Arial, Helvetica, sans-serif' font-size='${fontSize}' dominant-baseline='middle' text-anchor='middle'>${text}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
