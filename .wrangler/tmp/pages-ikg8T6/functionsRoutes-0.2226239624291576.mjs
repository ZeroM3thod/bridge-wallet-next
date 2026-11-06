import { onRequestGet as __api_auth_session_ts_onRequestGet } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\api\\auth\\session.ts"
import { onRequestPost as __api_auth_signin_ts_onRequestPost } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\api\\auth\\signin.ts"
import { onRequestPost as __api_deposits_create_ts_onRequestPost } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\api\\deposits\\create.ts"
import { onRequestGet as __api_deposits_status_ts_onRequestGet } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\api\\deposits\\status.ts"
import { onRequestPost as __api_deposits_webhook_ts_onRequestPost } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\api\\deposits\\webhook.ts"
import { onRequestPost as __api_notify_ts_onRequestPost } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\api\\notify.ts"
import { onRequestPost as __api_send_code_ts_onRequestPost } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\api\\send-code.ts"
import { onRequestPost as __api_signup_ts_onRequestPost } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\api\\signup.ts"
import { onRequest as ___middleware_ts_onRequest } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\_middleware.ts"

export const routes = [
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
      routePath: "/api/notify",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_notify_ts_onRequestPost],
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
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_ts_onRequest],
      modules: [],
    },
  ]