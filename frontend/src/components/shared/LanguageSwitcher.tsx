import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
  { code: 'mai', name: 'Maithili', native: 'मैथिली' },
  { code: 'sat', name: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ' },
  { code: 'ks', name: 'Kashmiri', native: 'कॉशुर / كأشُر' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली' },
  { code: 'kok', name: 'Konkani', native: 'कोंकणी' },
  { code: 'sd', name: 'Sindhi', native: 'सिन्धी / سنڌي' },
  { code: 'doi', name: 'Dogri', native: 'डोगरी' },
  { code: 'mni', name: 'Manipuri', native: 'ꯃꯤꯇꯩꯂꯣꯟ' },
  { code: 'brx', name: 'Bodo', native: 'बर’' },
  { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    
    // Set Google Translate cookies
    document.cookie = `googtrans=/en/${code}; path=/; domain=${window.location.hostname}`;
    document.cookie = `googtrans=/en/${code}; path=/`;

    // Try to magically update Google Translate dropdown without reload
    const teCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (teCombo) {
      teCombo.value = code;
      teCombo.dispatchEvent(new Event('change'));
    } else {
       // If widget isn't loaded yet, it will read the cookie on next load
       setTimeout(() => window.location.reload(), 100);
    }

    setIsOpen(false);
    setSearchTerm('');
  };

  const filteredLanguages = languages.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.native.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-low border border-outline-variant/20 hover:border-primary-300 hover:bg-primary-50 transition-all text-sm font-bold text-on-surface"
      >
        <span className="material-symbols-outlined text-[18px] text-primary-600">translate</span>
        <span className="hidden sm:inline">{currentLang.native}</span>
        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
          {isOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
        </span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => { setIsOpen(false); setSearchTerm(''); }}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-outline-variant/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden flex flex-col">
            <div className="px-4 py-2 border-b border-outline-variant/10 flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Select Language</span>
              <div className="relative">
                 <input 
                   type="text" 
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                   placeholder="Search languages..."
                   className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                   autoFocus
                 />
                 <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-gray-400">search</span>
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {filteredLanguages.length === 0 ? (
                <div className="px-4 py-4 text-center text-sm text-gray-500">No languages found</div>
              ) : (
                filteredLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-bold transition-colors ${
                      i18n.language === lang.code 
                        ? 'bg-primary-50 text-primary-800' 
                        : 'text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex flex-col items-start leading-none">
                      <span>{lang.native}</span>
                      <span className="text-[10px] opacity-50 font-medium mt-1">{lang.name}</span>
                    </div>
                    {i18n.language === lang.code && (
                      <span className="material-symbols-outlined text-[18px] text-primary-600">check_circle</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
