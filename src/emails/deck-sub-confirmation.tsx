// emails/DeckSubmissionEmail.tsx

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components'

interface DeckSubmissionEmailProps {
  patreonUsername: string
  submissionNumber: number
  colorPreference: string
  commander?: string
  bracket: string
  mysteryDeck: boolean
}

export const DeckSubmissionEmail = ({
  patreonUsername = 'Commander',
  submissionNumber = 1,
  colorPreference = 'Five Color',
  commander,
  bracket = 'Bracket 3',
  mysteryDeck = false,
}: DeckSubmissionEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        Your custom Commander deck submission has been received! Submission #{submissionNumber}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>🎴 Deck Submission Confirmed!</Heading>
            <Text style={submissionNumber}>Submission #{submissionNumber}</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={greeting}>Hey {patreonUsername}! 👋</Text>

            <Text style={paragraph}>
              Your custom Commander deck submission has been received and is now in the queue. I'm
              excited to build something awesome for you!
            </Text>

            <Hr style={hr} />

            {/* Submission Details */}
            <Heading as="h2" style={h2}>
              📋 Your Submission Details
            </Heading>

            <Section style={detailsBox}>
              {mysteryDeck ? (
                <Text style={detailItem}>
                  <strong>Deck Type:</strong> Mystery Deck (Surprise me!) ✨
                </Text>
              ) : (
                <>
                  {commander && (
                    <Text style={detailItem}>
                      <strong>Commander:</strong> {commander}
                    </Text>
                  )}
                  <Text style={detailItem}>
                    <strong>Color Identity:</strong> {colorPreference}
                  </Text>
                </>
              )}
              <Text style={detailItem}>
                <strong>Bracket:</strong> {bracket}
              </Text>
            </Section>

            <Hr style={hr} />

            {/* What's Next */}
            <Heading as="h2" style={h2}>
              🚀 What Happens Next?
            </Heading>

            <Section style={stepsList}>
              <Text style={step}>
                <span style={stepNumber}>1.</span> I'll review your submission and reach out if I
                need any clarification
              </Text>
              <Text style={step}>
                <span style={stepNumber}>2.</span> Your deck will be carefully crafted with your
                preferences in mind
              </Text>
              <Text style={step}>
                <span style={stepNumber}>3.</span> You'll receive your decklist via Discord and
                email
              </Text>
              <Text style={step}>
                <span style={stepNumber}>4.</span> Time to dominate at the table! 💪
              </Text>
            </Section>

            <Hr style={hr} />

            {/* Estimated Timeline */}
            <Section style={timelineBox}>
              <Text style={timelineText}>
                ⏱️ <strong>Estimated Build Time:</strong> 2-4 weeks
              </Text>
              <Text style={paragraph}>
                I'll keep you updated on the progress via Discord. Feel free to reach out if you
                have any questions in the meantime!
              </Text>
            </Section>

            <Hr style={hr} />

            {/* Footer CTA */}
            <Section style={buttonContainer}>
              <Link href="https://discord.gg/your-server" style={button}>
                Join Our Discord
              </Link>
            </Section>

            <Text style={footer}>
              Thanks for being an awesome patron! ❤️
              <br />- DefCat
            </Text>
          </Section>

          {/* Email Footer */}
          <Section style={emailFooter}>
            <Text style={footerText}>
              This is a confirmation email for your custom Commander deck submission.
            </Text>
            <Text style={footerText}>Questions? Reply to this email or reach out on Discord.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default DeckSubmissionEmail

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  padding: '32px 40px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: '8px 8px 0 0',
  textAlign: 'center' as const,
}

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 8px',
  padding: '0',
}

const submissionNumber = {
  color: '#e0e7ff',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0',
}

const content = {
  padding: '0 40px',
}

const greeting = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#1f2937',
  marginTop: '32px',
  marginBottom: '16px',
}

const h2 = {
  color: '#1f2937',
  fontSize: '22px',
  fontWeight: 'bold',
  margin: '24px 0 16px',
}

const paragraph = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

const detailsBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  margin: '16px 0',
}

const detailItem = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '8px 0',
}

const stepsList = {
  margin: '16px 0',
}

const step = {
  color: '#4b5563',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '12px 0',
  paddingLeft: '8px',
}

const stepNumber = {
  display: 'inline-block',
  width: '28px',
  height: '28px',
  backgroundColor: '#667eea',
  color: '#ffffff',
  borderRadius: '50%',
  textAlign: 'center' as const,
  lineHeight: '28px',
  fontWeight: 'bold',
  fontSize: '14px',
  marginRight: '12px',
}

const timelineBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fbbf24',
  borderRadius: '8px',
  padding: '20px',
  margin: '16px 0',
}

const timelineText = {
  color: '#78350f',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 8px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#667eea',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
}

const footer = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'center' as const,
  marginTop: '32px',
}

const emailFooter = {
  backgroundColor: '#f9fafb',
  padding: '24px 40px',
  borderRadius: '0 0 8px 8px',
  marginTop: '32px',
}

const footerText = {
  color: '#9ca3af',
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center' as const,
  margin: '8px 0',
}
