"use client"

import { MapIcon, ListFilter } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ToggleViewsProps {
  activeView: "map" | "list"
  onViewChange: (view: "map" | "list") => void
}

export function ToggleViews({ activeView, onViewChange }: ToggleViewsProps) {
  return (
    <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm">
      <Button
        variant={activeView === "map" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("map")}
      >
        <MapIcon className="h-4 w-4 mr-2" />
        Map
      </Button>
      <Button
        variant={activeView === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("list")}
      >
        <ListFilter className="h-4 w-4 mr-2" />
        List
      </Button>
    </div>
  )
}