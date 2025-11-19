"use client"

import { LocalAuthLiaison } from "@/components/services"

export default function LocalAuthorityLiaisonPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <LocalAuthLiaison stage="content" />
    </div>
  )
}
