import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — Edition Kids',
  description: 'How Edition Kids collects, uses, and protects your information.',
}

export default function PrivacyPage() {
  const updated = 'April 26, 2026'

  return (
    <div className="min-h-screen bg-[#faf9f6] font-albert">

      {/* Minimal header */}
      <header className="bg-white border-b border-[#ded4c4] px-4 py-4 flex items-center justify-between">
        <Link href="/" className="inline-block">
          <img src="/images/logo.png" alt="Edition Kids" className="h-8 w-auto" />
        </Link>
        <Link href="/" className="text-xs font-semibold uppercase tracking-[1px] text-[#4a4a48] hover:text-[#1c1c1a] transition-colors">
          ← Back
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-10 pb-20">

        <p className="text-[11px] uppercase tracking-[2px] text-[#4a4a48] mb-2">Legal</p>
        <h1 className="font-['Libre_Baskerville'] italic text-3xl text-[#1c1c1a] mb-1">Privacy Policy</h1>
        <p className="text-sm text-[#4a4a48] mb-8">Last updated: {updated}</p>

        <div className="prose prose-sm max-w-none text-[#1c1c1a] space-y-6 leading-relaxed">

          <section>
            <h2 className="font-semibold text-base mb-2">1. Who We Are</h2>
            <p>
              Edition Kids ("we", "us", or "our") operates the Edition Kids website and service,
              which delivers personalized daily news summaries written for children ages 8–12.
              Our service is directed to parents and guardians, not to children directly.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">2. Children's Privacy (COPPA)</h2>
            <p>
              Edition Kids is designed for <strong>parents and guardians</strong> who create and manage accounts
              on behalf of their children. We do not knowingly collect personal information directly from children
              under 13 without verifiable parental consent, in accordance with the Children's Online Privacy
              Protection Act (COPPA).
            </p>
            <p className="mt-2">
              If you believe we have inadvertently collected personal information from a child under 13
              without your consent, please contact us immediately at{' '}
              <a href="mailto:privacy@editionkids.com" className="text-[#4f6b4f] underline">privacy@editionkids.com</a>{' '}
              and we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">3. Information We Collect</h2>
            <p>We collect only what is necessary to provide the service:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Account information:</strong> your name and email address when you sign up.</li>
              <li><strong>Child profile data:</strong> the first name(s) and reading preferences (topic interests, age range) you provide for each paper you create. We do not collect last names, dates of birth, photos, or location data about children.</li>
              <li><strong>Usage data:</strong> which editions you generate and view, to improve the service.</li>
              <li><strong>Technical data:</strong> browser type and IP address, collected automatically by our hosting infrastructure.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">4. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To generate and deliver personalized news editions.</li>
              <li>To authenticate your account and maintain your session.</li>
              <li>To respond to support requests.</li>
              <li>To improve and develop the service.</li>
            </ul>
            <p className="mt-2">We do not sell your data. We do not use your data for advertising.</p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">5. Third-Party Services</h2>
            <p>We use the following third-party services to operate Edition Kids:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Supabase</strong> — authentication and database (data stored in the US).</li>
              <li><strong>Anthropic / Claude</strong> — AI rewriting of news articles into child-appropriate language.</li>
              <li><strong>Vercel</strong> — website hosting.</li>
            </ul>
            <p className="mt-2">Each provider has its own privacy policy and data practices.</p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">6. Data Retention</h2>
            <p>
              We retain your account data for as long as your account is active. You can delete your account
              at any time from the Account page, which will remove all personal data associated with your account
              within 30 days.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">7. Your Rights</h2>
            <p>
              Depending on where you live, you may have rights to access, correct, or delete the personal
              information we hold about you. To exercise these rights, email us at{' '}
              <a href="mailto:privacy@editionkids.com" className="text-[#4f6b4f] underline">privacy@editionkids.com</a>.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">8. Security</h2>
            <p>
              We use industry-standard security measures including encrypted connections (HTTPS) and
              secure authentication tokens. No system is 100% secure; please use a strong, unique password
              for your account.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">9. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. When we do, we will update the "Last updated"
              date above. Continued use of the service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">10. Contact Us</h2>
            <p>
              Questions about this policy? Email us at{' '}
              <a href="mailto:privacy@editionkids.com" className="text-[#4f6b4f] underline">privacy@editionkids.com</a>.
            </p>
          </section>

        </div>

        {/* Footer links */}
        <div className="mt-12 pt-6 border-t border-[#ded4c4] flex gap-4 text-xs text-[#4a4a48]">
          <Link href="/privacy" className="font-semibold text-[#1c1c1a]">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-[#1c1c1a] transition-colors">Terms of Use</Link>
        </div>

      </main>
    </div>
  )
}
