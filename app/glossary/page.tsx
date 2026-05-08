'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

interface Term {
  term: string
  definition: string
  category: 'basics' | 'market' | 'trading' | 'analysis' | 'risk' | 'advanced'
}

const TERMS: Term[] = [
  // ── Basics ──
  { term: 'Stock', category: 'basics', definition: 'A share of ownership in a company. When you buy stock, you become a part-owner of that business and can benefit when it grows.' },
  { term: 'Share', category: 'basics', definition: 'One unit of stock. If a company has 1,000 shares and you own 100, you own 10% of the company.' },
  { term: 'Equity', category: 'basics', definition: 'Ownership value. When you own stock, you hold equity in the company — a real claim on its assets and profits.' },
  { term: 'Dividend', category: 'basics', definition: 'A portion of company profits paid directly to shareholders, usually quarterly. Not all companies pay dividends — growth companies often reinvest profits instead.' },
  { term: 'IPO', category: 'basics', definition: 'Initial Public Offering. The first time a company sells its shares to the public on a stock exchange. How companies raise capital from everyday investors.' },
  { term: 'Ticker Symbol', category: 'basics', definition: 'A short code that identifies a publicly traded company. Apple = AAPL, Nike = NKE, Tesla = TSLA. Used to search and trade stocks.' },
  { term: 'Market Cap', category: 'basics', definition: 'Market Capitalization — the total value of a company as the market sees it. Calculated as share price × total shares outstanding.' },
  { term: 'Portfolio', category: 'basics', definition: 'Your complete collection of investments — all the stocks, ETFs, and other assets you own across all accounts.' },
  { term: 'Broker', category: 'basics', definition: 'A platform or company that executes your buy and sell orders on the stock market. Examples: Fidelity, Robinhood, Charles Schwab.' },
  { term: 'SIPC', category: 'basics', definition: 'Securities Investor Protection Corporation. Insures your brokerage account up to $500,000 if the broker goes bankrupt. Does not protect against investment losses.' },

  // ── Market ──
  { term: 'NYSE', category: 'market', definition: 'New York Stock Exchange — the world\'s largest stock exchange by market cap. Home to established companies like Coca-Cola and Johnson & Johnson.' },
  { term: 'Nasdaq', category: 'market', definition: 'A major US stock exchange known for listing technology companies. Home to Apple, Google, Amazon, and Microsoft.' },
  { term: 'S&P 500', category: 'market', definition: 'An index tracking the 500 largest publicly traded US companies. The most widely used benchmark for overall US market performance.' },
  { term: 'Bull Market', category: 'market', definition: 'A period when stock prices are rising — officially defined as a 20%+ gain from a recent low. Typically accompanied by strong economic growth and high investor confidence.' },
  { term: 'Bear Market', category: 'market', definition: 'A period when stock prices are falling — officially defined as a 20%+ drop from a recent high. Average bear markets last about 9-10 months.' },
  { term: 'Correction', category: 'market', definition: 'A market decline of 10–20% from a recent high. More common than bear markets and often short-lived. A normal, healthy part of market cycles.' },
  { term: 'Market Hours', category: 'market', definition: 'The US stock market is open Monday–Friday, 9:30am–4:00pm Eastern Time. Pre-market (4am–9:30am) and after-hours (4pm–8pm) trading also exist but with less volume.' },
  { term: 'Index', category: 'market', definition: 'A group of stocks used to represent a segment of the market. The S&P 500, Dow Jones, and Nasdaq Composite are the three most watched US indexes.' },
  { term: 'Dow Jones', category: 'market', definition: 'The Dow Jones Industrial Average — an index of 30 large, well-established US companies. One of the oldest and most quoted market indicators.' },
  { term: 'Earnings Season', category: 'market', definition: 'Four times per year, publicly traded companies report their financial results. These reports can cause significant stock price moves depending on whether results beat or miss expectations.' },

  // ── Trading ──
  { term: 'Market Order', category: 'trading', definition: 'An order to buy or sell a stock immediately at the current market price. Guarantees execution but not the exact price — useful when speed matters more than precision.' },
  { term: 'Limit Order', category: 'trading', definition: 'An order to buy or sell only at a specific price you set. The order waits until the stock hits your price — or it expires unfilled.' },
  { term: 'Stop-Loss Order', category: 'trading', definition: 'An order that automatically sells your stock if it drops to a specified price. Caps your downside and removes emotion from the decision to sell.' },
  { term: 'Stop-Limit Order', category: 'trading', definition: 'A stop-loss with a floor. When the trigger price is hit, a limit order activates instead of a market order. Gives more control but risks not filling if the price gaps down.' },
  { term: 'Bid Price', category: 'trading', definition: 'The highest price a buyer is currently willing to pay for a stock.' },
  { term: 'Ask Price', category: 'trading', definition: 'The lowest price a seller is currently willing to accept. You buy at the ask price and sell at the bid price.' },
  { term: 'Spread', category: 'trading', definition: 'The difference between the bid and ask price. Wider spreads mean higher transaction costs. Very liquid stocks (Apple, Tesla) have very tight spreads.' },
  { term: 'Volume', category: 'trading', definition: 'The number of shares traded in a given period. High volume confirms price moves — a big price change on high volume is a stronger signal than the same move on low volume.' },
  { term: 'Liquidity', category: 'trading', definition: 'How easily a stock can be bought or sold without significantly affecting its price. Large-cap stocks with high volume are highly liquid. Thinly traded stocks can be hard to exit.' },
  { term: 'Short Selling', category: 'trading', definition: 'Borrowing shares and selling them, hoping to buy them back cheaper later and return them for a profit. High risk — losses are theoretically unlimited if the stock rises.' },
  { term: 'Fractional Shares', category: 'trading', definition: 'The ability to buy a portion of one share. Lets you invest in expensive stocks like Amazon or Berkshire Hathaway with small amounts of money.' },
  { term: 'Dollar-Cost Averaging', category: 'trading', definition: 'Investing a fixed amount on a regular schedule (e.g., $50 every week) regardless of price. Removes the pressure of timing the market and averages out your cost over time.' },

  // ── Analysis ──
  { term: 'P/E Ratio', category: 'analysis', definition: 'Price-to-Earnings ratio. How much investors pay for each $1 of company profit. A P/E of 25 means investors pay $25 per $1 of earnings. High P/E = high growth expectations.' },
  { term: 'EPS', category: 'analysis', definition: 'Earnings Per Share — a company\'s profit divided by its total shares outstanding. A key measure of profitability. Rising EPS over time is a positive signal.' },
  { term: 'Revenue', category: 'analysis', definition: 'The total money a company brings in from its business. Revenue growth shows the business is expanding. Always compare against expenses to understand true profitability.' },
  { term: 'Profit Margin', category: 'analysis', definition: 'The percentage of revenue that becomes profit after expenses. A 20% profit margin means the company keeps $0.20 for every $1 of sales. Higher margins = more efficient business.' },
  { term: 'Earnings Report', category: 'analysis', definition: 'A quarterly disclosure of a company\'s financial performance — revenue, profit, growth, and guidance. One of the most important events for a stock\'s price movement.' },
  { term: '52-Week High/Low', category: 'analysis', definition: 'The highest and lowest price a stock has traded at over the past year. Useful for context — buying near a 52-week low may be a discount, while buying at a high requires more confidence.' },
  { term: 'Moat', category: 'analysis', definition: 'A durable competitive advantage that protects a company from competition. Apple\'s ecosystem, Google\'s search dominance, and Amazon\'s logistics are moats. Wider moat = safer long-term investment.' },
  { term: 'Beta', category: 'analysis', definition: 'A measure of a stock\'s volatility relative to the overall market. Beta of 1 = moves with the market. Beta of 2 = twice as volatile. Beta of 0.5 = half as volatile.' },
  { term: 'Support Level', category: 'analysis', definition: 'A price where a stock has historically stopped falling and bounced back up. Represents a zone of buying interest. Commonly used in technical analysis.' },
  { term: 'Resistance Level', category: 'analysis', definition: 'A price where a stock has historically struggled to break through and often reversed downward. Represents a zone of selling pressure.' },
  { term: 'Moving Average', category: 'analysis', definition: 'The average price of a stock over a specified period (e.g., 50-day or 200-day). Smooths out daily price swings to reveal the underlying trend.' },

  // ── Risk ──
  { term: 'Diversification', category: 'risk', definition: 'Spreading investments across different stocks, sectors, and asset classes so one bad investment doesn\'t significantly damage your overall portfolio.' },
  { term: 'Risk/Reward Ratio', category: 'risk', definition: 'A comparison of potential loss to potential gain on a trade. A 1:3 ratio means risking $1 to potentially make $3. Most traders aim for at least 1:2.' },
  { term: 'Position Sizing', category: 'risk', definition: 'How much of your portfolio you allocate to a single trade. Professional traders often risk no more than 1-2% of their total capital on any one position.' },
  { term: 'Volatility', category: 'risk', definition: 'How much a stock\'s price swings up and down. High volatility = larger price swings, higher risk and higher potential reward. Low volatility = steadier, more predictable movement.' },
  { term: 'Inflation', category: 'risk', definition: 'The gradual increase in prices over time, typically around 3% per year. Money sitting in low-interest savings accounts loses purchasing power when inflation outpaces the return.' },
  { term: 'Correlation', category: 'risk', definition: 'How two investments move in relation to each other. Stocks that move together don\'t truly diversify your risk. True diversification means owning assets with low correlation to each other.' },
  { term: 'Drawdown', category: 'risk', definition: 'The peak-to-trough decline in portfolio value. A 30% drawdown means your portfolio fell 30% from its highest point. Understanding your maximum acceptable drawdown helps define your risk tolerance.' },

  // ── Advanced ──
  { term: 'ETF', category: 'advanced', definition: 'Exchange-Traded Fund — a basket of securities that trades on an exchange like a regular stock. Provides instant diversification. A S&P 500 ETF like VOO gives you exposure to 500 companies in one purchase.' },
  { term: 'Index Fund', category: 'advanced', definition: 'A fund designed to track the performance of a market index like the S&P 500. Usually lower fees than actively managed funds, and most outperform active managers over 10+ years.' },
  { term: 'Rebalancing', category: 'advanced', definition: 'Periodically adjusting your portfolio back to your target allocation. If stocks grow and become 80% of your portfolio when you wanted 70%, you sell some stocks and buy other assets to rebalance.' },
  { term: 'Compound Interest', category: 'advanced', definition: 'Earning returns on your returns. $1,000 growing at 10% becomes $1,100 after year one. In year two, you earn 10% on $1,100 — not just the original $1,000. Over decades this creates enormous wealth.' },
  { term: 'Capital Gains', category: 'advanced', definition: 'Profit made from selling an investment for more than you paid. Short-term gains (held less than 1 year) are taxed as ordinary income. Long-term gains (held 1+ year) receive lower tax rates.' },
  { term: 'Options', category: 'advanced', definition: 'Contracts giving the right — but not obligation — to buy or sell a stock at a set price before a set date. Powerful but complex. Covered in the Leveler track.' },
  { term: 'Futures', category: 'advanced', definition: 'Contracts to buy or sell an asset at a predetermined price on a future date. Used by professionals to hedge risk or speculate on price moves.' },
  { term: 'Hedge', category: 'advanced', definition: 'An investment made to reduce the risk of another position. Like insurance — it costs money but protects against large losses. Common strategies use options or inverse ETFs.' },
  { term: 'Bull Trap', category: 'advanced', definition: 'A false signal where a stock appears to break upward, drawing in buyers, then reverses sharply downward. A trap for investors who react too quickly to a breakout.' },
  { term: 'Bear Trap', category: 'advanced', definition: 'The opposite of a bull trap — a stock appears to break down, causing panic selling, then reverses sharply upward. Shorts get "trapped" when the price recovers.' },
]

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'basics', label: 'Basics' },
  { id: 'market', label: 'Market' },
  { id: 'trading', label: 'Trading' },
  { id: 'analysis', label: 'Analysis' },
  { id: 'risk', label: 'Risk' },
  { id: 'advanced', label: 'Advanced' },
]

const CATEGORY_COLORS: Record<string, string> = {
  basics: 'bg-brand-purple/20 text-brand-purple border-brand-purple/40',
  market: 'bg-brand-green/20 text-brand-green border-brand-green/40',
  trading: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  analysis: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  risk: 'bg-red-500/20 text-red-400 border-red-500/40',
  advanced: 'bg-white/10 text-brand-muted border-white/20',
}

export default function GlossaryPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return TERMS.filter((t) => {
      const matchesCategory = activeCategory === 'all' || t.category === activeCategory
      const matchesSearch = t.term.toLowerCase().includes(search.toLowerCase()) ||
        t.definition.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    }).sort((a, b) => a.term.localeCompare(b.term))
  }, [search, activeCategory])

  return (
    <div className="max-w-sm mx-auto px-6 py-6 min-h-screen pb-20">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-brand-muted text-sm active:scale-95">← Back</button>
        <div className="flex-1 text-center">
          <h1 className="text-xl font-black text-brand-white">Glossary</h1>
        </div>
        <div className="w-12" />
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted text-sm">🔍</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search terms..."
          className="w-full bg-brand-surface border-2 border-white/10 rounded-2xl pl-10 pr-5 py-3 text-brand-white text-sm font-medium placeholder:text-brand-muted focus:outline-none focus:border-brand-purple transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
              activeCategory === cat.id
                ? 'bg-brand-purple text-brand-white border-brand-purple'
                : 'bg-brand-surface text-brand-muted border-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-brand-muted text-xs mb-4 pl-1">{filtered.length} term{filtered.length !== 1 ? 's' : ''}</p>

      {/* Terms list */}
      <div className="flex flex-col gap-2">
        {filtered.map((term) => (
          <button
            key={term.term}
            onClick={() => setExpanded(expanded === term.term ? null : term.term)}
            className={`w-full text-left rounded-2xl border transition-all ${
              expanded === term.term
                ? 'bg-brand-surface border-brand-purple'
                : 'bg-brand-surface border-white/10'
            }`}
          >
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <p className="text-brand-white font-bold text-sm">{term.term}</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[term.category]}`}>
                  {term.category}
                </span>
              </div>
              <span className={`text-brand-muted text-xs transition-transform ${expanded === term.term ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </div>

            {expanded === term.term && (
              <div className="px-5 pb-4">
                <div className="h-px bg-white/10 mb-3" />
                <p className="text-brand-muted text-sm leading-relaxed">{term.definition}</p>
              </div>
            )}
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🤷</div>
            <p className="text-brand-muted text-sm">No terms match your search.</p>
          </div>
        )}
      </div>

    </div>
  )
}
