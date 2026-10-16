// api/[code]/index.js - 12개 제한 회피용 통합 핸들러
import { createTripHandler as createKayaHandler } from "../_lib/kayaHandler.js";
import { createTripHandler as createTicketHandler } from "../_lib/ticketHandler.js";
import { createTripHandler as createTripsHandler } from "../_lib/tripsHandler.js";

export default function handler(req, res) {
  const { code } = req.query; // k3596, t3596, 3596 등
  const c = String(code || "").toLowerCase();

  let fn;
  if (c.startsWith('k')) {
    fn = createKayaHandler(code);
  } else if (c.startsWith('t')) {
    fn = createTicketHandler(code);
  } else {
    fn = createTripsHandler(code); // 3596 같은 숫자만
  }
  return fn(req, res);
}
