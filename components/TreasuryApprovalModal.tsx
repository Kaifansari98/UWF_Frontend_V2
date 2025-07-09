"use client";

import { useState } from "react";
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
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 relative animate-in fade-in zoom-in">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Treasury Approval
        </h2>

        <div className="space-y-4">
          <div>
            <Label className="text-gray-700">Student Name</Label>
            <p className="text-gray-800 font-medium">{studentName}</p>
          </div>
          <div>
            <Label className="text-gray-700">Class / Std.</Label>
            <p className="text-gray-800 font-medium">{studentClass}</p>
          </div>
          <div>
            <Label className="text-gray-700">Requested Amount</Label>
            <p className="text-gray-800 font-medium">₹ {requestedAmount}</p>
          </div>

          <div className="mt-4">
            <Label className="text-gray-700">Assign Amount</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {predefinedAmounts.map((amt) => (
                <Button
                  key={amt}
                  variant={selectedAmount === amt ? "default" : "outline"}
                  className={`px-4 py-2 ${selectedAmount === amt ? "bg-[#025aa5] text-white" : ""}`}
                  onClick={() => {
                    setSelectedAmount(amt);
                    setCustomAmount("");
                  }}
                >
                  ₹ {amt.toLocaleString()}
                </Button>
              ))}
            </div>

            <div className="mt-4">
              <Label htmlFor="customAmount" className="text-gray-700">
                Other Amount
              </Label>
              <Input
                id="customAmount"
                type="number"
                min={1}
                className="mt-1"
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

        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-[#025aa5] text-white hover:bg-[#014a8a]"
            onClick={() => {
              const amount = selectedAmount ?? parseFloat(customAmount);
              if (!amount || isNaN(amount)) {
                toast.error("Please select or enter a valid amount");
                return;
              }
              setShowConfirmModal(true);
            }}
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
