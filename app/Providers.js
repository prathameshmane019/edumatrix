"use client";

import { SessionProvider } from "next-auth/react";
import { NextUIProvider } from "@nextui-org/react";
import { Toaster } from 'sonner';
import { UserProvider } from "./context/UserContext";

export const AuthProvider = ({ children }) => {
  return (
    <SessionProvider>
      <NextUIProvider>
        <UserProvider>
          {children}
          <Toaster 
            richColors 
            position="top-right"
            closeButton
            expand
            visibleToasts={6}
          />
        </UserProvider>
      </NextUIProvider>
    </SessionProvider>
  );
};

export default AuthProvider;