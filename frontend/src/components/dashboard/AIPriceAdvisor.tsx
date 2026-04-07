import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { API } from '../../lib/api';

interface AIInsight {
  crop: string;
  priceRange: string;
  trend: 'UP' | 'DOWN' | 'STABLE';
  advice: string;
}

const AIPriceAdvisor = () => {
  const { t, i18n } = useTranslation();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAI = async () => {
      try {
        const languageMap: Record<string, string> = {
          en: 'English', hi: 'Hindi', mr: 'Marathi', bn: 'Bengali',
          te: 'Telugu', ta: 'Tamil', gu: 'Gujarati', kn: 'Kannada',
          ml: 'Malayalam', pa: 'Punjabi',
        };
        const currentLangName = languageMap[i18n.language] || 'English';
        
        const res = await fetch(`${API}/ai/market-prices?lang=${currentLangName}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || 'Failed to fetch AI insights');
        
        setInsights(data.insights || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAI();
  }, []);

  return (
    <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden group">
      {/* Decorative AI blobs */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-400 rounded-full mix-blend-screen filter blur-2xl opacity-40 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary rounded-full mix-blend-screen filter blur-2xl opacity-30 animate-pulse animation-delay-2000" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>tips_and_updates</span>
          </div>
          <div>
            <h3 className="font-extrabold font-headline text-lg leading-tight text-white drop-shadow-sm">{t('ai.advisor')}</h3>
            <p className="text-xs text-white/80 font-medium">{t('ai.insights')}</p>
          </div>
        </div>

        {loading && (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse flex gap-3 items-center">
                <div className="w-10 h-10 bg-white/10 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-white/10 rounded w-1/3" />
                  <div className="h-2 bg-white/10 rounded w-5/6" />
                </div>
              </div>
            ))}
            <p className="text-center text-xs text-white/50 mt-4 animate-pulse">Running neural market analysis...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-xs text-red-200">
            {error}
          </div>
        )}

        {!loading && !error && insights.length > 0 && (
          <div className="space-y-3">
            {insights.map((insight, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 hover:bg-white/20 transition-all shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-white drop-shadow-sm">{insight.crop}</h4>
                    {insight.trend === 'UP' && <span className="bg-emerald-500/30 text-emerald-100 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">trending_up</span>Surging</span>}
                    {insight.trend === 'DOWN' && <span className="bg-red-500/30 text-red-100 border border-red-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">trending_down</span>Dropping</span>}
                    {insight.trend === 'STABLE' && <span className="bg-blue-500/30 text-blue-100 border border-blue-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">trending_flat</span>Stable</span>}
                  </div>
                  <span className="font-extrabold text-sm text-white">{insight.priceRange}</span>
                </div>
                <p className="text-xs text-white/90 leading-relaxed border-l-2 border-primary-200/50 pl-2 ml-0.5">
                  {insight.advice}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPriceAdvisor;
