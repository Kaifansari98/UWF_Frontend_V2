// components/TreasuryApprovalModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import apiClient from "@/utils/apiClient";
import ConfirmModal from "./ConfirmModal";

interface TreasuryApprovalModalProps {
  submission: any;
  onClose: () => void;
  onSuccess: () => void;
}

const predefinedAmounts = [8000, 10000, 15000];

export default function TreasuryApprovalModal({
  submission,
  onClose,
  onSuccess,
}: TreasuryApprovalModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const studentName = `${submission.firstName || ""} ${submission.fatherName || ""} ${submission.familyName || ""}`;
  const studentClass = submission.class;
  const requestedAmount = submission.requested_amount;

  const handleSubmit = async () => {
    const amount = selectedAmount ?? parseFloat(customAmount);
    if (!amount || isNaN(amount)) {
      toast.error("Please select or enter a valid amount");
      return;
    }

    try {
      const res = await apiClient.put(`/submissions/accept/amount/${submission.formId}`, {
        amount,
      });
      toast.success(`Form accepted for ₹${amount.toLocaleString()}`);
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to accept form");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center px-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl">
        <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
          Treasury Approval
        </h2>

        <div className="space-y-3 mb-6">
          <div>
            <Label>Student name</Label>
            <p className="text-gray-700">{studentName}</p>
          </div>
          <div>
            <Label>Class/Std.</Label>
            <p className="text-gray-700">{studentClass}</p>
          </div>
          <div>
            <Label>Requested Amount</Label>
            <p className="text-gray-700">₹ {requestedAmount}</p>
          </div>
          <div>
            <Label>Amount Assigned</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {predefinedAmounts.map((amt) => (
                <Button
                  key={amt}
                  variant={selectedAmount === amt ? "default" : "outline"}
                  onClick={() => {
                    setSelectedAmount(amt);
                    setCustomAmount("");
                  }}
                >
                  ₹ {amt.toLocaleString()}
                </Button>
              ))}
            </div>
            <div className="mt-3">
              <Label htmlFor="customAmount">Other Amount</Label>
              <Input
                id="customAmount"
                type="number"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                placeholder="Enter custom amount"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
                onClick={() => {
                    const amount = selectedAmount ?? parseFloat(customAmount);
                    if (!amount || isNaN(amount)) {
                    toast.error("Please select or enter a valid amount");
                    return;
                    }
                    setShowConfirmModal(true);
                }}
                className="bg-[#025aa5] text-white"
                >
                Submit
            </Button>
        </div>
      </div>
      {showConfirmModal && (
        <ConfirmModal
            title="Confirm Treasury Approval"
            description={`Are you sure you want to accept this form for ₹${(
            selectedAmount ?? parseFloat(customAmount)
            ).toLocaleString()}?`}
            confirmText="Confirm"
            cancelText="Cancel"
            onCancel={() => setShowConfirmModal(false)}
            onConfirm={async () => {
            setShowConfirmModal(false);
            await handleSubmit();
            }}
        />
        )}
    </div>
  );
} 
