import React, { useState } from 'react';
import { CheckCircle2, Sparkles, Loader2, AlertCircle, Swords, Coffee, Palette, DollarSign, Calendar, Mail, User, Hash } from 'lucide-react';

interface FormErrors {
  patreonUsername?: string
  email?: string
  discordUsername?: string
  mysteryDeck?: string
  colorPreference?: string
  bracket?: string
  budget?: string
  coffee?: string
}


export default function CommanderDeckForm() {
  const [formData, setFormData] = useState({
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
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedBracket, setSelectedBracket] = useState('');

  const colorOptions = [
    { id: 'mono-white', label: 'Mono White', className: 'ms-w' },
    { id: 'mono-blue', label: 'Mono Blue', className: 'ms-u' },
    { id: 'mono-black', label: 'Mono Black', className: 'ms-b' },
    { id: 'mono-red', label: 'Mono Red', className: 'ms-r' },
    { id: 'mono-green', label: 'Mono Green', className: 'ms-g' },
    { id: 'colorless', label: 'Colorless', className: 'ms-c' },
    { id: 'azorius', label: 'Azorius', className: 'ms-guild-azorius' },
    { id: 'dimir', label: 'Dimir', className: 'ms-guild-dimir' },
    { id: 'rakdos', label: 'Rakdos', className: 'ms-guild-rakdos' },
    { id: 'gruul', label: 'Gruul', className: 'ms-guild-gruul' },
    { id: 'selesnya', label: 'Selesnya', className: 'ms-guild-selesnya' },
    { id: 'orzhov', label: 'Orzhov', className: 'ms-guild-orzhov' },
    { id: 'izzet', label: 'Izzet', className: 'ms-guild-izzet' },
    { id: 'golgari', label: 'Golgari', className: 'ms-guild-golgari' },
    { id: 'boros', label: 'Boros', className: 'ms-guild-boros' },
    { id: 'simic', label: 'Simic', className: 'ms-guild-simic' },
    { id: 'bant', label: 'Bant', className: 'ms-clan-bant' },
    { id: 'esper', label: 'Esper', className: 'ms-clan-esper' },
    { id: 'grixis', label: 'Grixis', className: 'ms-clan-grixis' },
    { id: 'jund', label: 'Jund', className: 'ms-b ms-r ms-u' },
    { id: 'naya', label: 'Naya', className: 'ms-clan-naya' },
    { id: 'abzan', label: 'Abzan', className: 'ms-clan-abzan' },
    { id: 'jeskai', label: 'Jeskai', className: 'ms-clan-jeskai' },
    { id: 'mardu', label: 'Mardu', className: 'ms-clan-mardu' },
    { id: 'sultai', label: 'Sultai', className: 'ms-clan-sultai' },
    { id: 'temur', label: 'Temur', className: 'ms-clan-temur' },
    { id: 'wubrg', label: 'WUBRG SOUP', className: 'ms-ci-wubrg' },
  ]

  const bracketOptions = [
    { value: 'bracket1', label: 'Bracket 1', description: 'Casual, precon level' },
    { value: 'bracket2', label: 'Bracket 2', description: 'Focused casual' },
    { value: 'bracket3', label: 'Bracket 3', description: 'Optimized casual' },
    { value: 'bracket4', label: 'Bracket 4', description: 'High power' },
    { value: 'bracket5', label: 'Bracket 5', description: 'Fringe competitive' },
    { value: 'cedh', label: 'cEDH', description: 'Perfect tournament optimized deck' },
    { value: 'wild', label: 'GO WILD', description: "I DON'T CARE GO FOR IT DEFCAT" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors as any[typeof field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleColorSelect = (colorId: string) => {
    setSelectedColor(colorId);
    handleInputChange('colorPreference', colorId);
  };

  const handleBracketSelect = (bracketValue: string) => {
    setSelectedBracket(bracketValue);
    handleInputChange('bracket', bracketValue);
  };

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
    if (formData.mysteryDeck === 'no' && !formData.commander && !formData.colorPreference) {
      newErrors.colorPreference = 'Please select a color preference or specify a commander';
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

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          handleClear();
        }, 5000);
      }, 2000);
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
    });
    setSelectedColor('');
    setSelectedBracket('');
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mb-4 animate-pulse shadow-lg shadow-purple-500/50">
            <Swords className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            Custom Commander Deck Submission
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            If you are a patron of my $50 tier on Patreon or higher, here is where you get your custom deck made!
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-8 p-6 bg-green-500/20 border border-green-500 rounded-xl backdrop-blur-sm animate-slideDown">
            <div className="flex items-center justify-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
              <span className="text-lg font-semibold text-green-400">Your deck submission has been received! We'll be in touch soon.</span>
            </div>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-500/20 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Basic Information Section */}
                <div className="bg-slate-900/50 rounded-xl p-6 border border-purple-500/10">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <User className="w-6 h-6 text-purple-400" />
                    Basic Information
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Patreon Username <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.patreonUsername}
                        onChange={(e) => handleInputChange('patreonUsername', e.target.value)}
                        className={`w-full px-4 py-3 bg-slate-800/50 border ${errors.patreonUsername ? 'border-red-500' : 'border-purple-500/30'} rounded-lg focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 text-white placeholder-gray-500 transition-all`}
                        placeholder="Enter your Patreon username"
                      />
                      {errors.patreonUsername && (
                        <p className="mt-1 text-sm text-red-400">{errors.patreonUsername}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Mail className="inline w-4 h-4 mr-1" />
                        Email <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full px-4 py-3 bg-slate-800/50 border ${errors.email ? 'border-red-500' : 'border-purple-500/30'} rounded-lg focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 text-white placeholder-gray-500 transition-all`}
                        placeholder="your.email@example.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Hash className="inline w-4 h-4 mr-1" />
                        Discord Username <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.discordUsername}
                        onChange={(e) => handleInputChange('discordUsername', e.target.value)}
                        className={`w-full px-4 py-3 bg-slate-800/50 border ${errors.discordUsername ? 'border-red-500' : 'border-purple-500/30'} rounded-lg focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 text-white placeholder-gray-500 transition-all`}
                        placeholder="YourDiscord#1234"
                      />
                      {errors.discordUsername && (
                        <p className="mt-1 text-sm text-red-400">{errors.discordUsername}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mystery Deck Section */}
                <div className="bg-slate-900/50 rounded-xl p-6 border border-purple-500/10">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    Mystery Deck?
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 bg-slate-800/50 border border-purple-500/20 rounded-lg cursor-pointer hover:border-purple-400 transition-all group">
                      <input
                        type="radio"
                        name="mysteryDeck"
                        value="yes"
                        checked={formData.mysteryDeck === 'yes'}
                        onChange={(e) => handleInputChange('mysteryDeck', e.target.value)}
                        className="w-5 h-5 text-purple-600 focus:ring-purple-500 mr-3"
                      />
                      <span className="text-gray-300 group-hover:text-white transition-colors">
                        Yes, just make something fun, I trust you! 🎲
                      </span>
                    </label>
                    <label className="flex items-center p-4 bg-slate-800/50 border border-purple-500/20 rounded-lg cursor-pointer hover:border-purple-400 transition-all group">
                      <input
                        type="radio"
                        name="mysteryDeck"
                        value="no"
                        checked={formData.mysteryDeck === 'no'}
                        onChange={(e) => handleInputChange('mysteryDeck', e.target.value)}
                        className="w-5 h-5 text-purple-600 focus:ring-purple-500 mr-3"
                      />
                      <span className="text-gray-300 group-hover:text-white transition-colors">
                        No, I have an idea I'm cool like that 😎
                      </span>
                    </label>
                  </div>
                  {errors.mysteryDeck && (
                    <p className="mt-2 text-sm text-red-400">{errors.mysteryDeck}</p>
                  )}
                </div>

                {/* Commander & Theme */}
                <div className="bg-slate-900/50 rounded-xl p-6 border border-purple-500/10">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Commander (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.commander}
                        onChange={(e) => handleInputChange('commander', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-lg focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 text-white placeholder-gray-500 transition-all"
                        placeholder="Commander name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Theme (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.theme}
                        onChange={(e) => handleInputChange('theme', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-lg focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 text-white placeholder-gray-500 transition-all"
                        placeholder="e.g., Tribal, Artifacts, Spellslinger"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Color Preference Section */}
                <div className="bg-slate-900/50 rounded-xl p-6 border border-purple-500/10">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-400" />
                    Color Preference
                  </h3>
                  <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {colorOptions.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => handleColorSelect(color.id)}
                        className={`p-3 rounded-lg text-white text-xs font-semibold transition-all transform hover:scale-105 hover:shadow-lg ${selectedColor === color.id
                          ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-900 scale-105'
                          : ''
                          } ${color.className}`}
                      >
                        {color.label}
                      </button>
                    ))}
                  </div>
                  {errors.colorPreference && (
                    <p className="mt-2 text-sm text-red-400">{errors.colorPreference}</p>
                  )}
                </div>

                {/* Bracket Selection */}
                <div className="bg-slate-900/50 rounded-xl p-6 border border-purple-500/10">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Bracket Selection <span className="text-red-400">*</span>
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {bracketOptions.map((bracket) => (
                      <button
                        key={bracket.value}
                        type="button"
                        onClick={() => handleBracketSelect(bracket.value)}
                        className={`w-full p-3 text-left rounded-lg border transition-all ${selectedBracket === bracket.value
                          ? 'bg-purple-600/20 border-purple-400 text-white'
                          : 'bg-slate-800/50 border-purple-500/20 text-gray-300 hover:border-purple-400 hover:text-white'
                          }`}
                      >
                        <div className="font-semibold">{bracket.label}</div>
                        <div className="text-xs opacity-75 mt-1">{bracket.description}</div>
                      </button>
                    ))}
                  </div>
                  {errors.bracket && (
                    <p className="mt-2 text-sm text-red-400">{errors.bracket}</p>
                  )}
                </div>

                {/* Budget & Fun Questions */}
                <div className="bg-slate-900/50 rounded-xl p-6 border border-purple-500/10">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-purple-400" />
                    Additional Info
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Budget <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.budget}
                        onChange={(e) => handleInputChange('budget', e.target.value)}
                        className={`w-full px-4 py-3 bg-slate-800/50 border ${errors.budget ? 'border-red-500' : 'border-purple-500/30'} rounded-lg focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 text-white placeholder-gray-500 transition-all`}
                        placeholder="e.g., $100, No budget, Under $500"
                      />
                      {errors.budget && (
                        <p className="mt-1 text-sm text-red-400">{errors.budget}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Coffee className="inline w-4 h-4 mr-1" />
                        Coffee Preference <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.coffee}
                        onChange={(e) => handleInputChange('coffee', e.target.value)}
                        className={`w-full px-4 py-3 bg-slate-800/50 border ${errors.coffee ? 'border-red-500' : 'border-purple-500/30'} rounded-lg focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 text-white placeholder-gray-500 transition-all`}
                        placeholder="e.g., Black coffee, French press"
                      />
                      {errors.coffee && (
                        <p className="mt-1 text-sm text-red-400">{errors.coffee}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Calendar className="inline w-4 h-4 mr-1" />
                        Ideal Date (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.idealDate}
                        onChange={(e) => handleInputChange('idealDate', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-lg focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 text-white placeholder-gray-500 transition-all"
                        placeholder="Your answer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-8 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Submit Deck Request
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={isLoading}
                className="px-8 py-4 bg-slate-700/50 text-gray-300 font-bold rounded-lg border border-purple-500/20 hover:bg-slate-700 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Form
              </button>
            </div>

            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-amber-300 text-sm text-center flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Never submit passwords through this form
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400">
          <p>This form was created for DefCat</p>
          <p className="text-sm mt-2 opacity-70">© 2024 Custom Commander Decks</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(100, 116, 139, 0.1);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.5);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.7);
        }
      `}</style>
    </div>
  );
}