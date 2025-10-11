"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

import { TwoFaService } from "@/app/client";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/user-context";
import { handleError } from "@/lib/error";

export function TwoFactorSection() {
  const { user, refreshUser } = useUser();
  const [showEnableModal, setShowEnableModal] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"qr" | "verify">("qr");

  const handleEnableStart = async () => {
    try {
      setIsLoading(true);
      const response = await TwoFaService.setupApiV1TwoFaSetupGet();
      setQrUrl(response.url);
      setShowEnableModal(true);
      setStep("qr");
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setIsLoading(true);
      await TwoFaService.verifyApiV1TwoFaVerifyPost({
        requestBody: { totp: totpCode },
      });
      setShowEnableModal(false);
      setTotpCode("");
      await refreshUser();
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    if (
      !confirm("Are you sure you want to disable two-factor authentication?")
    ) {
      return;
    }

    try {
      setIsLoading(true);
      await TwoFaService.disableApiV1TwoFaDisablePost();
      await refreshUser();
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Two-Factor Authentication
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              Status: {user?.two_fa_enabled ? "Enabled" : "Disabled"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Secure your account with two-factor authentication
            </p>
          </div>
          <Button
            onClick={user?.two_fa_enabled ? handleDisable : handleEnableStart}
            disabled={isLoading}
            className="px-4 py-2 text-sm"
          >
            {isLoading
              ? "Loading..."
              : user?.two_fa_enabled
              ? "Disable"
              : "Enable"}
          </Button>
        </div>
      </div>
      {showEnableModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-sm shadow-sample max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Enable Two-Factor Authentication
            </h3>
            {step === "qr" ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Scan this QR code with your authenticator app (Google
                  Authenticator, Authy, etc.)
                </p>
                {qrUrl && (
                  <div className="flex justify-center p-4 bg-background border border-border rounded-sm">
                    <QRCodeSVG value={qrUrl} size={256} />
                  </div>
                )}
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowEnableModal(false);
                      setQrUrl("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => setStep("verify")}>Next</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit code from your authenticator app
                </p>
                <input
                  type="text"
                  value={totpCode}
                  onChange={(e) =>
                    setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  className="w-full border border-border rounded-sm px-4 py-2.5 text-center text-2xl tracking-widest bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={6}
                  autoFocus
                />
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="ghost"
                    onClick={() => setStep("qr")}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleVerify}
                    disabled={totpCode.length !== 6 || isLoading}
                  >
                    {isLoading ? "Verifying..." : "Verify"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
