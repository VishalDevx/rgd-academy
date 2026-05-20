"use client"

import * as React from "react"

interface RadioGroupProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

export function RadioGroup({ value, onValueChange, children, className = "" }: RadioGroupProps) {
  return (
    <div className={className} role="radiogroup">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<RadioGroupItemProps>, {
            checked: (child.props as RadioGroupItemProps).value === value,
            onChange: () => onValueChange((child.props as RadioGroupItemProps).value),
          })
        }
        return child
      })}
    </div>
  )
}

interface RadioGroupItemProps {
  value: string
  id?: string
  checked?: boolean
  onChange?: () => void
}

export function RadioGroupItem({ value, id, checked, onChange }: RadioGroupItemProps) {
  return (
    <input
      type="radio"
      id={id || value}
      name="radio-group"
      value={value}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 text-primary border-muted-foreground focus:ring-primary"
    />
  )
}
