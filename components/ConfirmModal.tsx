"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import gsap from "gsap";

interface ConfirmModalProps {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
}: ConfirmModalProps) {
  useEffect(() => {
    gsap.fromTo(
      "#confirm-modal-overlay",
      { opacity: 0 },
      { opacity: 1, duration: 0.2 }
    );
    gsap.fromTo(
      "#confirm-modal-card",
      { scale: 1.15, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
    );
  }, []);

  return (
    <div
      id="confirm-modal-overlay"
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
    >
      <div
        id="confirm-modal-card"
        className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl relative"
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
          onClick={onCancel}
        >
          <X size={18} />
        </button>

        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-600 mt-2 mb-6">{description}</p>

        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            className="border border-gray-300 text-black"
            onClick={onCancel}
          >
            {cancelText}
          </Button>
          <Button className="bg-[#025aa5] text-white" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
