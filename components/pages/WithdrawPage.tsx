import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogPortal, DialogOverlay, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Content as DialogPrimitiveContent } from "@radix-ui/react-dialog"
import Icon from "@/components/app/Icon"
import { useAppState } from "@/components/app/AppState"
import { walletLogos } from "@/lib/wallet-logos"
import { normalizeDigits, validWalletNumber, walletProviders, type WalletProvider } from "@/lib/withdrawal"
import { toBengaliDigits, parseBengaliNumber, money } from "@/lib/app-format"
import type { WithdrawalRecord } from "@/lib/app-types"
export default function WithdrawPage() {
  const { showToast: action, changePage: onNavigate } = useAppState()
  const [balance, setBalance] = useState(0)
  const [wallets, setWallets] = useState<any[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [settings, setSettings] = useState({minimum_amount:1000,fee_percent:2})
  const [hasPassword, setHasPassword] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [busy, setBusy] = useState(false)
  const load = async () => { const r=await fetch('/api/withdrawals',{credentials:'include',cache:'no-store'}); const d=await r.json(); if(!r.ok) throw Error(d.error); setBalance(d.balance);setWallets(d.wallets);setWithdrawals(d.withdrawals);setSettings(d.settings??settings);setHasPassword(d.hasPassword);setLoaded(true) }
  useEffect(()=>{load().catch(()=>{setLoaded(true);action('তথ্য লোড হয়নি')});const updated=()=>{setHasPassword(true);setShowPasswordPrompt(false)};window.addEventListener('withdrawal-password-updated',updated);return()=>window.removeEventListener('withdrawal-password-updated',updated)},[])
  const addWalletClick = async () => { try { await load(); const r=await fetch('/api/withdrawal-password',{credentials:'include',cache:'no-store'});const d=await r.json();if(!r.ok)throw Error(d.error);setHasPassword(d.hasPassword);if(d.hasPassword)setShowAddWallet(true);else setShowPasswordPrompt(true) } catch(e) { action(e instanceof Error?e.message:'তথ্য লোড হয়নি') } }

  const [showAddWallet, setShowAddWallet] = useState(false)
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)
  const [provider, setProvider] = useState<WalletProvider>("bkash")
  const [account, setAccount] = useState("")
  const [walletPassword, setWalletPassword] = useState("")
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [amount, setAmount] = useState(1000)
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState<Pick<WithdrawalRecord, "amount" | "fee" | "net" | "provider" | "account"> | null>(null)

  const selected =
    wallets.find((wallet) => wallet.id === selectedWallet) ?? wallets[0]
  const totals = {fee:Math.round(amount*(settings.fee_percent??2))/100,net:amount-Math.round(amount*(settings.fee_percent??2))/100}

  const submitWallet = () => {
    if (!hasPassword) { setShowAddWallet(false); setShowPasswordPrompt(true); return }
    if (!validWalletNumber(provider, account)) {
      action("সঠিক অ্যাকাউন্ট নম্বর লিখুন")
      return
    }
    if (walletPassword.length < 4) {
      action("উত্তোলন পাসওয়ার্ড লিখুন")
      return
    }
    void (async()=>{try{setBusy(true);const r=await fetch('/api/withdrawals',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'wallet',provider,account:normalizeDigits(account),password:walletPassword})});const d=await r.json();if(!r.ok)throw Error(d.error);await load();setShowAddWallet(false);setAccount('');setWalletPassword('');action('ওয়ালেট সংরক্ষিত হয়েছে')}catch(e){action(e instanceof Error?e.message:'ব্যর্থ')}finally{setBusy(false)}})()
  }

  const submitWithdrawal = () => {
    if (!selected) {
      action("আগে একটি ওয়ালেট যোগ করুন")
      return
    }
    if (!Number.isFinite(amount) || amount < settings.minimum_amount || amount > balance || Math.round(amount * 100) !== amount * 100) {
      action(
        amount > balance
          ? "পর্যাপ্ত সঞ্চয় নেই"
          : `সর্বনিম্ন ৳${settings.minimum_amount} উত্তোলন করতে হবে`,
      )
      return
    }
    void (async()=>{try{setBusy(true);const r=await fetch('/api/withdrawals',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'withdraw',walletId:selected.id,amount,password})});const d=await r.json();if(!r.ok)throw Error(d.error);setConfirmation({amount:d.amount,fee:d.fee,net:d.net,provider:selected.provider,account:selected.account});setPassword('');await load()}catch(e){action(e instanceof Error?e.message:'ব্যর্থ')}finally{setBusy(false)}})()
  }

  return (
    <main className="home-page office-page page-content withdraw-page">
      <section className="office-hero withdraw-hero">
        <div className="office-welcome">
          <span>অর্থ উত্তোলন</span>
          <h1>আপনার ওয়ালেটে টাকা পাঠান</h1>
          <p>বিকাশ ও নগদে উত্তোলন করুন</p>
        </div>
        <div className="office-balance">
          <span>
            <Icon name="wallet" size={26} />
          </span>
          <div>
            <small>ব্যবহারযোগ্য সঞ্চয়</small>
            <strong>{money(balance)}</strong>
          </div>
        </div>
      </section>

      <section className="withdraw-wallets">
        <div className="withdraw-section-head">
          <h2>সংরক্ষিত ওয়ালেট</h2>
          <button disabled={!loaded || wallets.length >= 2} onClick={() => void addWalletClick()}>
            <Icon name="deposit" size={15} />
            ওয়ালেট যোগ করুন
          </button>
        </div>
        {wallets.length === 0 ? (
          <button
            className="withdraw-empty"
            onClick={() => void addWalletClick()}
          >
            <Icon name="wallet" size={28} />
            <b>কোনো ওয়ালেট সংরক্ষিত নেই</b>
            <small>উত্তোলনের জন্য আগে একটি ওয়ালেট যোগ করুন</small>
          </button>
        ) : (
          <div className="withdraw-wallet-list">
            {wallets.map((wallet) => {
              const meta = walletProviders.find(
                (item) => item.id === wallet.provider,
              )
              if (!meta) return null
              const active = selected?.id === wallet.id
              return (
                <button
                  className={active ? "withdraw-wallet active" : "withdraw-wallet"}
                  key={wallet.id}
                  onClick={() => setSelectedWallet(wallet.id)}
                >
                  <span className={`wallet-provider ${wallet.provider}`}>
                    <img src={walletLogos[wallet.provider]} alt={`${meta.english} লোগো`} />
                  </span>
                  <div>
                    <strong>{meta.name}</strong>
                    <small>{toBengaliDigits(wallet.account)}</small>
                  </div>
                  {active && (
                    <span className="wallet-check">
                      <Icon name="check" size={15} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </section>

      <section className="withdraw-form">
        <label className="office-amount-field">
          <span>উত্তোলনের পরিমাণ</span>
          <div>
            <b>৳</b>
            <input
              inputMode="numeric"
              onChange={(event) =>
                setAmount(parseBengaliNumber(event.target.value))
              }
              type="text"
              value={toBengaliDigits(amount)}
            />
          </div>
        </label>
        <div className="office-amount-presets">
          {[1000, 2500, 5000].map((preset) => (
            <button key={preset} onClick={() => setAmount(preset)}>
              {money(preset)}
            </button>
          ))}
        </div>
        <div className="withdraw-totals">
          <div>
            <span>উত্তোলনের পরিমাণ</span>
            <b>{money(amount)}</b>
          </div>
          <div>
            <span>সার্ভিস চার্জ ({settings.fee_percent}%)</span>
            <b>{money(totals.fee)}</b>
          </div>
          <div className="net">
            <span>ওয়ালেটে পাবেন</span>
            <b>{money(totals.net)}</b>
          </div>
        </div>
        <label className="office-amount-field">
          <span>উত্তোলন পাসওয়ার্ড</span>
          <div>
            <input
              onChange={(event) => setPassword(event.target.value)}
              placeholder="উত্তোলন পাসওয়ার্ড লিখুন"
              type="password"
              value={password}
            />
          </div>
        </label>
        <button className="withdraw-submit" onClick={submitWithdrawal}>
          {busy ? 'অপেক্ষা করুন…' : 'উত্তোলন নিশ্চিত করুন'}
        </button>
        <small className="withdraw-note">
          সর্বনিম্ন উত্তোলন ৳{toBengaliDigits(settings.minimum_amount)} • {toBengaliDigits(settings.fee_percent)}% সার্ভিস চার্জ প্রযোজ্য
        </small>
        <div className="withdraw-rules">
          <h3>
            <Icon name="clock" size={13} />
            <span>উত্তোলনের নিয়ম</span>
          </h3>
          <ul>
            <li>
              <span>উত্তোলন সময়</span>
              <b>সকাল ১০টা – দুপুর ৩টা</b>
            </li>
            <li>
              <span>প্রসেসিং সময়</span>
              <b>১ ঘণ্টা – ২৪ ঘণ্টা</b>
            </li>
            <li>
              <span>সর্বনিম্ন উত্তোলন</span>
              <b>{money(settings.minimum_amount)}</b>
            </li>
            <li>
              <span>সার্ভিস চার্জ</span>
              <b>{toBengaliDigits(settings.fee_percent)}%</b>
            </li>
            <li>
              <span>দৈনিক সীমা</span>
              <b>৩ টি আবেদন</b>
            </li>
          </ul>
        </div>
      </section>

      {withdrawals.length > 0 && (
        <section className="withdraw-history">
          <h2>উত্তোলনের রেকর্ড</h2>
          {withdrawals.map((record) => {
            const meta = walletProviders.find(
              (item) => item.id === record.provider,
            )
            if (!meta) return null
            return (
              <article key={record.id}>
                <span className={`wallet-provider ${record.provider}`}>
                  <img src={walletLogos[record.provider]} alt={`${meta.english} লোগো`} />
                </span>
                <div>
                  <strong>
                    {meta.name} • {toBengaliDigits(record.account)}
                  </strong>
                  <small>{record.date}</small>
                </div>
                <div className="withdraw-record-amount">
                  <b>{money(record.net)}</b>
                  <small>{record.status}</small>
                </div>
              </article>
            )
          })}
        </section>
      )}

      <Dialog open={confirmation !== null} onOpenChange={(open) => { if (!open) setConfirmation(null) }}>
        <DialogPortal>
          <DialogOverlay className="withdraw-success-overlay" />
          <DialogPrimitiveContent className="withdraw-success-dialog">
            <span className="withdraw-success-icon" aria-hidden="true"><Icon name="check" size={25} strokeWidth={3} /></span>
            <DialogTitle className="withdraw-success-title">আবেদন সফলভাবে গৃহীত হয়েছে!</DialogTitle>
            <DialogDescription className="withdraw-success-description">আপনার উত্তোলনের অনুরোধটি প্রক্রিয়াধীন রয়েছে, খুব শীঘ্রই অর্থ একাউন্টে পৌঁছাবে।</DialogDescription>
            {confirmation && (
              <dl className="withdraw-success-details">
                <div><dt>পেমেন্ট মাধ্যম:</dt><dd>{walletProviders.find((item) => item.id === confirmation.provider)?.name}</dd></div>
                <div><dt>উত্তোলনের পরিমাণ:</dt><dd>{money(confirmation.amount)}</dd></div>
                <div className="fee"><dt>প্রসেসিং ফি (৬%):</dt><dd>{money(confirmation.fee)}</dd></div>
                <div className="net"><dt>প্রাপ্ত নিট অর্থ:</dt><dd>{money(confirmation.net)}</dd></div>
                <div className="account"><dt>গ্রাহক নম্বর:</dt><dd>{toBengaliDigits(confirmation.account)}</dd></div>
              </dl>
            )}
            <Button className="withdraw-success-home" onClick={() => { setConfirmation(null); onNavigate("home") }}>মূল পাতায় ফিরে যান</Button>
          </DialogPrimitiveContent>
        </DialogPortal>
      </Dialog>

      {showPasswordPrompt && (
        <div className="purchase-modal-backdrop" onClick={() => setShowPasswordPrompt(false)}>
          <section className="purchase-modal office-money-modal" role="dialog" aria-modal="true" aria-labelledby="withdraw-password-prompt-title" onClick={(event) => event.stopPropagation()}>
            <div className="purchase-modal-head"><div><span><Icon name="wallet" size={22} /></span><div><small>অ্যাকাউন্ট নিরাপত্তা</small><h2 id="withdraw-password-prompt-title">উত্তোলন পাসওয়ার্ড প্রয়োজন</h2></div></div><button aria-label="বন্ধ করুন" onClick={() => setShowPasswordPrompt(false)}><Icon name="close" size={20} /></button></div>
            <p className="wallet-personal-rule">ওয়ালেট যোগ করার আগে উত্তোলন পাসওয়ার্ড সেট করুন। এরপর ফিরে এসে ওয়ালেট যোগ করতে পারবেন।</p>
            <div className="purchase-actions"><button className="cancel" onClick={() => setShowPasswordPrompt(false)}>পরে করব</button><button className="confirm" onClick={() => { setShowPasswordPrompt(false); onNavigate('wpassword') }}>পাসওয়ার্ড সেট করুন</button></div>
          </section>
        </div>
      )}

      {showAddWallet && (
        <div
          className="purchase-modal-backdrop"
          onClick={() => setShowAddWallet(false)}
        >
          <section
            aria-modal="true"
            className="purchase-modal office-money-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="purchase-modal-head">
              <div>
                <span>
                  <Icon name="wallet" size={22} />
                </span>
                <div>
                  <small>নিরাপদ উত্তোলনের জন্য</small>
                  <h2>ওয়ালেট যোগ করুন</h2>
                </div>
              </div>
              <button
                aria-label="বন্ধ করুন"
                onClick={() => setShowAddWallet(false)}
              >
                <Icon name="close" size={20} />
              </button>
            </div>
            <div className="withdraw-provider-grid">
              {walletProviders.map((item) => (
                <Button
                  variant="ghost"
                  aria-pressed={provider === item.id}
                  className={provider === item.id ? "active" : ""}
                  key={item.id}
                  onClick={() => setProvider(item.id)}
                >
                  <span className="wallet-provider">
                    <img src={walletLogos[item.id]} alt={`${item.english} লোগো`} />
                  </span>
                  <b>{item.name}</b>
                </Button>
              ))}
            </div>
            <p className="wallet-personal-rule">শুধুমাত্র বিকাশ ও নগদের ব্যক্তিগত নম্বর গ্রহণযোগ্য। এজেন্ট বা মার্চেন্ট নম্বর গ্রহণযোগ্য নয়।</p>
            <label className="office-amount-field">
              <span>অ্যাকাউন্ট নম্বর</span>
              <div>
                <input
                  inputMode="numeric"
                  onChange={(event) => setAccount(event.target.value)}
                  placeholder="01XXXXXXXXX"
                  type="text"
                  value={account}
                />
              </div>
            </label>
            <label className="office-amount-field">
              <span>উত্তোলন পাসওয়ার্ড</span>
              <div>
                <input
                  onChange={(event) => setWalletPassword(event.target.value)}
                  placeholder="উত্তোলন পাসওয়ার্ড লিখুন"
                  type="password"
                  value={walletPassword}
                />
              </div>
            </label>
            <p className="wallet-personal-rule">এখানো নতুন উত্তোলন পাসওয়ার্ড সেট করবেন না — আগে থেকেই থাকা উত্তোলন পাসওয়ার্ড লিখুন।</p>
            <div className="purchase-actions">
              <button
                className="cancel"
                onClick={() => setShowAddWallet(false)}
              >
                বাতিল করুন
              </button>
              <button className="confirm" disabled={busy} onClick={submitWallet}>
                সংরক্ষণ করুন
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
