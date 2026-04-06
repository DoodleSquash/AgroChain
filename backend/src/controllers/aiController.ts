import { Request, Response } from 'express';

export const getMarketPrices = async (req: Request, res: Response): Promise<void> => {
  try {
    const lang = (req.query.lang as string) || 'English';

    const insights = [
      {
        crop: 'Tomato',
        priceRange: '₹40 - ₹55',
        trend: 'UP',
        advice: lang === 'Hindi' ? 'बढ़ती मांग के कारण अगले 2 हफ्तों में दाम बढ़ सकते हैं।' : 'Prices expected to rise in next 2 weeks due to seasonal demand.'
      },
      {
        crop: 'Wheat',
        priceRange: '₹22 - ₹28',
        trend: 'STABLE',
        advice: lang === 'Hindi' ? 'बाजार स्थिर है। अपनी उपज को भंडारित करने पर विचार करें।' : 'Market is stable. Consider holding stock for peak season.'
      },
      {
        crop: 'Onion',
        priceRange: '₹15 - ₹20',
        trend: 'DOWN',
        advice: lang === 'Hindi' ? 'नई फसल आने से कीमतों में गिरावट देखी जा सकती है।' : 'Fresh harvests arriving; prices might dip slightly.'
      }
    ];

    res.json({ insights });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
};

export const evaluateBuyerRisk = async (req: Request, res: Response): Promise<void> => {
  try {
    const { buyerId } = req.body;
    // Mock risk assessment
    res.json({
      buyerId,
      riskLevel: 'LOW',
      score: 85,
      recommendation: 'Reliable buyer with 98% settlement rate.'
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
};
