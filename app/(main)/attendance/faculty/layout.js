import Sidebar from "@/app/components/sidebar"
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import getCallbackUrl from "@/lib/callbackURL";

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role


  if (!session) {
    console.log("unauthorised")
    const callbackUrl = await getCallbackUrl();

    redirect(`/login?callback=${callbackUrl} `);
  }
  else if (!role == "faculty") {
    redirect(`/login`);
  }
  
  return (<div className="flex">
    <Sidebar />
    <div className="w-full h-screen overflow-y-auto" >
      {children}
    </div>
  </div>
  );
}
