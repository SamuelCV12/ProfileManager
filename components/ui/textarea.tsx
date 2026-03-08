import * as React from "react"
import { cn } from "./utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-base text-black outline-none transition-[color,box-shadow] placeholder:text-gray-400 focus-visible:border-[#5FD3BC] focus-visible:ring-[3px] focus-visible:ring-[#7FFFD4]/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }