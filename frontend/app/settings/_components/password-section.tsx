"use client";

import { useState } from "react";

import { UsersService } from "@/app/client";
import { AuthInput } from "@/components/auth/auth-input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { handleError } from "@/lib/error";
import { ERROR_MESSAGES, isValidPassword } from "@/lib/validation";

export function PasswordSection() {
  const { toast } = useToast();
  const [isChanging, setIsChanging] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
    setIsChanging(false);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!oldPassword) {
      newErrors.oldPassword = ERROR_MESSAGES.REQUIRED_FIELD;
    }

    if (!newPassword) {
      newErrors.newPassword = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (!isValidPassword(newPassword)) {
      newErrors.newPassword = ERROR_MESSAGES.PASSWORD_TOO_SHORT;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setIsLoading(true);
      await UsersService.changePasswordApiV1UserChangePasswordPost({
        requestBody: {
          old_password: oldPassword,
          new_password: newPassword,
        },
      });
      handleCancel();
      toast({
        title: "Success",
        description: "Password changed successfully",
      });
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Password</h2>
      {!isChanging ? (
        <Button
          onClick={() => setIsChanging(true)}
          className="px-4 py-2 text-sm"
        >
          Change Password
        </Button>
      ) : (
        <div className="space-y-4">
          <AuthInput
            id="oldPassword"
            label="Current Password"
            type="password"
            placeholder="••••••••"
            value={oldPassword}
            onChange={setOldPassword}
            error={errors.oldPassword}
            disabled={isLoading}
          />
          <AuthInput
            id="newPassword"
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={setNewPassword}
            error={errors.newPassword}
            disabled={isLoading}
          />
          <AuthInput
            id="confirmPassword"
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={setConfirmPassword}
            error={errors.confirmPassword}
            disabled={isLoading}
          />
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 text-sm"
            >
              {isLoading ? "Changing..." : "Change Password"}
            </Button>
            <Button
              variant="ghost"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 text-sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
