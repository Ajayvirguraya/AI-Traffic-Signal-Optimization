import LegalPage, { LegalSection } from '@/components/atso/LegalPage'

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Disclaimer"
      subtitle="Important information about the ATSO simulation and AI recommendations."
      description="Important limitations and permitted uses of the ATSO traffic simulation, analytics and AI recommendations."
      showUpdated={false}
    >
      <LegalSection title="Technology Demonstration">
        <p>ATSO is an interactive traffic-simulation and technology demonstration platform.</p>
        <p>
          The traffic conditions, vehicle movements, signal decisions, queues, waiting times,
          congestion levels, throughput values, analytics, and AI recommendations displayed by the
          platform may be simulated or based on user-provided datasets.
        </p>
      </LegalSection>

      <LegalSection title="No Real-World Traffic Control">
        <p>
          ATSO does not control real-world traffic signals and should not be used for operational
          traffic management.
        </p>
      </LegalSection>

      <LegalSection title="AI Recommendations">
        <p>
          AI recommendations are provided for demonstration, educational, research, and experimental
          purposes.
        </p>
        <p>
          They should not be considered professional transportation engineering, traffic-management,
          safety, governmental, legal, or emergency-response advice.
        </p>
      </LegalSection>

      <LegalSection title="Simulation Information">
        <p>
          Unless explicitly stated otherwise, information shown in the simulation should not be
          interpreted as live real-world traffic information.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
