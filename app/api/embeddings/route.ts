import { NextResponse } from "next/server"

const AI_SERVER = "https://abc123.ngrok.io/recognize"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const res = await fetch(AI_SERVER, {
      method: "POST",
      body: formData
    })

    const data = await res.json()

    return NextResponse.json(data)
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "AI server unreachable" },
      { status: 500 }
    )
  }
}
