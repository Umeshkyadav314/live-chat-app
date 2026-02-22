import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignInPage() {
  return (
    <div className="auth-dark min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950">
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/95 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.25),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_50%,rgba(99,102,241,0.15),transparent)]" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

      <div className="relative z-10 w-full max-w-md px-4 flex flex-col items-center">
        {/* Brand block */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4 shadow-lg">
            <svg className="w-8 h-8 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-sm">TarsChat</h1>
          <p className="text-blue-200/90 text-sm mt-2 font-medium">Real-time messaging, simplified</p>
        </div>

        {/* Overlapping border boxes - outer glow + inner card */}
        <div className="auth-dark-card relative w-full">
          {/* Outer border box - offset behind for overlapping effect */}
          <div className="absolute -inset-3 rounded-3xl border-2 border-blue-500/30 bg-blue-950/20 backdrop-blur-sm" aria-hidden />
          {/* Inner card - main form container */}
          <div className="relative z-10 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/25 shadow-2xl p-6 sm:p-8">
            <SignIn
              appearance={{
                baseTheme: dark,
                layout: {
                  unsafe_disableDevelopmentModeWarnings: true,
                },
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none w-full",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/80 text-slate-100",
                  dividerLine: "bg-slate-500/50",
                  dividerText: "text-slate-300",
                  formFieldLabel: "text-slate-200",
                  formFieldInput: "bg-slate-800/80 border-slate-600/80 text-white placeholder:text-slate-400 focus:border-blue-500",
                  formButtonPrimary: "bg-blue-600 hover:bg-blue-500 text-white",
                  footerActionLink: "text-blue-300 hover:text-blue-200",
                  identityPreviewEditButton: "text-blue-300",
                },
                variables: {
                  colorPrimary: "#3b82f6",
                  colorBackground: "transparent",
                  colorInputBackground: "rgba(30,41,59,0.8)",
                  colorInputText: "#ffffff",
                  colorText: "#e2e8f0",
                  colorTextSecondary: "#94a3b8",
                  borderRadius: "0.75rem",
                },
              }}
            />
          </div>
        </div>

        <p className="text-slate-400 text-xs mt-6 text-center">Secure sign-in with Clerk</p>
      </div>
    </div>
  );
}
