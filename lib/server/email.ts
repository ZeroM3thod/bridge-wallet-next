type Env = {
  DB: D1Database
  RESEND_API_KEY: string
}

export async function sendOTPEmail(env: Env, email: string, code: string): Promise<void> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Bridge Wallet <noreply@yourdomain.com>',
      to: email,
      subject: 'আপনার যাচাইকরণ কোড',
      html: `
        <div style="font-family: 'Noto Serif Bengali', serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0875ec;">বরজাজ ওয়ালেট</h2>
          <p>আপনার যাচাইকরণ কোড:</p>
          <h1 style="background: #f0f9ff; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 8px;">${code}</h1>
          <p>এই কোডটি <strong>১০ মিনিটের</strong> জন্য বৈধ।</p>
          <p style="color: #666; font-size: 14px;">যদি আপনি এই কোডটি অনুরোধ না করে থাকেন, তাহলে এই ইমেইলটি উপেক্ষা করুন।</p>
        </div>
      `,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to send email')
  }
}
