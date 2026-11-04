"use client"

import { useEffect, useState } from "react"

const links = [
  { href: "#how", label: "How it Works" },
  { href: "#assets", label: "Supported Assets" },
  { href: "#merchants", label: "For Merchants" },
]

/** Navigation for small screens, where the inline nav links are hidden. */
export function MobileMenu() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <div className="mobile-menu">
      <button
        type="button"
        className="mobile-menu-button"
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen(!open)}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {open ? (
            <path
              d="m6 6 12 12M18 6 6 18"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M4 8h16M4 16h16"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>
      {open && (
        <>
          <button
            type="button"
            className="mobile-menu-scrim"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={() => setOpen(false)}
          />
          <div
            id="mobile-menu-panel"
            role="navigation"
            className="mobile-menu-panel"
            aria-label="Mobile navigation"
          >
            {links.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
