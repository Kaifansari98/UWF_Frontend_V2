"use client";

import { useRouter } from "next/navigation";
import FormGenerationModal from "@/components/FormGeneration/FormGenerationModal";

export default function FormGenerationPage() {
  const router = useRouter();

  return (
    <div className="min-h-full bg-background">
      <FormGenerationModal
        open
        onOpenChange={(open) => {
          if (!open) {
            router.push("/dashboard/pending-requests");
          }
        }}
      />
    </div>
  );
}
