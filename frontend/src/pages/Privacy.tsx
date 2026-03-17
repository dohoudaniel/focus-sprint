import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="container flex-1 py-16 max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-6">Privacy Policy</h1>
        <div className="space-y-4 text-muted-foreground leading-relaxed text-sm">
          <p>Your privacy matters. FocusSprint collects only the minimum data needed to provide the service — your email, session data, and preferences.</p>
          <p>We do not sell your data. We do not use third-party trackers. Your focus data stays yours.</p>
          <p>Session data is stored securely and encrypted in transit. You can export or delete your data at any time from your account settings.</p>
          <p>For questions, contact privacy@focussprint.app.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
