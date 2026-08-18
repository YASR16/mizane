import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-white shadow-[0_1px_0_rgba(20,24,31,0.04)]",
        className,
      )}
      {...props}
    />
  );
}
