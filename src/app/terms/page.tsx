import Link from 'next/link'

export const metadata = {
  title: 'Terms of Use — Edition Kids',
  description: 'Terms and conditions for using Edition Kids.',
}

export default function TermsPage() {
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
        <h1 className="font-['Libre_Baskerville'] italic text-3xl text-[#1c1c1a] mb-1">Terms of Use</h1>
        <p className="text-sm text-[#4a4a48] mb-8">Last updated: {updated}</p>

        <div className="prose prose-sm max-w-none text-[#1c1c1a] space-y-6 leading-relaxed">

          <section>
            <h2 className="font-semibold text-base mb-2">1. Acceptance of Terms</h2>
            <p>
              By creating an account and using Edition Kids ("the Service"), you agree to these Terms of Use.
              If you do not agree, please do not use the Service. These terms form a binding agreement between
              you and Edition Kids.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">2. Who May Use Edition Kids</h2>
            <p>
              Edition Kids accounts are for <strong>adults aged 18 and older</strong> (parents, guardians, and educators)
              who use the Service on behalf of children ages 8–12. Children may read the content generated
              through a parent or guardian's account, but may not create their own accounts.
            </p>
            <p className="mt-2">
              You are responsible for ensuring that any child who accesses content through your account does
              so only with your supervision and consent.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">3. The Service</h2>
            <p>
              Edition Kids uses artificial intelligence to rewrite news articles from third-party sources into
              age-appropriate language for children. We do not guarantee the accuracy, completeness, or timeliness
              of any article or edition. The Service is provided for educational and entertainment purposes.
            </p>
            <p className="mt-2">
              We reserve the right to modify, suspend, or discontinue the Service at any time, with or without notice.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">4. Your Account</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You are responsible for keeping your login credentials secure.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
              <li>You may create up to 10 papers (child profiles) per account.</li>
              <li>You may not share your account with others or use it for commercial purposes without our written consent.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">5. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Use the Service for any unlawful purpose.</li>
              <li>Attempt to access, scrape, or reverse-engineer any part of the Service.</li>
              <li>Use automated tools to generate editions in bulk.</li>
              <li>Misrepresent your identity or relationship to a child.</li>
              <li>Distribute, resell, or commercialize the generated content without permission.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">6. Intellectual Property</h2>
            <p>
              The Edition Kids name, logo, and interface design are our property. News articles are sourced
              from third-party publishers and rewritten by AI; copyright in the underlying facts and events
              belongs to their respective owners. AI-generated rewrites are provided to you for personal,
              non-commercial use only.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">7. Disclaimer of Warranties</h2>
            <p>
              The Service is provided "as is" and "as available" without warranties of any kind, express or
              implied. We do not warrant that the Service will be uninterrupted, error-free, or that any
              particular edition will be generated successfully.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">8. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Edition Kids shall not be liable for any indirect,
              incidental, special, or consequential damages arising from your use of the Service, even if
              we have been advised of the possibility of such damages.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">9. Termination</h2>
            <p>
              You may delete your account at any time from the Account page. We reserve the right to suspend
              or terminate accounts that violate these Terms without notice.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">10. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. We will notify you of material changes by email or
              by posting a notice in the app. Continued use of the Service after changes take effect constitutes
              your acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">11. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the State of Delaware, United States, without regard
              to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">12. Contact</h2>
            <p>
              Questions about these Terms? Email us at{' '}
              <a href="mailto:legal@editionkids.com" className="text-[#4f6b4f] underline">legal@editionkids.com</a>.
            </p>
          </section>

        </div>

        {/* Footer links */}
        <div className="mt-12 pt-6 border-t border-[#ded4c4] flex gap-4 text-xs text-[#4a4a48]">
          <Link href="/privacy" className="hover:text-[#1c1c1a] transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="font-semibold text-[#1c1c1a]">Terms of Use</Link>
        </div>

      </main>
    </div>
  )
}
