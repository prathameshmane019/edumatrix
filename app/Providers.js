"use client";
import { SessionProvider } from "next-auth/react";
import {NextUIProvider} from "@nextui-org/react";
import { Toaster } from 'sonner'
import { UserProvider } from "./context/UserContext";
export const AuthProvider = ({ children }) => {
  return ( 
  <NextUIProvider>
    
    <SessionProvider>
      <UserProvider>{children}</UserProvider>
    <Toaster richColors /></SessionProvider>
    </NextUIProvider>)
};
