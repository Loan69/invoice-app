"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // on écoute le scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // on détermine si on est sur login / signin
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signin";
    // On pourra ajouter en ajouter d'autres ici

  const linkVariant = {
    rest: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.97 },
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-gradient-to-r from-blue-700 to-indigo-700 shadow-md"
          : "bg-gradient-to-r from-blue-600 to-indigo-600"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        {/* Logo + Nom */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-15 w-30 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Image
              src="/images/Logo_app.png"
              alt="Invoice App Logo"
              width={100}
              height={100}
              className="object-contain"
            />
          </div>
          <span className="text-xl font-semibold text-white">
            Alfred-Facture
          </span>
        </Link>

        {/* Menu desktop — masqué sur pages login/signin */}
        {!isAuthPage && (
          <nav className="hidden md:flex items-center gap-6">
            {[
              { href: "/dashboard", label: "Tableau de bord" },
              { href: "/clients/new", label: "Ajouter un client" },
              { href: "/quotes/new", label: "Créer un devis" },
              { href: "/invoices/new", label: "Créer une facture" },
              { href: "/settings", label: "Paramètres" },
            ].map((link) => (
              <motion.div
                key={link.href}
                variants={linkVariant}
                whileHover="hover"
                whileTap="tap"
              >
                <Link
                  href={link.href}
                  className="text-sm text-white/90 hover:text-white"
                >
                  {link.label}  
                </Link>
              </motion.div>
            ))}
            <motion.div variants={linkVariant} whileHover="hover" whileTap="tap">
              <LogoutButton />
            </motion.div>
          </nav>
        )}

        {/* Burger mobile — masqué aussi si login/signin */}
        {!isAuthPage && (
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-white focus:outline-none"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {!isAuthPage && open && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-gradient-to-r from-blue-600 to-indigo-600 px-6 pb-4"
          >
            <div className="flex flex-col gap-3">
              {[
                { href: "/dashboard", label: "Tableau de bord" },
                { href: "/clients", label: "Clients" },
                { href: "/invoices", label: "Factures" },
                { href: "/settings", label: "Paramètres" },
              ].map((link) => (
                <motion.div
                  key={link.href}
                  variants={linkVariant}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-white/90 hover:text-white text-sm"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div variants={linkVariant} whileHover="hover" whileTap="tap">
                <Button variant="secondary" className="text-sm w-fit">
                  Déconnexion
                </Button>
              </motion.div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
