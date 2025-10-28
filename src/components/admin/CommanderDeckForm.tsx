import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Palette,
  Trophy,
  Coffee,
  CheckCircle,
  Loader2,
  AlertCircle,
  Swords,
  Mail,
  Hash,
  DollarSign,
  Calendar,
  MessageSquare,
  User,
  Hourglass,
} from 'lucide-react'
import { bracketOptions, COLOR_MAPPINGS } from '@/types/core'
import { ColorIdentity } from '@/lib/utility/color-identity'
import { ManaSymbols } from '@/components/decks/ManaSymbols'
import { toast } from 'sonner'

export default function PagedDeckForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [tierError, setTierError] = useState<string | null>(null)
  const [userTier, setUserTier] = useState<string | null>(null)
  const [submissionsRemaining, setSubmissionsRemaining] = useState<number | null>(null)
  const [willBeQueued, setWillBeQueued] = useState(false)
  const [totalSubmissions, setTotalSubmissions] = useState(0)
  const MAX_QUEUED = 3
  const [formData, setFormData] = useState({
    email: '',
    moxfieldUsername: '',
    discordUsername: '',
    mysteryDeck: '',
    commander: '',
    colorPreference: [] as string[],
    theme: '',
    bracket: '',
    budget: '',
    coffee: '',
    idealDate: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const totalSteps = 5

  // Check tier eligibility on mount
  useEffect(() => {
    const checkEligibility = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          setTierError('Please log in to submit a deck request.')
          setIsLoading(false)
          return
        }

        // Get user's profile with tier info
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('patreon_tier, email, role')
          .eq('id', user.id)
          .single()

        if (profileError || !profile) {
          setTierError('Unable to verify your Patreon tier. Please ensure your account is linked.')
          setIsLoading(false)
          return
        }

        const tier = profile.patreon_tier
        const role = profile.role
        setUserTier(tier)

        // Admins and moderators bypass tier checks
        const isAdmin = role === 'admin' || role === 'moderator'

        // Check if user has eligible tier (skip for admins)
        if (!isAdmin) {
          const eligibleTiers = ['Duke', 'Wizard', 'ArchMage']
          if (!eligibleTiers.includes(tier)) {
            setTierError(
              `Deck submissions require Duke tier ($50/month) or higher. Your current tier: ${tier || 'None'}`
            )
            setIsLoading(false)
            return
          }
        }

        // Check monthly submission limit (skip for admins)
        if (!isAdmin) {
          const maxSubmissions = tier === 'ArchMage' ? 2 : 1

          // Get all submissions this month (pending, queued, completed)
          const { data: submissions, error: countError } = await supabase
            .from('deck_submissions')
            .select('status')
            .eq('user_id', user.id)
            .gte(
              'created_at',
              new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
            )

          if (countError) {
            console.error('Error checking submissions:', countError)
          }

          const activeSubmissions =
            submissions?.filter(
              (s) =>
                s.status === 'pending' || s.status === 'in_progress' || s.status === 'completed'
            ).length || 0

          const queuedSubmissions = submissions?.filter((s) => s.status === 'queued').length || 0
          const totalSubmissionsCount = activeSubmissions + queuedSubmissions

          setTotalSubmissions(totalSubmissionsCount)

          const remaining = maxSubmissions - activeSubmissions
          setSubmissionsRemaining(remaining)

          if (queuedSubmissions >= MAX_QUEUED) {
            setTierError(
              `You have ${MAX_QUEUED} deck requests already queued. Please wait for them to be processed before submitting more.`
            )
            setIsLoading(false)
            return
          }

          if (remaining <= 0) {
            setWillBeQueued(true)
          }
        } else {
          // Admins have unlimited submissions
          setSubmissionsRemaining(999)
        }

        if (profile.email) {
          setFormData((prev) => ({ ...prev, email: profile.email }))
        }

        setIsLoading(false)
      } catch (err) {
        console.error('Eligibility check error:', err)
        setTierError('An error occurred while checking your eligibility.')
        setIsLoading(false)
      }
    }

    checkEligibility()
  }, [])

  const steps = [
    { id: 1, name: 'Basic Info', icon: User },
    { id: 2, name: 'Deck Type', icon: Sparkles },
    { id: 3, name: 'Colors & Theme', icon: Palette },
    { id: 4, name: 'Power Level', icon: Trophy },
    { id: 5, name: 'Final Details', icon: Coffee },
  ]

  const validateStep = (step) => {
    const stepErrors = {}

    switch (step) {
      case 1:
        if (!formData.email.trim()) {
          stepErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          stepErrors.email = 'Email is invalid'
        }
        if (!formData.moxfieldUsername.trim()) {
          stepErrors.moxfieldUsername = 'Moxfield username is required'
        }
        // Discord username is optional
        break
      case 2:
        if (!formData.mysteryDeck) {
          stepErrors.mysteryDeck = 'Please select an option'
        }
        break
      case 3:
        if (
          formData.mysteryDeck === 'no' &&
          !formData.commander &&
          formData.colorPreference.length === 0
        ) {
          stepErrors.colorPreference = 'Please select at least one color or specify a commander'
        }
        break
      case 4:
        if (!formData.bracket) {
          stepErrors.bracket = 'Bracket selection is required'
        }
        if (!formData.budget.trim()) {
          stepErrors.budget = 'Budget information is required'
        }
        break
      case 5:
        if (!formData.coffee.trim()) {
          stepErrors.coffee = 'Coffee preference is required'
        }
        break
      default:
        break
    }

    return stepErrors
  }

  const handleNext = () => {
    const stepErrors = validateStep(currentStep)
    if (Object.keys(stepErrors).length === 0) {
      setCompletedSteps([...completedSteps, currentStep])
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1)
      }
    } else {
      setErrors(stepErrors)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (field, value) => {
    if (field === 'colorPreference') {
      setFormData((prev) => {
        const currentColors = prev.colorPreference as string[]
        let newColors: string[]

        if (currentColors.includes(value)) {
          // Remove if already selected
          newColors = currentColors.filter((c) => c !== value)
        } else if (currentColors.length < 3) {
          // Add if less than 3 selected
          newColors = [...currentColors, value]
        } else {
          // Already at max, don't add
          return prev
        }

        return { ...prev, colorPreference: newColors }
      })
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSubmit = async (isDraft = false) => {
    // Skip validation for drafts
    const stepErrors = isDraft ? {} : validateStep(currentStep)
    if (Object.keys(stepErrors).length === 0) {
      setIsLoading(true)

      try {
        const supabase = createClient()

        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          console.error('User not authenticated:', userError)
          setErrors({ submit: 'Please log in to submit a deck request' })
          setIsLoading(false)
          return
        }

        // Get user profile to fetch patreon_id, patreon_tier, and email
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('patreon_id, patreon_tier, email')
          .eq('id', user.id)
          .single()

        if (profileError || !profile) {
          console.error('Failed to fetch user profile:', profileError)
          setErrors({
            submit: 'Failed to fetch user profile. Please try again.',
          })
          setIsLoading(false)
          return
        }

        // Only check Patreon requirement for non-draft submissions
        if (!isDraft && (!profile.patreon_id || !profile.patreon_tier)) {
          setErrors({
            submit: 'Your account must be linked to Patreon to submit a deck request.',
          })
          setIsLoading(false)
          return
        }

        // Determine submission status
        const submissionStatus = isDraft ? 'draft' : willBeQueued ? 'queued' : 'pending'

        // Submit deck request to database
        const { data, error } = await supabase
          .from('deck_submissions')
          .insert({
            user_id: user.id,
            patreon_id: profile.patreon_id || '',
            patreon_tier: profile.patreon_tier || '',
            patreon_username: profile.email.split('@')[0], // Use email prefix as fallback patreon username
            email: formData.email || '',
            moxfield_username: formData.moxfieldUsername || '',
            discord_username: formData.discordUsername || '',
            mystery_deck: formData.mysteryDeck === 'yes',
            commander: formData.commander || null,
            color_preference: formData.colorPreference.join(',') || null,
            theme: formData.theme || null,
            bracket: formData.bracket || null,
            budget: formData.budget || null,
            coffee_preference: formData.coffee || null,
            ideal_date: formData.idealDate || null,
            status: submissionStatus,
          })
          .select()
          .single()

        if (error) {
          console.error('Submission error:', error)

          // Check for specific error messages
          let errorMessage = 'Failed to submit deck request. Please try again.'

          if (error.message?.includes('Draft limit reached')) {
            errorMessage = error.message
          } else if (error.message?.includes('Monthly submission limit')) {
            errorMessage = error.message
          }

          setErrors({
            submit: errorMessage,
          })
          setIsLoading(false)
          return
        }

        setIsLoading(false)

        if (isDraft) {
          toast.success('Draft saved successfully!', {
            description: 'You can continue editing later from your profile.',
            duration: 5000,
          })
        } else {
          setShowSuccess(true)
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setErrors({
          submit: 'An unexpected error occurred. Please try again.',
        })
        setIsLoading(false)
      }
    } else {
      setErrors(stepErrors)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h2 className="step-title">
              <User className="step-icon" />
              Let's start with the basics
            </h2>
            <p className="step-description">
              We need some information to get in touch with you about your custom deck.
            </p>

            <div className="form-fields">
              <div className="form-group">
                <label htmlFor="email">
                  <Mail className="inline-icon" />
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="your.email@example.com"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="moxfieldUsername">
                  Moxfield Username <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="moxfieldUsername"
                  value={formData.moxfieldUsername}
                  onChange={(e) => handleInputChange('moxfieldUsername', e.target.value)}
                  className={`form-input ${errors.moxfieldUsername ? 'error' : ''}`}
                  placeholder="Enter your Moxfield username"
                />
                {errors.moxfieldUsername && (
                  <span className="error-message">{errors.moxfieldUsername}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="discordUsername">
                  <Hash className="inline-icon" />
                  Discord Username <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <input
                  type="text"
                  id="discordUsername"
                  value={formData.discordUsername}
                  onChange={(e) => handleInputChange('discordUsername', e.target.value)}
                  className={`form-input ${errors.discordUsername ? 'error' : ''}`}
                  placeholder="YourDiscord#1234"
                />
                {errors.discordUsername && (
                  <span className="error-message">{errors.discordUsername}</span>
                )}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="step-content">
            <h2 className="step-title">
              <Sparkles className="step-icon" />
              Mystery Deck or Custom Build?
            </h2>
            <p className="step-description">
              Would you like me to surprise you or do you have something specific in mind?
            </p>

            <div className="radio-cards">
              <label className={`radio-card ${formData.mysteryDeck === 'yes' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="mysteryDeck"
                  value="yes"
                  checked={formData.mysteryDeck === 'yes'}
                  onChange={(e) => handleInputChange('mysteryDeck', e.target.value)}
                />
                <div className="radio-content">
                  <div className="radio-header">
                    <Sparkles className="radio-icon" />
                    <span className="radio-title">Mystery Deck</span>
                  </div>
                  <p className="radio-description">
                    Yes, just make something fun, I trust you! Let the creativity flow.
                  </p>
                </div>
              </label>

              <label className={`radio-card ${formData.mysteryDeck === 'no' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="mysteryDeck"
                  value="no"
                  checked={formData.mysteryDeck === 'no'}
                  onChange={(e) => handleInputChange('mysteryDeck', e.target.value)}
                />
                <div className="radio-content">
                  <div className="radio-header">
                    <Swords className="radio-icon" />
                    <span className="radio-title">Custom Build</span>
                  </div>
                  <p className="radio-description">
                    No, I have an idea I'm cool like that. I'll specify what I want.
                  </p>
                </div>
              </label>
            </div>
            {errors.mysteryDeck && (
              <span className="error-message center">{errors.mysteryDeck}</span>
            )}

            {formData.mysteryDeck === 'no' && (
              <div className="form-group mt-4">
                <label htmlFor="commander">Commander (Optional)</label>
                <input
                  type="text"
                  id="commander"
                  value={formData.commander}
                  onChange={(e) => handleInputChange('commander', e.target.value)}
                  className="form-input"
                  placeholder="e.g., Atraxa, Praetors' Voice"
                />
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="step-content">
            <h2 className="step-title">
              <Palette className="step-icon" />
              Colors & Theme
            </h2>
            <p className="step-description">
              {formData.mysteryDeck === 'yes'
                ? 'Even for a mystery deck, any color preferences?'
                : 'Select your preferred color combination and theme.'}
            </p>

            <div className="form-group">
              <label>
                Color Preference (select up to 3){' '}
                {formData.mysteryDeck === 'no' && !formData.commander && (
                  <span className="required">*</span>
                )}
              </label>
              <div className="grid grid-cols-5 gap-x-6 gap-y-2 justify-items-center">
                {Object.entries(COLOR_MAPPINGS)
                  .filter(([colorId]) => colorId !== 'C' && colorId !== 'WUBRG')
                  .map(([colorId, colorData]) => (
                    <label
                      key={colorId}
                      className="cursor-pointer flex flex-col items-center gap-2"
                      title={colorData.name}
                    >
                      <input
                        type="checkbox"
                        name="colorPreference"
                        checked={formData.colorPreference.includes(colorId)}
                        onChange={() => handleInputChange('colorPreference', colorId)}
                        className="sr-only"
                      />
                      <div
                        className={`inline-flex gap-0.5 items-center p-2 rounded-lg transition-all hover:bg-accent-tinted ${formData.colorPreference.includes(colorId) ? 'bg-accent-tinted ring-2 ring-[var(--mana-color)]' : ''}`}
                      >
                        {colorData.individual.map((symbol, idx) => (
                          <i
                            key={idx}
                            className={`ms ms-${symbol.toLowerCase()} ms-3x transition-all duration-200 hover:scale-110`}
                            aria-label={`${symbol} mana`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-center">{colorData.name}</span>
                    </label>
                  ))}
                <div className="col-span-5 flex justify-center gap-6">
                  {['C', 'WUBRG'].map((colorId) => {
                    const colorData = COLOR_MAPPINGS[colorId]
                    return (
                      <label
                        key={colorId}
                        className="cursor-pointer flex flex-col items-center gap-2"
                        title={colorData.name}
                      >
                        <input
                          type="checkbox"
                          name="colorPreference"
                          checked={formData.colorPreference.includes(colorId)}
                          onChange={() => handleInputChange('colorPreference', colorId)}
                          className="sr-only"
                        />
                        <div
                          className={`inline-flex gap-0.5 items-center p-2 rounded-lg transition-all hover:bg-accent-tinted ${formData.colorPreference.includes(colorId) ? 'bg-accent-tinted ring-2 ring-[var(--mana-color)]' : ''}`}
                        >
                          {colorData.individual.map((symbol, idx) => (
                            <i
                              key={idx}
                              className={`ms ms-${symbol.toLowerCase()} ms-3x transition-all duration-200 hover:scale-110`}
                              aria-label={`${symbol} mana`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-center">{colorData.name}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
              {errors.colorPreference && (
                <span className="error-message">{errors.colorPreference}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="theme">
                <MessageSquare className="inline-icon" />
                Theme (Optional)
              </label>
              <input
                type="text"
                id="theme"
                value={formData.theme}
                onChange={(e) => handleInputChange('theme', e.target.value)}
                className="form-input"
                placeholder="e.g., Tribal, Artifacts, Spellslinger, Voltron"
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="step-content">
            <h2 className="step-title">
              <Trophy className="step-icon" />
              Power Level & Budget
            </h2>
            <p className="step-description">
              Let's determine the competitive level and budget for your deck.
            </p>

            <div className="form-group">
              <label>
                Bracket Selection <span className="required">*</span>
              </label>
              <div className="bracket-grid">
                {bracketOptions.map((bracket) => (
                  <label
                    key={bracket.value}
                    className={`bracket-option ${formData.bracket === bracket.value ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="bracket"
                      value={bracket.value}
                      checked={formData.bracket === bracket.value}
                      onChange={(e) => handleInputChange('bracket', e.target.value)}
                    />
                    <div className="bracket-content">
                      <span className="bracket-label">{bracket.label}</span>
                      <span className="bracket-description">{bracket.description}</span>
                    </div>
                  </label>
                ))}
              </div>
              {errors.bracket && <span className="error-message">{errors.bracket}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="budget">
                <DollarSign className="inline-icon" />
                Budget <span className="required">*</span>
              </label>
              <input
                type="text"
                id="budget"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                className={`form-input ${errors.budget ? 'error' : ''}`}
                placeholder="e.g., $100, No budget, Under $500"
              />
              {errors.budget && <span className="error-message">{errors.budget}</span>}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="step-content">
            <h2 className="step-title">
              <Coffee className="step-icon" />
              Final Details
            </h2>
            <p className="step-description">Almost done! Just a couple more fun questions.</p>

            <div className="form-fields">
              <div className="form-group">
                <label htmlFor="coffee">
                  <Coffee className="inline-icon" />
                  Coffee Preference <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="coffee"
                  value={formData.coffee}
                  onChange={(e) => handleInputChange('coffee', e.target.value)}
                  className={`form-input ${errors.coffee ? 'error' : ''}`}
                  placeholder="e.g., Black coffee, French press / Latte with oat milk"
                />
                {errors.coffee && <span className="error-message">{errors.coffee}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="idealDate">
                  <Calendar className="inline-icon" />
                  Ideal Date (Optional)
                </label>
                <input
                  type="text"
                  id="idealDate"
                  value={formData.idealDate}
                  onChange={(e) => handleInputChange('idealDate', e.target.value)}
                  className="form-input"
                  placeholder="Your answer"
                />
              </div>
            </div>

            <div className="review-section">
              <h3>Review Your Submission</h3>
              <div className="review-grid">
                <div className="review-item">
                  <span className="review-label">Email:</span>
                  <span className="review-value">{formData.email}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Moxfield:</span>
                  <span className="review-value">{formData.moxfieldUsername}</span>
                </div>
                {formData.discordUsername && (
                  <div className="review-item">
                    <span className="review-label">Discord:</span>
                    <span className="review-value">{formData.discordUsername}</span>
                  </div>
                )}
                <div className="review-item">
                  <span className="review-label">Type:</span>
                  <span className="review-value">
                    {formData.mysteryDeck === 'yes' ? 'Mystery Deck' : 'Custom Build'}
                  </span>
                </div>
                {formData.commander && (
                  <div className="review-item">
                    <span className="review-label">Commander:</span>
                    <span className="review-value">{formData.commander}</span>
                  </div>
                )}
                {formData.colorPreference.length > 0 && (
                  <div className="review-item">
                    <span className="review-label">Color Preferences:</span>
                    <span className="review-value">
                      <div className="flex gap-4 flex-wrap">
                        {formData.colorPreference.map((colorId) => {
                          const colorData = COLOR_MAPPINGS[colorId]
                          return (
                            <div key={colorId} className="flex items-center gap-2">
                              <div className="inline-flex gap-0.5 items-center">
                                {colorData.individual.map((symbol, idx) => (
                                  <i
                                    key={idx}
                                    className={`ms ms-${symbol.toLowerCase()} text-base`}
                                    aria-label={`${symbol} mana`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {colorData.name}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </span>
                  </div>
                )}
                {formData.theme && (
                  <div className="review-item">
                    <span className="review-label">Theme:</span>
                    <span className="review-value">{formData.theme}</span>
                  </div>
                )}
                <div className="review-item">
                  <span className="review-label">Bracket:</span>
                  <span className="review-value">
                    {bracketOptions.find((b) => b.value === formData.bracket)?.label ||
                      'Not selected'}
                  </span>
                </div>
                <div className="review-item">
                  <span className="review-label">Budget:</span>
                  <span className="review-value">{formData.budget}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Coffee:</span>
                  <span className="review-value">{formData.coffee}</span>
                </div>
                {formData.idealDate && (
                  <div className="review-item">
                    <span className="review-label">Ideal Date:</span>
                    <span className="review-value">{formData.idealDate}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Loading state while checking eligibility
  if (isLoading) {
    return (
      <div className="deck-form-container">
        <div className="form-wrapper">
          <div className="success-container">
            <div className="success-card">
              <Loader2 className="animate-spin success-icon" />
              <h2>Checking Eligibility...</h2>
              <p>Verifying your Patreon tier and submission status</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Tier error state - show BEFORE form
  if (tierError) {
    return (
      <div className="deck-form-container">
        <div className="form-wrapper">
          <div className="success-container">
            <div className="success-card">
              <AlertCircle className="success-icon" style={{ color: '#ef4444' }} />
              <h2>Unable to Submit</h2>
              <p>{tierError}</p>
              <div className="mt-4">
                <a href="/tiers" className="btn btn-primary">
                  View Tiers & Pricing
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showSuccess) {
    return (
      <div className="success-container">
        <div className="success-card">
          <CheckCircle className="success-icon" />
          <h2>{willBeQueued ? 'Deck Request Queued!' : 'Deck Request Submitted!'}</h2>
          <p>
            {willBeQueued ? (
              <>
                Your deck request has been queued and will be automatically processed when a slot
                opens up next month. You'll receive an email notification when work begins!
              </>
            ) : (
              <>Your custom Commander deck request has been received. We'll be in touch soon!</>
            )}
          </p>
          {!willBeQueued && submissionsRemaining !== null && submissionsRemaining > 0 && (
            <p className="success-meta">
              You have {submissionsRemaining - 1} slot(s) remaining this month
            </p>
          )}
          {willBeQueued && <p className="success-meta">Queue position: {totalSubmissions + 1}</p>}
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowSuccess(false)
              setCurrentStep(1)
              setFormData({
                email: '',
                moxfieldUsername: '',
                discordUsername: '',
                mysteryDeck: '',
                commander: '',
                colorPreference: [],
                theme: '',
                bracket: '',
                budget: '',
                coffee: '',
                idealDate: '',
              })
              setCompletedSteps([])
            }}
          >
            {totalSubmissions + 1 < MAX_QUEUED ? 'Submit Another Deck' : 'View My Submissions'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="deck-form-container">
      <div className="form-wrapper">
        <div className="form-header">
          <div className="header-logo">
            <Swords style={{ width: 32, height: 32, color: 'white' }} />
          </div>
          <h1 className="header-title">Custom Commander Deck Submission</h1>
          <p className="header-subtitle">Premium deck building for $50+ tier patrons</p>
          {userTier && submissionsRemaining !== null && (
            <div
              className="tier-info"
              style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: willBeQueued ? 'rgba(234, 179, 8, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                border: willBeQueued
                  ? '1px solid rgba(234, 179, 8, 0.3)'
                  : '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '0.5rem',
              }}
            >
              <p style={{ margin: 0, fontSize: '0.875rem' }}>
                <strong>{userTier} Tier:</strong>{' '}
                {submissionsRemaining > 0 ? (
                  <>
                    {submissionsRemaining} slot
                    {submissionsRemaining !== 1 ? 's' : ''} available this month
                  </>
                ) : (
                  <>
                    All slots filled - submissions will be queued ({MAX_QUEUED - totalSubmissions}{' '}
                    queue slots left)
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        <div className="progress-bar">
          {steps.map((step) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = completedSteps.includes(step.id)

            return (
              <div
                key={step.id}
                className={`progress-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => {
                  if (isCompleted || step.id < currentStep) {
                    setCurrentStep(step.id)
                  }
                }}
              >
                <div className="progress-step-circle">
                  {isCompleted ? (
                    <CheckCircle style={{ width: 20, height: 20 }} />
                  ) : (
                    <Icon style={{ width: 20, height: 20 }} />
                  )}
                </div>
                <span className="progress-step-label">{step.name}</span>
              </div>
            )
          })}
        </div>

        <div className="form-card">
          {renderStepContent()}

          <div className="form-actions">
            <button
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                borderColor: '#eab308',
                visibility: currentStep === 1 ? 'hidden' : 'visible',
              }}
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft style={{ width: 20, height: 20 }} />
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button className="btn btn-primary" onClick={handleNext}>
                Next
                <ChevronRight style={{ width: 20, height: 20 }} />
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  className="btn btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    borderColor: '#3b82f6',
                  }}
                  onClick={() => handleSubmit(true)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" style={{ width: 20, height: 20 }} />
                      Saving...
                    </>
                  ) : (
                    <>
                      Save for Later
                      <Hourglass style={{ width: 20, height: 20 }} />
                    </>
                  )}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleSubmit(false)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" style={{ width: 20, height: 20 }} />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Deck Request
                      <CheckCircle style={{ width: 20, height: 20 }} />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
