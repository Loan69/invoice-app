"use client";

import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full bg-blue-600 px-4 py-3">
      <div className="mx-auto flex max-w-5xl items-center gap-3">
        <Image
          src="/images/Logo_app.png"
          alt="Invoice App Logo"
          width={64}
          height={64}
        />
        <h1 className="text-white text-3xl font-semibold tracking-tight">
          Alfred-Facture
        </h1>
      </div>
    </header>
  );
}
