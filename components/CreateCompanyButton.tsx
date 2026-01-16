'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import CreateCompanyModal from './CreateCompanyModal'

export default function CreateCompanyButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary flex items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Créer une entreprise
      </button>
      <CreateCompanyModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
