"use client";

import React, { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "./ui/alert-dialog";

type AlertPayload = {
  title?: string;
  message?: string;
  status?: number;
};

export default function GlobalAlert() {
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<AlertPayload | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as AlertPayload | undefined;
      setPayload(detail || null);
      setOpen(true);
    };

    window.addEventListener("show-alert", handler as EventListener);
    return () => window.removeEventListener("show-alert", handler as EventListener);
  }, []);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{payload?.title ?? "Aviso"}</AlertDialogTitle>
        </AlertDialogHeader>

        <AlertDialogDescription>{payload?.message}</AlertDialogDescription>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setOpen(false)}>Fechar</AlertDialogCancel>
          <AlertDialogAction onClick={() => setOpen(false)}>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
