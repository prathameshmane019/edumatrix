import Sidebar from "@/app/components/sidebar"
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import getCallbackUrl from "@/lib/callbackURL";

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);
  console.log(session);
  
  const role = session?.user?.role

  if ( !session || !role) {
    console.log("unauthorised") 
    const callbackUrl = await getCallbackUrl();
    redirect(`/login?callback=${callbackUrl} `);
   }
   else if(!role=="admin" || !role=="superadmin"){
    console.log("unauthorised");
    redirect(`/login`);
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
