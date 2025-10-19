import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { normalizeColorIdentity, getColorIdentity } from '@/lib/utility/color-identity';
import { useDeckSubmission } from '@/hooks/useDeckSubmission';
import type { DeckSubmissionFormData } from '@/types/form';

interface DeckFormData {
  patreonUsername: string;
  email: string;
  discordUsername: string;
  mysteryDeck: string;
  commander: string;
  colorPreference: string;
  theme: string;
  bracket: string;
  budget: string;
  coffee: string;
  idealDate: string;
}

interface FormErrors {
  [key: string]: string;
}

interface ColorOption {
  identity: string;
  label: string;
}

export default function CommanderDeckForm() {
  const [formData, setFormData] = useState<DeckFormData>({
    patreonUsername: '',
    email: '',
    discordUsername: '',
    mysteryDeck: '',
    commander: '',
    colorPreference: '',
    theme: '',
    bracket: '',
    budget: '',
    coffee: '',
    idealDate: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const { submitDeck, isLoading, error: submissionError, submissionNumber } = useDeckSubmission();

  // Color options using actual color identities
  const colorOptions: ColorOption[] = [
    // Mono colors
    { identity: 'W', label: 'Mono White' },
    { identity: 'U', label: 'Mono Blue' },
    { identity: 'B', label: 'Mono Black' },
    { identity: 'R', label: 'Mono Red' },
    { identity: 'G', label: 'Mono Green' },
    { identity: 'C', label: 'Colorless' },
    
    // Two colors (Guilds)
    { identity: 'WU', label: 'Azorius (White/Blue)' },
    { identity: 'UB', label: 'Dimir (Blue/Black)' },
    { identity: 'BR', label: 'Rakdos (Black/Red)' },
    { identity: 'RG', label: 'Gruul (Red/Green)' },
    { identity: 'GW', label: 'Selesnya (Green/White)' },
    { identity: 'WB', label: 'Orzhov (White/Black)' },
    { identity: 'UR', label: 'Izzet (Blue/Red)' },
    { identity: 'BG', label: 'Golgari (Black/Green)' },
    { identity: 'RW', label: 'Boros (Red/White)' },
    { identity: 'GU', label: 'Simic (Green/Blue)' },
    
    // Three colors (Shards)
    { identity: 'GWU', label: 'Bant (Green/White/Blue)' },
    { identity: 'WUB', label: 'Esper (White/Blue/Black)' },
    { identity: 'UBR', label: 'Grixis (Blue/Black/Red)' },
    { identity: 'BRG', label: 'Jund (Black/Red/Green)' },
    { identity: 'RGW', label: 'Naya (Red/Green/White)' },
    
    // Three colors (Wedges)
    { identity: 'WBG', label: 'Abzan (White/Black/Green)' },
    { identity: 'URW', label: 'Jeskai (Blue/Red/White)' },
    { identity: 'BRW', label: 'Mardu (Black/Red/White)' },
    { identity: 'GUB', label: 'Sultai (Green/Blue/Black)' },
    { identity: 'RGU', label: 'Temur (Red/Green/Blue)' },
    
    // Four colors
    { identity: 'WUBR', label: 'Yore-Tiller (No Green)' },
    { identity: 'UBRG', label: 'Glint-Eye (No White)' },
    { identity: 'BRGW', label: 'Dune-Brood (No Blue)' },
    { identity: 'RGWU', label: 'Ink-Treader (No Black)' },
    { identity: 'GWUB', label: 'Witch-Maw (No Red)' },
    
    // Five colors
    { identity: 'WUBRG', label: 'WUBRG SOUP' }
  ];

  const bracketOptions = [
    'Bracket 1',
    'Bracket 2',
    'Bracket 3',
    'Bracket 4',
    'Bracket 5',
    'TEDH Perfect tournament optimized deck',
    'I DON\'T CARE GO FOR IT DEFCAT'
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.patreonUsername.trim()) {
      newErrors.patreonUsername = 'Patreon username is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.discordUsername.trim()) {
      newErrors.discordUsername = 'Discord username is required';
    }
    if (!formData.mysteryDeck) {
      newErrors.mysteryDeck = 'Please select an option';
    }
    if (!formData.colorPreference) {
      newErrors.colorPreference = 'Color preference is required';
    }
    if (!formData.bracket) {
      newErrors.bracket = 'Bracket selection is required';
    }
    if (!formData.budget.trim()) {
      newErrors.budget = 'Budget information is required';
    }
    if (!formData.coffee.trim()) {
      newErrors.coffee = 'Coffee preference is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Convert form data to submission format
      const submissionData: DeckSubmissionFormData = {
        patreonUsername: formData.patreonUsername,
        email: formData.email,
        discordUsername: formData.discordUsername,
        mysteryDeck: formData.mysteryDeck === 'yes',
        commander: formData.commander || undefined,
        colorPreference: formData.colorPreference,
        theme: formData.theme || undefined,
        bracket: formData.bracket,
        budget: formData.budget,
        coffee: formData.coffee,
        idealDate: formData.idealDate || undefined,
      };

      // Submit the deck
      await submitDeck(submissionData);
    }
  };

  const handleClear = () => {
    setFormData({
      patreonUsername: '',
      email: '',
      discordUsername: '',
      mysteryDeck: '',
      commander: '',
      colorPreference: '',
      theme: '',
      bracket: '',
      budget: '',
      coffee: '',
      idealDate: ''
    } as DeckFormData);
    setErrors({});
  };

  const handleInputChange = (field: keyof DeckFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Render mana symbols for a color identity
  const renderManaSymbols = (identity: string) => {
    const normalized = normalizeColorIdentity(identity);
    const colorInfo = getColorIdentity(normalized);
    
    if (!colorInfo) return null;
    
    // Use individual symbols for display
    return (
      <div className="flex gap-1 items-center">
        {colorInfo.individual.map((color: string, idx: number) => (
          <i key={idx} className={`ms ms-${color.toLowerCase()} ms-cost ms-shadow`} />
        ))}
      </div>
    );
  };

  if (submissionNumber !== null) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 bg-background">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-radial-top)] via-transparent to-[var(--bg-radial-bottom)] opacity-[var(--bg-gradient-opacity)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--bg-dot-color)_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md glass-card">
            <CardContent className="pt-6 text-center space-y-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">
                  Submission Received!
                </h2>
                <p className="text-xl font-semibold text-[var(--mana-color)]">
                  Submission #{submissionNumber}
                </p>
                <p className="text-muted-foreground">
                  Thank you for your custom Commander deck submission. Check your email for confirmation details, and I'll get started on your deck soon!
                </p>
              </div>

              <Button 
                onClick={handleClear}
                className="w-full bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] hover:opacity-90 transition-opacity"
              >
                Submit Another
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden pb-20">
      {/* Animated background with MTG theme */}
      <div className="fixed inset-0 bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-radial-top)] via-transparent to-[var(--bg-radial-bottom)] opacity-[var(--bg-gradient-opacity)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--bg-dot-color)_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Header Card */}
        <Card className="mb-8 glass-card border-tinted overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] opacity-10" />
          <CardHeader className="relative pb-8">
            <div className="flex items-start gap-3">
              <Sparkles className="w-8 h-8 text-[var(--mana-color)] mt-1" />
              <div className="flex-1">
                <CardTitle className="text-4xl font-bold mb-3 bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] bg-clip-text text-transparent">
                  Custom Commander Deck Submission
                </CardTitle>
                <CardDescription className="text-base">
                  If you are a patron of my $50 tier on Patreon or higher, here is where you get your custom deck made!
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Form Card */}
        <Card className="glass-card border-tinted">
          <CardContent className="pt-8 space-y-8">
            <p className="text-sm text-muted-foreground">* Indicates required question</p>

            {/* Error Alert */}
            {submissionError && (
              <Alert variant="destructive" className="glass-card border-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {submissionError}
                </AlertDescription>
              </Alert>
            )}

            {/* Patreon Username */}
            <div className="space-y-2">
              <Label htmlFor="patreon" className="text-base font-semibold">
                Your Patreon User Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="patreon"
                value={formData.patreonUsername}
                onChange={(e) => handleInputChange('patreonUsername', e.target.value)}
                placeholder="Your answer"
                className={`glass-input ${errors.patreonUsername ? 'border-destructive' : ''}`}
              />
              {errors.patreonUsername && (
                <p className="text-sm text-destructive">{errors.patreonUsername}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold">
                Your Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Your answer"
                className={`glass-input ${errors.email ? 'border-destructive' : ''}`}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Discord Username */}
            <div className="space-y-2">
              <Label htmlFor="discord" className="text-base font-semibold">
                What is your Discord Username? <span className="text-destructive">*</span>
              </Label>
              <Input
                id="discord"
                value={formData.discordUsername}
                onChange={(e) => handleInputChange('discordUsername', e.target.value)}
                placeholder="Your answer"
                className={`glass-input ${errors.discordUsername ? 'border-destructive' : ''}`}
              />
              {errors.discordUsername && (
                <p className="text-sm text-destructive">{errors.discordUsername}</p>
              )}
            </div>

            {/* Mystery Deck */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Do you want a mystery deck? <span className="text-destructive">*</span>
              </Label>
              <RadioGroup
                value={formData.mysteryDeck}
                onValueChange={(value) => handleInputChange('mysteryDeck', value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 glass-card p-4 rounded-lg hover:border-[var(--mana-color)] transition-colors cursor-pointer">
                  <RadioGroupItem value="yes" id="mystery-yes" />
                  <Label htmlFor="mystery-yes" className="flex-1 cursor-pointer">
                    Yes just make something fun, I trust you
                  </Label>
                </div>
                <div className="flex items-center space-x-3 glass-card p-4 rounded-lg hover:border-[var(--mana-color)] transition-colors cursor-pointer">
                  <RadioGroupItem value="no" id="mystery-no" />
                  <Label htmlFor="mystery-no" className="flex-1 cursor-pointer">
                    No I have an idea, I'm cool like that
                  </Label>
                </div>
              </RadioGroup>
              {errors.mysteryDeck && (
                <p className="text-sm text-destructive">{errors.mysteryDeck}</p>
              )}
            </div>

            {/* Commander */}
            <div className="space-y-2">
              <Label htmlFor="commander" className="text-base font-semibold">
                Is there a Commander you want me to build for you?
              </Label>
              <Input
                id="commander"
                value={formData.commander}
                onChange={(e) => handleInputChange('commander', e.target.value)}
                placeholder="Your answer"
                className="glass-input"
              />
            </div>

            {/* Color Preference with Mana Symbols */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                IF YOU DID NOT PICK A COMMANDER FOR ME TO BUILD, is there a color you'd prefer? <span className="text-destructive">*</span>
              </Label>
              <div className="glass-card p-4 rounded-lg max-h-96 overflow-y-auto space-y-2 scrollbar-thin">
                <RadioGroup
                  value={formData.colorPreference}
                  onValueChange={(value) => handleInputChange('colorPreference', value)}
                >
                  {colorOptions.map((option) => (
                    <div 
                      key={option.identity} 
                      className="flex items-center space-x-3 p-3 rounded hover:bg-accent-tinted transition-colors cursor-pointer group"
                    >
                      <RadioGroupItem value={option.identity} id={`color-${option.identity}`} />
                      <Label 
                        htmlFor={`color-${option.identity}`} 
                        className="flex-1 cursor-pointer flex items-center gap-3"
                      >
                        <div className="flex-shrink-0">
                          {renderManaSymbols(option.identity)}
                        </div>
                        <span className="group-hover:text-[var(--mana-color)] transition-colors">
                          {option.label}
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              {errors.colorPreference && (
                <p className="text-sm text-destructive">{errors.colorPreference}</p>
              )}
            </div>

            {/* Theme */}
            <div className="space-y-2">
              <Label htmlFor="theme" className="text-base font-semibold">
                Is there a theme you had in mind?
              </Label>
              <Input
                id="theme"
                value={formData.theme}
                onChange={(e) => handleInputChange('theme', e.target.value)}
                placeholder="Your answer"
                className="glass-input"
              />
            </div>

            {/* Bracket */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                What Bracket is this deck going to be? <span className="text-destructive">*</span>
              </Label>
              <RadioGroup
                value={formData.bracket}
                onValueChange={(value) => handleInputChange('bracket', value)}
                className="space-y-3"
              >
                {bracketOptions.map((bracket) => (
                  <div key={bracket} className="flex items-center space-x-3 glass-card p-4 rounded-lg hover:border-[var(--mana-color)] transition-colors cursor-pointer">
                    <RadioGroupItem value={bracket} id={`bracket-${bracket}`} />
                    <Label htmlFor={`bracket-${bracket}`} className="flex-1 cursor-pointer">
                      {bracket}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.bracket && (
                <p className="text-sm text-destructive">{errors.bracket}</p>
              )}
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-base font-semibold">
                Do you have a budget? If so, how much? <span className="text-destructive">*</span>
              </Label>
              <Input
                id="budget"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                placeholder="Your answer"
                className={`glass-input ${errors.budget ? 'border-destructive' : ''}`}
              />
              {errors.budget && (
                <p className="text-sm text-destructive">{errors.budget}</p>
              )}
            </div>

            {/* Coffee */}
            <div className="space-y-2">
              <Label htmlFor="coffee" className="text-base font-semibold">
                Do you drink coffee, if so what's your favorite coffee order and brewing method? <span className="text-destructive">*</span>
              </Label>
              <Input
                id="coffee"
                value={formData.coffee}
                onChange={(e) => handleInputChange('coffee', e.target.value)}
                placeholder="Your answer"
                className={`glass-input ${errors.coffee ? 'border-destructive' : ''}`}
              />
              {errors.coffee && (
                <p className="text-sm text-destructive">{errors.coffee}</p>
              )}
            </div>

            {/* Ideal Date */}
            <div className="space-y-2">
              <Label htmlFor="idealDate" className="text-base font-semibold">
                What is your ideal date?
              </Label>
              <Input
                id="idealDate"
                value={formData.idealDate}
                onChange={(e) => handleInputChange('idealDate', e.target.value)}
                placeholder="Your answer"
                className="glass-input"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] hover:opacity-90 transition-opacity text-white font-semibold h-12 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </Button>
              <Button
                onClick={handleClear}
                disabled={isLoading}
                variant="outline"
                className="px-8 h-12 border-tinted hover:bg-accent-tinted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear form
              </Button>
            </div>

            <Alert className="mt-6 glass-card border-tinted">
              <AlertDescription className="text-sm text-center text-muted-foreground">
                Never submit passwords through this form.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center mt-8 text-sm text-muted-foreground">
          This form was created for DefCat
        </p>
      </div>

      <style jsx>{`
        .glass-card {
          background: linear-gradient(
            135deg,
            var(--glass-bg-start),
            var(--glass-bg-end)
          );
          backdrop-filter: blur(var(--glass-blur));
          -webkit-backdrop-filter: blur(var(--glass-blur));
          border: 1px solid var(--glass-border);
          box-shadow: 0 8px 32px 0 var(--glass-shadow);
        }

        .glass-card:hover {
          background: linear-gradient(
            135deg,
            rgba(var(--glass-base-rgb), calc(0.1 + var(--glass-hover-opacity-boost))),
            rgba(var(--glass-base-rgb), calc(0.05 + var(--glass-hover-opacity-boost)))
          );
          border-color: rgba(var(--glass-border-rgb), calc(0.18 + var(--glass-border-hover-opacity-boost)));
        }

        .glass-input {
          background: rgba(var(--glass-base-rgb), 0.05);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid var(--glass-border);
          transition: all 0.3s ease;
        }

        .glass-input:focus {
          background: rgba(var(--glass-base-rgb), 0.08);
          border-color: var(--mana-color);
          box-shadow: 0 0 0 3px var(--focus-ring);
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(var(--glass-base-rgb), 0.05);
          border-radius: 4px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: var(--mana-color);
          border-radius: 4px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: var(--brand-dark);
        }

        /* Mana symbol styling */
        .ms {
          font-size: 1.25em;
        }

        .ms-cost {
          display: inline-block;
        }
      `}</style>
    </div>
  );
}
