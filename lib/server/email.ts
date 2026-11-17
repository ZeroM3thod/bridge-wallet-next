type Env = {
  DB: D1Database
  RESEND_API_KEY: string
}

export async function sendOTPEmail(env: Env, email: string, code: string): Promise<void> {
  const safeCode = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'GHM GROUPS <noreply@ghmgroups.com>',
      to: email,
      subject: 'GHM GROUPS — আপনার যাচাইকরণ কোড',
      html: `
        <div style="margin:0;background:#eef4fb;padding:32px 14px;font-family:Arial,'Noto Sans Bengali',sans-serif;color:#102a43">
          <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #dbe7f3;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(8,27,51,.08)">
            <div style="padding:26px 24px;text-align:center;background:#008ad9">
              <img src="https://ghmgroups.com/ghm-logo.png" width="180" alt="GHM Groups logo" style="display:block;width:180px;height:auto;max-width:100%;margin:0 auto;background:#fff;border-radius:8px;padding:8px;box-sizing:content-box" />
            </div>
            <div style="padding:30px 28px">
              <p style="margin:0 0 8px;color:#008ad9;font-size:12px;font-weight:700;letter-spacing:1px">ইমেইল যাচাইকরণ</p>
              <h1 style="margin:0 0 14px;font-size:24px;line-height:1.45;color:#102a43">আপনার যাচাইকরণ কোড</h1>
              <p style="margin:0 0 22px;font-size:15px;line-height:1.8;color:#526579">নিবন্ধন সম্পন্ন করতে নিচের কোডটি ব্যবহার করুন।</p>
              <div style="padding:20px 12px;border:1px solid #b9e4f8;border-radius:12px;background:#eff9ff;text-align:center;font-size:34px;font-weight:700;letter-spacing:10px;color:#0077bd">${safeCode}</div>
              <p style="margin:18px 0 0;font-size:14px;line-height:1.8;color:#526579">কোডটি <strong style="color:#18304b">১০ মিনিট</strong> পর্যন্ত বৈধ। কাউকে এই কোড দেবেন না।</p>
              <p style="margin:18px 0 0;padding-top:18px;border-top:1px solid #e8eef4;font-size:13px;line-height:1.8;color:#718096">আপনি এই কোড অনুরোধ না করলে, এই ইমেইলটি উপেক্ষা করুন।</p>
            </div>
            <div style="padding:16px 24px;text-align:center;background:#081b33;color:#d7e8f5;font-size:12px">© ২০২৬ · স্বয়ংক্রিয় বার্তা, উত্তর দেওয়ার প্রয়োজন নেই</div>
          </div>
        </div>
      `,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to send email')
  }
}
