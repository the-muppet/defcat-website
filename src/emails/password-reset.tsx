// emails/PasswordResetEmail.tsx

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface PasswordResetEmailProps {
  resetLink: string
  email: string
}

export const PasswordResetEmail = ({
  resetLink = 'https://defcat.com/auth/reset-password',
  email = 'user@example.com',
}: PasswordResetEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Set your password for DefCat's DeckVault</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>🔐 Set Your Password</Heading>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={greeting}>Welcome to DefCat's DeckVault! 👋</Text>

            <Text style={paragraph}>
              An account has been created for you at <strong>{email}</strong>. Click the button
              below to set your password and access the vault.
            </Text>

            <Hr style={hr} />

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Link href={resetLink} style={button}>
                Set My Password
              </Link>
            </Section>

            <Hr style={hr} />

            {/* Security Notice */}
            <Section style={warningBox}>
              <Text style={warningText}>
                🔒 <strong>Security Notice</strong>
              </Text>
              <Text style={paragraph}>
                This link will expire in 24 hours. If you didn't request this account, you can
                safely ignore this email.
              </Text>
            </Section>

            <Text style={footer}>
              If the button doesn't work, copy and paste this link into your browser:
              <br />
              <Link href={resetLink} style={link}>
                {resetLink}
              </Link>
            </Text>
          </Section>

          {/* Email Footer */}
          <Section style={emailFooter}>
            <Text style={footerText}>This is an automated email from DefCat's DeckVault.</Text>
            <Text style={footerText}>Questions? Contact us at support@defcat.com</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default PasswordResetEmail

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
  margin: '0',
  padding: '0',
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

const warningBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fbbf24',
  borderRadius: '8px',
  padding: '20px',
  margin: '16px 0',
}

const warningText = {
  color: '#78350f',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 8px',
}

const link = {
  color: '#667eea',
  textDecoration: 'underline',
  fontSize: '14px',
  wordBreak: 'break-all' as const,
}

const footer = {
  color: '#6b7280',
  fontSize: '14px',
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
