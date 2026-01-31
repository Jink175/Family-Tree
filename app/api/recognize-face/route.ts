import { NextResponse } from "next/server"

const AI_SERVER = "https://6c0cbcf7b1d2.ngrok-free.app/recognize-face"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const res = await fetch(AI_SERVER, {
      method: "POST",
      body: formData
    })

    const rawText = await res.text()
    console.log("RAW:", rawText)

    let data
    try {
      data = JSON.parse(rawText)
    } catch {
      throw new Error("Server không trả JSON: " + rawText)
    }

    if (!res.ok) {
      throw new Error(data.error || rawText)
    }

    try {
      const data = JSON.parse(rawText)
      return NextResponse.json(data)
    } catch {
      console.error("RAW AI SERVER RESPONSE:", rawText)
      return NextResponse.json(
        { error: "AI server không trả JSON hợp lệ", raw: rawText },
        { status: 500 }
      )
    }
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Không kết nối được AI server" },
      { status: 500 }
    )
  }
}
