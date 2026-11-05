import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    // Basic validation
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRe.test(email.trim())) {
      return NextResponse.json({ error: "সঠিক ইমেইল ঠিকানা দিন" }, { status: 400 })
    }

    // ponytail: DB checks, OTP generation, email sending - add when D1 connected
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
