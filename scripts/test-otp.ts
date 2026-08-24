import { sendOtp } from "../src/lib/auth";
import { verifyOtp } from "../src/lib/auth";
async function main(){
  console.log("sendOtp");
  try{
    const r = await sendOtp("09170003333");
    console.log("send result", r);
    const code = r.codeForDev!;
    console.log("verify", code);
    const v = await verifyOtp("09170003333", code);
    console.log("verify result", v);
  }catch(e){ console.error(e); }
}
main();
