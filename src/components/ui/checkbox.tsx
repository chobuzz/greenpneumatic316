"use client"

import * as React from "react"
import { Check } from "lucide-react"

interface CheckboxProps {
    id?: string
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
    className?: string
}

export function Checkbox({ id, checked, onCheckedChange, className = "" }: CheckboxProps) {
    return (
        <div
            id={id}
            onClick={(e) => {
                e.stopPropagation();
                onCheckedChange?.(!checked);
            }}
            className={`
        flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50
        ${checked ? 'bg-primary border-primary text-white' : 'bg-transparent'}
        ${className}
      `}
        >
            {checked && <Check className="h-4 w-4" />}
        </div>
    )
}
