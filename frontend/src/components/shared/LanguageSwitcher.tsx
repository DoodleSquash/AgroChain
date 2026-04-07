import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', native: 'मરાઠી' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

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
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-outline-variant/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-2 border-b border-outline-variant/10 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Select Language</span>
            </div>
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {languages.map((lang) => (
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
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
