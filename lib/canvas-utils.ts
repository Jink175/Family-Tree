export default function generateThumbnail(canvas: HTMLCanvasElement) {
  const temp = document.createElement("canvas")
  temp.width = 400
  temp.height = 250

  const ctx = temp.getContext("2d")!
  ctx.drawImage(canvas, 0, 0, temp.width, temp.height)

  return temp.toDataURL("image/png", 0.6)
}
