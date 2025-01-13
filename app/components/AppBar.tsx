"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function AppBar() {
  const { data: session } = useSession(); // Use hook synchronously

  return (
    <nav className="flex justify-between items-center p-4 bg-white shadow-sm">
      <div className="text-xl font-bold">Todoist</div>
      {session ? (
        <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors" onClick={()=>signOut()}>
          Logout
        </button>
      ) : (
        <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors" onClick={()=>signIn()}>
          Login
        </button>
      )}
    </nav>
  );
}
