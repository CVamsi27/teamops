"use client";
import { useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";

interface InfoButtonProps {
  title: string;
  description?: string;
  sections: Array<{
    title: string;
    content: React.ReactNode;
  }>;
}

export function InfoButton({ title, description, sections }: InfoButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="View information"
        >
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-sm uppercase tracking-wide mb-3 text-foreground">
                {section.title}
              </h3>
              <div className="bg-muted p-4 rounded-lg text-sm space-y-2 text-muted-foreground">
                {section.content}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
