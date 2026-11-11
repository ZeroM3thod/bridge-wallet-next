import { onRequestPost as __api_auth_logout_ts_onRequestPost } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\api\\auth\\logout.ts"
import { onRequestGet as __api_auth_session_ts_onRequestGet } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\api\\auth\\session.ts"
import { onRequestPost as __api_auth_signin_ts_onRequestPost } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\api\\auth\\signin.ts"
import { onRequestPost as __api_cron_credit_daily_profits_ts_onRequestPost } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\api\\cron\\credit-daily-profits.ts"
import { onRequestPost as __api_deposits_create_ts_onRequestPost } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\api\\deposits\\create.ts"
import { onRequestGet as __api_deposits_status_ts_onRequestGet } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\api\\deposits\\status.ts"
import { onRequestPost as __api_deposits_webhook_ts_onRequestPost } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\api\\deposits\\webhook.ts"
import { onRequestPost as __api_packages_purchase_ts_onRequestPost } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\api\\packages\\purchase.ts"
import { onRequest as __api_admin_packages_ts_onRequest } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\api\\admin\\packages.ts"
import { onRequest as __api_admin_referrals_ts_onRequest } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\api\\admin\\referrals.ts"
import { onRequestGet as __api_dashboard_ts_onRequestGet } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\api\\dashboard.ts"
import { onRequestPost as __api_notify_ts_onRequestPost } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\api\\notify.ts"
import { onRequestGet as __api_packages_ts_onRequestGet } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\api\\packages.ts"
import { onRequestGet as __api_profile_ts_onRequestGet } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\api\\profile.ts"
import { onRequestGet as __api_referrals_ts_onRequestGet } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\api\\referrals.ts"
import { onRequestPost as __api_send_code_ts_onRequestPost } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\api\\send-code.ts"
import { onRequestPost as __api_signup_ts_onRequestPost } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\api\\signup.ts"
import { onRequestGet as __api_withdrawal_password_ts_onRequestGet } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\api\\withdrawal-password.ts"
import { onRequestPost as __api_withdrawal_password_ts_onRequestPost } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\api\\withdrawal-password.ts"
import { onRequestGet as __api_work_ts_onRequestGet } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\api\\work.ts"
import { onRequest as __api_team_ts_onRequest } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\api\\team.ts"
import { onRequest as __superadmin__middleware_ts_onRequest } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\superadmin\\_middleware.ts"
import { onRequest as ___middleware_ts_onRequest } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\_middleware.ts"

export const routes = [
    {
      routePath: "/api/auth/logout",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_logout_ts_onRequestPost],
    },
  {
      routePath: "/api/auth/session",
      mountPath: "/api/auth",
      method: "GET",
      middlewares: [],
      modules: [__api_auth_session_ts_onRequestGet],
    },
  {
      routePath: "/api/auth/signin",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_signin_ts_onRequestPost],
    },
  {
      routePath: "/api/cron/credit-daily-profits",
      mountPath: "/api/cron",
      method: "POST",
      middlewares: [],
      modules: [__api_cron_credit_daily_profits_ts_onRequestPost],
    },
  {
      routePath: "/api/deposits/create",
      mountPath: "/api/deposits",
      method: "POST",
      middlewares: [],
      modules: [__api_deposits_create_ts_onRequestPost],
    },
  {
      routePath: "/api/deposits/status",
      mountPath: "/api/deposits",
      method: "GET",
      middlewares: [],
      modules: [__api_deposits_status_ts_onRequestGet],
    },
  {
      routePath: "/api/deposits/webhook",
      mountPath: "/api/deposits",
      method: "POST",
      middlewares: [],
      modules: [__api_deposits_webhook_ts_onRequestPost],
    },
  {
      routePath: "/api/packages/purchase",
      mountPath: "/api/packages",
      method: "POST",
      middlewares: [],
      modules: [__api_packages_purchase_ts_onRequestPost],
    },
  {
      routePath: "/api/admin/packages",
      mountPath: "/api/admin",
      method: "",
      middlewares: [],
      modules: [__api_admin_packages_ts_onRequest],
    },
  {
      routePath: "/api/admin/referrals",
      mountPath: "/api/admin",
      method: "",
      middlewares: [],
      modules: [__api_admin_referrals_ts_onRequest],
    },
  {
      routePath: "/api/dashboard",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_dashboard_ts_onRequestGet],
    },
  {
      routePath: "/api/notify",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_notify_ts_onRequestPost],
    },
  {
      routePath: "/api/packages",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_packages_ts_onRequestGet],
    },
  {
      routePath: "/api/profile",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_profile_ts_onRequestGet],
    },
  {
      routePath: "/api/referrals",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_referrals_ts_onRequestGet],
    },
  {
      routePath: "/api/send-code",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_send_code_ts_onRequestPost],
    },
  {
      routePath: "/api/signup",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_signup_ts_onRequestPost],
    },
  {
      routePath: "/api/withdrawal-password",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_withdrawal_password_ts_onRequestGet],
    },
  {
      routePath: "/api/withdrawal-password",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_withdrawal_password_ts_onRequestPost],
    },
  {
      routePath: "/api/work",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_work_ts_onRequestGet],
    },
  {
      routePath: "/api/team",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_team_ts_onRequest],
    },
  {
      routePath: "/superadmin",
      mountPath: "/superadmin",
      method: "",
      middlewares: [__superadmin__middleware_ts_onRequest],
      modules: [],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_ts_onRequest],
      modules: [],
    },
  ]