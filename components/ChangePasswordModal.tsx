"use client";

import { useId, useMemo, useState } from "react";
import {
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  XIcon,
  Loader2,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import apiClient from "@/utils/apiClient";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-xs font-semibold uppercase tracking-wider text-zinc-500"
      >
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-12 rounded-xl border-zinc-200 bg-zinc-50 pe-10 text-sm placeholder:text-zinc-400 focus:bg-white"
        />
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          {visible ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
        </button>
      </div>
    </div>
  );
}

const REQUIREMENTS = [
  { regex: /.{8,}/, text: "At least 8 characters" },
  { regex: /[0-9]/, text: "At least 1 number" },
  { regex: /[a-z]/, text: "At least 1 lowercase letter" },
  { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
  { regex: /[^A-Za-z0-9]/, text: "At least 1 special character" },
];

function StrengthChecker({ password }: { password: string }) {
  const checks = REQUIREMENTS.map((req) => ({
    met: req.regex.test(password),
    text: req.text,
  }));

  const score = useMemo(() => checks.filter((c) => c.met).length, [checks]);

  const barColor =
    score === 0
      ? "bg-zinc-200"
      : score <= 2
        ? "bg-red-500"
        : score === 3
          ? "bg-orange-500"
          : score === 4
            ? "bg-amber-500"
            : "bg-emerald-500";

  const strengthLabel =
    score === 0
      ? "Enter a password"
      : score <= 2
        ? "Weak password"
        : score === 3
          ? "Medium password"
          : score === 4
            ? "Almost there"
            : "Strong password";

  return (
    <div className="space-y-3">
      <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-100">
        <div
          className={`h-full ${barColor} transition-all duration-500 ease-out`}
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>
      <p className="text-sm font-semibold text-zinc-800">{strengthLabel}</p>
      <ul className="space-y-1.5">
        {checks.map((req) => (
          <li key={req.text} className="flex items-center gap-2.5">
            {req.met ? (
              <CheckIcon size={14} className="shrink-0 text-emerald-500" />
            ) : (
              <XIcon size={14} className="shrink-0 text-zinc-400" />
            )}
            <span
              className={`text-sm ${req.met ? "text-emerald-600" : "text-zinc-500"}`}
            >
              {req.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ChangePasswordModal({
  open,
  onClose,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success("Password changed successfully");
      handleClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[640px]">
        {/* Header */}
        <div className="flex items-start gap-4 px-6 pt-6 pb-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-100">
            <KeyRound size={22} className="text-zinc-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-zinc-900">Change Password</h2>
            <p className="mt-0.5 text-sm text-zinc-500">
              Update your password to keep your account secure.
            </p>
          </div>
        </div>

        <div className="h-px bg-zinc-100" />

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-5">
            <PasswordField
              id="current-password"
              label="Current Password"
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="Enter current password"
            />

            <PasswordField
              id="new-password"
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Enter new password"
            />

            <div className="h-px bg-zinc-100" />

            <StrengthChecker password={newPassword} />

            <div className="h-px bg-zinc-100" />

            <PasswordField
              id="confirm-password"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Re-enter new password"
            />
          </div>

          <div className="h-px bg-zinc-100" />

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4">
            <p className="flex items-center gap-2 text-xs text-zinc-400">
              <ShieldCheck size={14} className="shrink-0" />
              You'll be logged out after saving.
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-zinc-800 hover:bg-zinc-700"
              >
                {loading && (
                  <Loader2 size={15} className="mr-1.5 animate-spin" />
                )}
                {loading ? "Saving..." : "Update Password"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
