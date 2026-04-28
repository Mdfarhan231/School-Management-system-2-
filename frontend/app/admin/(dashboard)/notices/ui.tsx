import React from 'react';
import { cn } from '@/lib/utils';
import { AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

export const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("rounded-xl border bg-card text-card-foreground shadow", className)} {...props} />;
export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className={cn("font-semibold leading-none tracking-tight", className)} {...props} />;
export const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("p-6 pt-0", className)} {...props} />;
export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex items-center p-6 pt-0", className)} {...props} />;

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'ghost' | 'secondary', size?: 'default' | 'sm' | 'lg' | 'icon' }>(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const variants = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700",
    outline: "border border-slate-200 bg-transparent hover:bg-slate-100 text-slate-900",
    ghost: "hover:bg-slate-100 hover:text-slate-900 text-slate-700",
    secondary: "bg-indigo-50 text-indigo-900 hover:bg-indigo-100"
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };
  return <button ref={ref} className={cn("inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50", sizes[size], variants[variant], className)} {...props} />;
});
Button.displayName = "Button";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn("flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn("flex min-h-[60px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />
));
Textarea.displayName = "Textarea";

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(({ className, ...props }, ref) => (
  <label ref={ref} className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} {...props} />
));
Label.displayName = "Label";

export const Badge = ({ className, variant = 'default', ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'outline' }) => {
  const variants = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700",
    outline: "text-slate-900 border border-slate-200 hover:bg-slate-100"
  };
  return <div className={cn("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2", variants[variant], className)} {...props} />;
};

// Simplified Select using native select element
export const Select = ({ value, onValueChange, children }: any) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className="relative">
      {React.Children.map(children, child => {
        if (child.type === SelectTrigger) return React.cloneElement(child, { onClick: () => setIsOpen(!isOpen) });
        if (child.type === SelectContent && isOpen) return React.cloneElement(child, { onSelect: (v: any) => { onValueChange(v); setIsOpen(false); } });
        return null;
      })}
    </div>
  );
};
export const SelectTrigger = ({ className, children, ...props }: any) => (
  <button type="button" className={cn("flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props}>
    {children}
  </button>
);
export const SelectValue = ({ placeholder }: any) => <span>{placeholder}</span>;
export const SelectContent = ({ children, onSelect }: any) => (
  <div className="absolute top-full left-0 z-50 mt-1 min-w-[8rem] w-full overflow-hidden rounded-md border border-slate-200 bg-white text-slate-950 shadow-md animate-in fade-in-80">
    <div className="p-1">
      {React.Children.map(children, child => React.cloneElement(child, { onClick: () => onSelect(child.props.value) }))}
    </div>
  </div>
);
export const SelectItem = ({ value, children, ...props }: any) => (
  <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100 focus:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50" {...props}>
    {children}
  </div>
);

// Simplified Popover
export const Popover = ({ children }: any) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className="relative inline-block w-full text-left">
      {React.Children.map(children, child => {
        if (child.type === PopoverTrigger) return React.cloneElement(child, { onClick: () => setIsOpen(!isOpen) });
        if (child.type === PopoverContent && isOpen) return React.cloneElement(child, { onClose: () => setIsOpen(false) });
        return null;
      })}
    </div>
  );
};
export const PopoverTrigger = ({ asChild, children, ...props }: any) => {
  return React.cloneElement(children, { ...props });
};
export const PopoverContent = ({ className, align = "center", children, onClose }: any) => (
  <div className={cn("absolute z-50 w-72 rounded-md border border-slate-200 bg-white p-4 shadow-md outline-none animate-in zoom-in-95", align === "start" ? "left-0" : align === "end" ? "right-0" : "left-1/2 -translate-x-1/2", "top-full mt-2", className)}>
    <div className="absolute inset-0 z-[-1]" onClick={onClose} />
    <div className="relative z-10 bg-white">{children}</div>
  </div>
);

// Simplified Calendar (just a native date input styled as simple as possible or using basic state)
export const Calendar = ({ mode, selected, onSelect, initialFocus }: any) => {
  return (
    <div className="p-3">
      <input type="date" value={selected ? format(selected, 'yyyy-MM-dd') : ''} onChange={(e) => onSelect(e.target.value ? new Date(e.target.value) : undefined)} className="w-full p-2 border border-slate-200 rounded" />
    </div>
  );
};

// Simplified Tabs
export const Tabs = ({ value, onValueChange, className, children }: any) => {
  return (
    <div className={cn("", className)}>
      {React.Children.map(children, child => {
        if (child.type === TabsList) return React.cloneElement(child, { value, onValueChange });
        if (child.type === TabsContent) return child.props.value === value ? child : null;
        if (child.type === AnimatePresence || child.type === 'div') return child; // Handle wrapping divs
        return child; // Allow other children
      })}
    </div>
  );
};
export const TabsList = ({ className, ...props }: any) => <div className={cn("inline-flex h-9 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500", className)} {...props} />;
export const TabsTrigger = ({ value, className, ...props }: any) => <button className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow", className)} {...props} />;
export const TabsContent = ({ value, className, ...props }: any) => <div className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)} {...props} />;

