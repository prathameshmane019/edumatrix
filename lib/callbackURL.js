import { headers } from "next/headers";
 
async function getCallbackUrl() {
  const headersList = headers();
  const referer = headersList.get('referer');
  const url = new URL(referer);
  return url.pathname || '/modules'
}
export default getCallbackUrl;