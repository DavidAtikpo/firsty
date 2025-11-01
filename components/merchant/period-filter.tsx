"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"

interface PeriodFilterProps {
  onPeriodChange: (days: number | null) => void
}

export function PeriodFilter({ onPeriodChange }: PeriodFilterProps) {
  const [activePeriod, setActivePeriod] = useState<number | null>(null)

  const handlePreset = (days: number) => {
    setActivePeriod(days === activePeriod ? null : days)
    onPeriodChange(days === activePeriod ? null : days)
  }

  const formatPeriodLabel = (days: number) => {
    if (days === 7) return "7 jours"
    if (days === 30) return "30 jours"
    if (days === 90) return "90 jours"
    if (days === 365) return "1 an"
    return `${days} jours`
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant={activePeriod === 7 ? "default" : "outline"}
        size="sm"
        onClick={() => handlePreset(7)}
      >
        7 jours
      </Button>
      <Button
        variant={activePeriod === 30 ? "default" : "outline"}
        size="sm"
        onClick={() => handlePreset(30)}
      >
        30 jours
      </Button>
      <Button
        variant={activePeriod === 90 ? "default" : "outline"}
        size="sm"
        onClick={() => handlePreset(90)}
      >
        90 jours
      </Button>
      <Button
        variant={activePeriod === 365 ? "default" : "outline"}
        size="sm"
        onClick={() => handlePreset(365)}
      >
        1 an
      </Button>
      {activePeriod && (
        <Button variant="ghost" size="sm" onClick={() => handlePreset(activePeriod)}>
          Tout
        </Button>
      )}
    </div>
  )
}

