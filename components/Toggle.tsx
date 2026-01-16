'use client'

import { useState } from 'react'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  id?: string
  'aria-label'?: string
}

export default function Toggle({ 
  checked, 
  onChange, 
  disabled = false,
  label,
  id,
  'aria-label': ariaLabel
}: ToggleProps) {
  const [isFocused, setIsFocused] = useState(false)
  const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`

  return (
    <label 
      htmlFor={toggleId}
      className={`flex items-center gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          id={toggleId}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-label={ariaLabel || label}
          className="sr-only"
        />
        <div
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out
            ${checked ? 'bg-primary' : 'bg-gray-300'}
            ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
            ${isFocused ? 'ring-2 ring-primary ring-offset-2' : ''}
          `}
          role="switch"
          aria-checked={checked}
          aria-disabled={disabled}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out
              ${checked ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </div>
      </div>
      {label && (
        <span className={`text-sm ${checked ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
          {label}
        </span>
      )}
    </label>
  )
}
