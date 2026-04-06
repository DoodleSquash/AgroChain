import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { API } from '../../lib/api';

interface RiskReport {
  riskScore: number;
  isVerified: boolean;
  flags: string[];
  analysis: string;
}

interface BuyerRiskModalProps {
  buyerId: string;
  buyerName: string;
  onClose: () => void;
}

const BuyerRiskModal: React.FC<BuyerRiskModalProps> = ({ buyerId, buyerName, onClose }) => {
  const { t, i18n } = useTranslation();
  const [report, setReport] = useState<RiskReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const evaluateRisk = async () => {
      try {
        const languageMap: Record<string, string> = {
          en: 'English', hi: 'Hindi', mr: 'Marathi', bn: 'Bengali',
          te: 'Telugu', ta: 'Tamil', gu: 'Gujarati', kn: 'Kannada',
          ml: 'Malayalam', pa: 'Punjabi',
        };
        const currentLangName = languageMap[i18n.language] || 'English';

        const res = await fetch(`${API}/ai/evaluate-buyer-risk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            buyer_id: buyerId,
            lang: currentLangName
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to analyze risk');
        setReport(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    evaluateRisk();
  }, [buyerId, i18n.language]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header Content */}
        <div className={`p-8 text-white relative overflow-hidden ${
          loading ? 'bg-primary-600' : (report?.isVerified ? 'bg-emerald-600' : 'bg-red-600')
        }`}>
          {/* Decorative Blobs */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[28px]">
                  {loading ? 'shield_moon' : (report?.isVerified ? 'verified_user' : 'report_problem')}
                </span>
              </div>
              <div>
                <h3 className="font-extrabold font-headline text-xl leading-tight">{t('ai.trust_shield')}</h3>
                <p className="text-sm text-white/80 font-medium">{t('ai.scanning')} {buyerName}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="space-y-6">
              <div className="flex items-center justify-center flex-col py-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary-600 animate-pulse">security</span>
                  </div>
                </div>
                <p className="mt-4 font-bold text-on-surface-variant animate-pulse">Running Neural History Scan...</p>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-surface-container-low rounded-full w-full" />
                <div className="h-4 bg-surface-container-low rounded-full w-5/6" />
                <div className="h-4 bg-surface-container-low rounded-full w-4/6" />
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <span className="material-symbols-outlined text-red-500 text-[48px] mb-2">error</span>
              <p className="text-red-600 font-bold">{error}</p>
              <button 
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-surface-container text-on-surface rounded-full font-bold hover:bg-surface-container-high transition-colors"
              >
                Close Modal
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Risk Score Meter */}
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-bold text-on-surface-variant">{t('ai.risk_level')}</span>
                    <span className={`text-sm font-black ${report?.riskScore && report.riskScore > 50 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {report?.riskScore}%
                    </span>
                  </div>
                  <div className="h-3 bg-surface-container rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${report?.isVerified ? 'bg-emerald-500' : 'bg-red-500'}`}
                      style={{ width: `${report?.riskScore}%` }}
                    />
                  </div>
                </div>
                <div className={`shrink-0 w-20 h-20 rounded-[1.5rem] flex flex-col items-center justify-center border-2 ${
                  report?.isVerified ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 'border-red-100 bg-red-50 text-red-600'
                }`}>
                  <span className="text-xs font-black uppercase tracking-tighter">{t('ai.status_label')}</span>
                  <span className="font-extrabold text-xs text-center leading-tight">
                    {report?.isVerified ? 'VERIFIED' : 'RISKY'}
                  </span>
                </div>
              </div>

              {/* Flags */}
              <div className="flex flex-wrap gap-2">
                {report?.flags.map((flag, i) => (
                  <div key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black border ${
                    report.isVerified ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
                  }`}>
                    <span className="material-symbols-outlined text-[14px]">
                      {report.isVerified ? 'check_circle' : 'warning_amber'}
                    </span>
                    {flag}
                  </div>
                ))}
              </div>

              {/* Analysis */}
              <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-[2rem] p-6">
                <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3 flex items-center gap-2">
                   <span className="material-symbols-outlined text-[16px]">psychology</span>
                   {t('ai.ai_verdict')}
                </h4>
                <p className="text-sm text-on-surface font-medium leading-relaxed italic">
                  "{report?.analysis}"
                </p>
              </div>

              <button 
                onClick={onClose}
                className={`w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-[0.98] ${
                  report?.isVerified ? 'bg-emerald-600 shadow-emerald-500/20 hover:bg-emerald-700' : 'bg-red-600 shadow-red-500/20 hover:bg-red-700'
                }`}
              >
                {t('ai.understood')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyerRiskModal;
