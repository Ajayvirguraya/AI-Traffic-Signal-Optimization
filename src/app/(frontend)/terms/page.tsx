import LegalPage, { LegalSection } from '@/components/atso/LegalPage'

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      subtitle="Terms governing the use of the ATSO platform."
      description="Review the terms governing use of the ATSO interactive traffic-simulation and AI optimization demonstration platform."
    >
      <p>By accessing or using the ATSO website, you agree to these Terms &amp; Conditions.</p>
      <p>If you do not agree with these terms, please do not use the website.</p>

      <LegalSection number="01" title="About ATSO">
        <p>
          ATSO is an interactive technology demonstration platform designed to demonstrate adaptive
          traffic signal optimization concepts using simulation, data analysis, and AI-assisted
          decision making.
        </p>
      </LegalSection>

      <LegalSection number="02" title="Simulation Only">
        <p>ATSO does not operate, control, or communicate with real-world traffic signals.</p>
        <p>
          Traffic lights, vehicles, queues, congestion, waiting times, throughput, and AI decisions
          shown in the simulation are for demonstration purposes unless explicitly stated otherwise.
        </p>
        <p>ATSO must not be used as an operational traffic-control system.</p>
      </LegalSection>

      <LegalSection number="03" title="AI Recommendations">
        <p>
          AI-generated recommendations displayed by ATSO are intended for demonstration,
          educational, and experimental purposes.
        </p>
        <p>
          They are not professional transportation engineering, traffic-management, safety, legal,
          governmental, or emergency-response advice.
        </p>
        <p>
          Users must not rely on ATSO recommendations to make real-world traffic-control decisions.
        </p>
      </LegalSection>

      <LegalSection number="04" title="Data and Accuracy">
        <p>
          We aim to provide accurate and reliable demonstrations, but simulation results, analytics,
          datasets, AI recommendations, and calculations may contain errors or limitations.
        </p>
        <p>
          No guarantee is made that the results will accurately represent real-world traffic
          conditions.
        </p>
      </LegalSection>

      <LegalSection number="05" title="User-Uploaded Data">
        <p>
          If the website allows users to upload datasets, users are responsible for ensuring that
          they have the legal right to use and upload that data.
        </p>
        <p>Users must not upload unauthorized, confidential, malicious, or illegal content.</p>
      </LegalSection>

      <LegalSection number="06" title="Acceptable Use & Prohibited Activities">
        <p>
          You agree to use ATSO only for lawful, educational, research, demonstration, and other
          legitimate purposes.
        </p>
        <p>You must not use ATSO to:</p>
        <ul>
          <li>
            Attempt to gain unauthorized access to the website, servers, databases, APIs, accounts,
            or other systems.
          </li>
          <li>Attack, disrupt, overload, disable, or interfere with the operation of ATSO.</li>
          <li>
            Introduce, upload, transmit, or distribute malware, viruses, ransomware, malicious
            scripts, or other harmful code.
          </li>
          <li>
            Attempt to bypass authentication, security controls, access restrictions, rate limits,
            or other technical protections.
          </li>
          <li>
            Use ATSO to conduct unauthorized attacks against third-party websites, systems, devices,
            networks, or services.
          </li>
          <li>Use the platform to facilitate, support, or carry out illegal activities.</li>
          <li>
            Upload personal, confidential, stolen, sensitive, or unauthorized data belonging to
            another person or organization.
          </li>
          <li>
            Scrape, copy, or automatically extract information from ATSO in a manner that harms,
            overloads, or interferes with the platform.
          </li>
          <li>
            Attempt to reverse engineer, exploit, compromise, or circumvent security mechanisms of
            the platform.
          </li>
          <li>
            Misrepresent simulated traffic results, AI recommendations, or analytics as official
            real-world traffic-control information.
          </li>
          <li>
            Use ATSO’s AI recommendations to control real-world traffic systems or make
            safety-critical decisions without appropriate professional validation.
          </li>
          <li>
            Use the platform in a manner that could damage the reputation, security, availability,
            or integrity of ATSO or its users.
          </li>
        </ul>
        <p>
          We reserve the right to restrict, suspend, or terminate access to the platform if we
          reasonably believe that it is being misused or used in violation of these Terms.
        </p>
      </LegalSection>

      <LegalSection number="07" title="Intellectual Property">
        <p>
          The ATSO website, branding, interface design, graphics, software, simulation logic, AI
          logic, original content, and other original materials are protected by applicable
          intellectual-property laws.
        </p>
        <p>
          You may not reproduce, redistribute, modify, commercially exploit, or claim ownership of
          proprietary parts of the platform without appropriate permission.
        </p>
      </LegalSection>

      <LegalSection number="08" title="Availability">
        <p>
          ATSO may be modified, updated, temporarily unavailable, or discontinued without prior
          notice.
        </p>
        <p>
          Features, simulations, datasets, AI behavior, and other functionality may change as the
          platform evolves.
        </p>
      </LegalSection>

      <LegalSection number="09" title="Limitation of Liability">
        <p>
          To the extent permitted by applicable law, ATSO and its creators are not responsible for
          losses, damages, decisions, or consequences resulting from reliance on simulation results,
          AI recommendations, uploaded datasets, website availability, technical errors, or
          incorrect outputs.
        </p>
      </LegalSection>

      <LegalSection number="10" title="Changes to These Terms">
        <p>These Terms &amp; Conditions may be updated as ATSO evolves.</p>
        <p>The latest version will always be available on this page.</p>
      </LegalSection>

      <LegalSection number="11" title="Contact">
        <p>
          For questions regarding these Terms &amp; Conditions, use the Contact link in the ATSO
          footer.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
