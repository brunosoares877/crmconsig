import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 bg-white rounded-lg shadow-lg border", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center mb-4",
        caption_label: "text-lg font-semibold text-gray-900",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-white border-gray-200 p-0 hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
        ),
        nav_button_previous: "absolute left-1 hover:bg-blue-50",
        nav_button_next: "absolute right-1 hover:bg-blue-50",
        table: "w-full border-collapse space-y-1 mt-4",
        head_row: "flex mb-2",
        head_cell:
          "text-gray-500 rounded-md w-10 h-10 font-medium text-sm flex items-center justify-center",
        row: "flex w-full mt-1",
        cell: cn(
          "h-10 w-10 text-center text-sm p-0 relative",
          "focus-within:relative focus-within:z-20",
          "[&:has([aria-selected].day-range-end)]:rounded-r-md",
          "[&:has([aria-selected].day-outside)]:bg-blue-50/50",
          "[&:has([aria-selected])]:bg-blue-50",
          "first:[&:has([aria-selected])]:rounded-l-md",
          "last:[&:has([aria-selected])]:rounded-r-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-normal aria-selected:opacity-100",
          "hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200",
          "rounded-md"
        ),
        day_range_end: "day-range-end",
        day_selected: cn(
          "bg-gradient-to-br from-blue-600 to-blue-700 text-white",
          "hover:bg-gradient-to-br hover:from-blue-700 hover:to-blue-800",
          "focus:bg-gradient-to-br focus:from-blue-700 focus:to-blue-800",
          "shadow-md font-semibold"
        ),
        day_today: cn(
          "bg-gradient-to-br from-orange-400 to-orange-500 text-white font-semibold",
          "hover:from-orange-500 hover:to-orange-600",
          "shadow-md"
        ),
        day_outside: cn(
          "day-outside text-gray-300 opacity-50",
          "aria-selected:bg-blue-50/50 aria-selected:text-gray-400 aria-selected:opacity-30"
        ),
        day_disabled: "text-gray-300 opacity-30 cursor-not-allowed",
        day_range_middle: cn(
          "aria-selected:bg-blue-50 aria-selected:text-blue-700"
        ),
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
