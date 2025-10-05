export const metadata = {
  title: "Contact | Fuchs Sales and Consulting",
  description: "Get in touch about manufacturer representation, tilt-up and precast consulting.",
};

import EmailForm from "../../components/EmailForm";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 pt-32 px-6 md:px-16 pb-16">
      <h1 className="text-4xl font-bold mb-4">Contact</h1>
      <p className="text-gray-700 mb-10">
        Ready to talk representation or a project in tilt-up / precast? Reach out and we’ll respond promptly.
      </p>

        <section className="rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Send a quick message</h2>
            <EmailForm />
        </section>
    </main>
  );
}