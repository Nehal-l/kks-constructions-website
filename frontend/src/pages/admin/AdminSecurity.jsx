import { useState } from "react";
import { Lock, ShieldAlert, CheckCircle, AlertCircle, KeyRound } from "lucide-react";
import { changeAdminPassword } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function AdminSecurity() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }

  const lengthOk = newPassword.length >= 8;
  const letterOk = /[A-Za-z]/.test(newPassword);
  const numberOk = /[0-9]/.test(newPassword);
  const specialOk = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);
  const matchOk = newPassword && newPassword === confirmPassword;
  const allValid = lengthOk && letterOk && numberOk && specialOk && matchOk;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!allValid) {
      showToast("Please ensure the new password satisfies all security criteria.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await changeAdminPassword(currentPassword, newPassword, confirmPassword);
      showToast(res.message || "Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showToast(err.message || "Failed to change password.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 text-xs uppercase tracking-wider shadow-2xl ${
            toast.type === "error"
              ? "bg-red-900 text-cream border border-red-500"
              : "bg-ink text-gold border border-gold"
          }`}
        >
          {toast.type === "error" ? <AlertCircle className="size-4" /> : <CheckCircle className="size-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-sand pb-6">
        <h2 className="font-display text-3xl text-ink">Account & Password Security</h2>
        <p className="mt-1 text-xs text-stone">
          Manage your owner credentials and enforce strong cryptographic password protection.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="border border-sand bg-white p-6 shadow-sm space-y-3">
        <span className="text-[0.62rem] uppercase tracking-widest text-gold-deep font-semibold">
          Authenticated Owner Account
        </span>
        <div className="grid grid-cols-2 gap-4 text-xs pt-1">
          <div>
            <span className="text-stone block">Username</span>
            <span className="font-medium text-ink font-mono text-sm">{user?.username || "kks_constructions"}</span>
          </div>
          <div>
            <span className="text-stone block">Owner Email</span>
            <span className="font-medium text-ink font-mono text-sm">{user?.email || "enquiries@kksconstructions.com"}</span>
          </div>
        </div>
      </div>

      {/* Production Warning Notice */}
      <div className="border border-amber-400/60 bg-amber-50/60 p-4 flex items-start gap-3 text-amber-900">
        <ShieldAlert className="size-5 shrink-0 text-amber-700 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold">Development Notice</p>
          <p>
            The initial development password was <code>kks@123</code>. You must update this to a strong, high-entropy password before deploying your platform to public production.
          </p>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="border border-sand bg-white p-6 shadow-sm">
        <h3 className="flex items-center gap-2 font-display text-2xl text-ink mb-6">
          <KeyRound className="size-5 text-gold-deep" /> Update Password
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
              Current Password *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full border border-sand p-2.5 text-xs text-ink focus:border-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
              New Password *
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new strong password"
              className="w-full border border-sand p-2.5 text-xs text-ink focus:border-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type new password"
              className="w-full border border-sand p-2.5 text-xs text-ink focus:border-gold focus:outline-none"
            />
          </div>

          {/* Real-time Strength Checklist */}
          <div className="bg-cream/50 p-4 border border-sand/70 space-y-2 text-xs">
            <p className="font-medium text-stone uppercase tracking-wider text-[0.62rem]">
              Password Requirements:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <span className={`flex items-center gap-1.5 ${lengthOk ? "text-emerald-700" : "text-stone"}`}>
                <span className={`size-1.5 rounded-full ${lengthOk ? "bg-emerald-600" : "bg-stone/40"}`} />
                At least 8 characters
              </span>
              <span className={`flex items-center gap-1.5 ${letterOk ? "text-emerald-700" : "text-stone"}`}>
                <span className={`size-1.5 rounded-full ${letterOk ? "bg-emerald-600" : "bg-stone/40"}`} />
                At least one letter
              </span>
              <span className={`flex items-center gap-1.5 ${numberOk ? "text-emerald-700" : "text-stone"}`}>
                <span className={`size-1.5 rounded-full ${numberOk ? "bg-emerald-600" : "bg-stone/40"}`} />
                At least one number
              </span>
              <span className={`flex items-center gap-1.5 ${specialOk ? "text-emerald-700" : "text-stone"}`}>
                <span className={`size-1.5 rounded-full ${specialOk ? "bg-emerald-600" : "bg-stone/40"}`} />
                At least one special character
              </span>
            </div>
            {newPassword && confirmPassword && (
              <p className={matchOk ? "text-emerald-700 pt-1" : "text-red-700 pt-1"}>
                {matchOk ? "✓ Passwords match" : "✗ Passwords do not match"}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !allValid}
            className="flex items-center justify-center gap-2 bg-ink px-6 py-3 text-[0.68rem] uppercase tracking-[0.24em] text-cream hover:bg-gold hover:text-ink transition disabled:opacity-40"
          >
            <Lock className="size-4" />
            {loading ? "Updating Password..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

