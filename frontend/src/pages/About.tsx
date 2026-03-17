import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="container flex-1 py-16 max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-6">About FocusSprint</h1>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>FocusSprint is a precision timer built for deep work. We believe that focused, intentional work is the foundation of meaningful progress.</p>
          <p>Our mission is simple: give you the tools to measure your focus, build a habit around it, and visualize your progress over time — without the clutter of traditional productivity apps.</p>
          <p>Track sessions. Measure streaks. Build momentum. That's FocusSprint.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
