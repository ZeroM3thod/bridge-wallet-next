PS C:\Users\KHAN GADGET\Desktop\bridge-wallet-next> npx wrangler pages deploy

 ⛅️ wrangler 4.157.0
────────────────────

X [ERROR] Must specify a directory of assets to deploy. Please specify the [<directory>] argument in the `pages deploy` command, or configure `pages_build_output_dir` in your Wrangler configuration file.


🪵  Logs were written to "C:\Users\KHAN GADGET\AppData\Roaming\xdg.config\.wrangler\logs\wrangler-2026-11-05_10-16-27_737.log"
Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), file src\win\async.c, line 76
PS C:\Users\KHAN GADGET\Desktop\bridge-wallet-next> npm run build

> bridge-wallet-next@0.1.0 build
> next build

   ▲ Next.js 15.3.5

   Creating an optimized production build ...
Failed to compile.

./components/app/AppState.tsx
Module not found: Can't resolve '@tanstack/react-router'

https://nextjs.org/docs/messages/module-not-found

Import trace for requested module:
./components/pages/ProfilePage.tsx
./app/profile/page.tsx

./components/ui/button.tsx
Module not found: Can't resolve 'class-variance-authority'

https://nextjs.org/docs/messages/module-not-found

Import trace for requested module:
./components/pages/ProfilePage.tsx
./app/profile/page.tsx

./components/ui/dialog.tsx
Module not found: Can't resolve 'lucide-react'

https://nextjs.org/docs/messages/module-not-found

Import trace for requested module:
./components/pages/WithdrawPage.tsx
./app/withdraw/page.tsx

./lib/api.server.ts
Module not found: Can't resolve '@tanstack/react-start'

https://nextjs.org/docs/messages/module-not-found

Import trace for requested module:
./components/pages/AuthPages.tsx
./app/signup/page.tsx

./lib/api.server.ts
Module not found: Can't resolve '../worker-lib/db'

https://nextjs.org/docs/messages/module-not-found

Import trace for requested module:
./components/pages/AuthPages.tsx
./app/signup/page.tsx


> Build failed because of webpack errors
PS C:\Users\KHAN GADGET\Desktop\bridge-wallet-next> 