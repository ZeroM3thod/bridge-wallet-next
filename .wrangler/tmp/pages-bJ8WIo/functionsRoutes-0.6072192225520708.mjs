import { onRequestPost as __api_send_code_ts_onRequestPost } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\api\\send-code.ts"
import { onRequestPost as __api_signup_ts_onRequestPost } from "C:\\Users\\KHAN GADGET\\Desktop\\bridge-wallet-next\\functions\\api\\signup.ts"

export const routes = [
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
  ]