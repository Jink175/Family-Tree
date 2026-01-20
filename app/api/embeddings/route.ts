import fs from "fs"
import path from "path"

export async function GET() {
  const filePath = path.join(process.cwd(), "public/data/all_embeddings.json")
  const data = fs.readFileSync(filePath, "utf-8")
  const embeddings = JSON.parse(data)
  return new Response(JSON.stringify(embeddings))
}
