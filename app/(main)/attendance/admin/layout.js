import Sidebar from "@/app/components/sidebar"
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { headers } from "next/headers"; 
import getCallbackUrl from "@/lib/callbackURL";

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role
  const callbackUrl = await getCallbackUrl();

  if (!(role=== "admin" || "superadmin") || !session) {
    console.log("unauthorised") 
    redirect(`/login?callback=${callbackUrl} `);
   }
  return (
  <div className="flex h-screen">
    <Sidebar />
    <div className="w-full h-screen overflow-y-auto " >
        {children}
      </div> 
      </div>
  );
}
