import { APP_NAME } from "@/config/app";

export function GettingStarted() {
  return (
    <section id="getting-started">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Getting Started
          </h2>
          <p className="text-muted-foreground">
            Learn how to create your account and get started with {APP_NAME}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Creating Your Account
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">
                    Visit the Sign Up Page
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Navigate to the sign up page by clicking the "Get Started"
                    button on the homepage or visiting the sign up link
                    directly.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">
                    Enter Your Details
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Provide your full name, email address, and create a secure
                    password. Make sure to use a valid email address as you'll
                    need it for verification.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">
                    Verify Your Email
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    After signing up, you'll receive a 6-digit verification code
                    via email. Enter this code on the verification page to
                    activate your account.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold">
                  4
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">
                    Start Using {APP_NAME}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Once verified, you'll be automatically logged in and
                    redirected to your dashboard where you can start connecting
                    your Xero account and uploading files.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Note:</strong> If you don't
              receive the verification email, check your spam folder or request
              a new code from the verification page.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
