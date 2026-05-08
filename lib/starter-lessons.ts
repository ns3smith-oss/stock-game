export type SlideType = 'intro' | 'text' | 'fact' | 'tap-reveal' | 'quiz' | 'complete' | 'chart-demo'

export interface QuizSlide {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface Slide {
  type: SlideType
  emoji?: string
  heading: string
  body?: string
  tapReveal?: string
  quiz?: QuizSlide
  xpReward?: number
  demoType?: string
}

export interface Lesson {
  id: string
  title: string
  emoji: string
  xpReward: number
  slides: Slide[]
}

export interface Unit {
  id: string
  title: string
  subtitle: string
  color: string
  borderColor: string
  lessons: Lesson[]
}

export const STARTER_UNITS: Unit[] = [
  // ─────────────────────────────────────────────
  // UNIT 1 — What is a Stock?
  // ─────────────────────────────────────────────
  {
    id: 'unit-1',
    title: 'What is a Stock?',
    subtitle: 'Start from zero. No experience needed.',
    color: 'bg-brand-purple/20',
    borderColor: 'border-brand-purple',
    lessons: [
      {
        id: 'u1-l1',
        title: 'The Pizza Shop',
        emoji: '🍕',
        xpReward: 10,
        slides: [
          {
            type: 'intro',
            emoji: '🍕',
            heading: 'The Pizza Shop',
            body: "We're going to explain stocks using something everyone understands.",
          },
          {
            type: 'text',
            emoji: '👩‍🍳',
            heading: 'Your friend needs money',
            body: "Imagine your friend wants to open a pizza shop. She needs $10,000 for ovens, ingredients, and rent. But she only has $5,000. What does she do?",
          },
          {
            type: 'text',
            emoji: '✂️',
            heading: 'She splits the shop into pieces',
            body: "She divides her pizza shop into 100 equal pieces and sells each piece for $100. That way she raises the $10,000 she needs. Each piece she sells is called a share of stock.",
          },
          {
            type: 'text',
            emoji: '🤝',
            heading: 'You buy a piece',
            body: "You buy 1 piece for $100. Now you own 1% of her pizza shop. If the shop takes off and becomes worth $20,000 next year — your piece is now worth $200. You just doubled your money.",
          },
          {
            type: 'chart-demo',
            heading: 'The shop has 100 shares — buy 5',
            demoType: 'company-split',
          },
          {
            type: 'quiz',
            emoji: '🧠',
            heading: 'Now you try it',
            quiz: {
              question: "Your friend's pizza shop has 100 shares. You buy 5 shares. What percentage of the shop do you own?",
              options: ['1%', '5%', '10%', '50%'],
              correctIndex: 1,
              explanation: "5 shares out of 100 total = 5%. Just like the order you just placed — the more shares you own, the bigger your piece of the company.",
            },
          },
          {
            type: 'tap-reveal',
            emoji: '💡',
            heading: 'So what IS a stock?',
            body: 'Tap to reveal the answer.',
            tapReveal: "A stock is a small piece of ownership in a real company. When you buy stock, you're not gambling on a number — you're becoming a part-owner of that business.",
          },
          {
            type: 'complete',
            emoji: '🎉',
            heading: "You got it!",
            body: 'You just learned what a stock is. That puts you ahead of most people already.',
            xpReward: 10,
          },
        ],
      },
      {
        id: 'u1-l2',
        title: 'Real Ownership',
        emoji: '🏢',
        xpReward: 10,
        slides: [
          {
            type: 'intro',
            emoji: '🏢',
            heading: 'Real Ownership',
            body: "Owning stock isn't just a number on a screen. It's actually real.",
          },
          {
            type: 'text',
            emoji: '📱',
            heading: 'You can own Apple',
            body: "When you buy Apple stock, you literally own a tiny piece of Apple Inc. Every iPhone sold, every app downloaded — you have a real claim on a fraction of all of it.",
          },
          {
            type: 'fact',
            emoji: '📊',
            heading: 'Did you know?',
            body: "Apple has about 15 billion shares of stock. If you owned 100 shares, you'd own 0.000001% of Apple. Tiny — but real, legal ownership.",
          },
          {
            type: 'text',
            emoji: '📈',
            heading: 'Your goal as an investor',
            body: "When companies grow, their stock goes up. When they struggle, it goes down. Your goal is simple: find companies that will grow before everyone else figures it out.",
          },
          {
            type: 'quiz',
            emoji: '🧠',
            heading: 'Quick check!',
            quiz: {
              question: "Apple has a record-breaking year and makes more profit than ever. What most likely happens to Apple stock?",
              options: [
                'It disappears',
                'It goes down',
                'It stays exactly the same',
                'It goes up',
              ],
              correctIndex: 3,
              explanation: "When a company makes more money, investors want a piece of that success. More demand for the stock pushes the price up.",
            },
          },
          {
            type: 'complete',
            emoji: '💪',
            heading: 'Ownership makes sense now.',
            body: "You understand something most people never stop to think about.",
            xpReward: 10,
          },
        ],
      },
      {
        id: 'u1-l3',
        title: 'Why Companies Go Public',
        emoji: '🚀',
        xpReward: 10,
        slides: [
          {
            type: 'intro',
            emoji: '🚀',
            heading: 'Why Companies Go Public',
            body: "Why would a company let strangers own pieces of it? There's a very good reason.",
          },
          {
            type: 'text',
            emoji: '💰',
            heading: 'Growth costs money',
            body: "Amazon started as a bookstore. To become the everything-store it is today, it needed billions of dollars. Where does that money come from? You — the investor.",
          },
          {
            type: 'text',
            emoji: '🏛️',
            heading: 'Going public — the IPO',
            body: "When a company decides to sell shares to the public for the first time, it's called an IPO — Initial Public Offering. The company lists on a stock exchange like the NYSE or Nasdaq, and anyone can buy shares.",
          },
          {
            type: 'tap-reveal',
            emoji: '🤔',
            heading: "What's the NYSE?",
            body: 'Tap to find out.',
            tapReveal: "The NYSE (New York Stock Exchange) is the world's largest stock exchange. It's where buyers and sellers meet to trade shares of thousands of companies. Think of it as a marketplace — but for pieces of businesses.",
          },
          {
            type: 'text',
            emoji: '🤝',
            heading: 'The deal both sides make',
            body: "The company gets the money it needs to grow. You get ownership in the company. If the company grows, your investment grows. That's the deal — and it's been building wealth for everyday people for decades.",
          },
          {
            type: 'quiz',
            emoji: '🧠',
            heading: 'Quick check!',
            quiz: {
              question: "What is an IPO?",
              options: [
                'A type of savings account',
                'When a company first sells its stock to the public',
                'A government bond',
                'A stock that only rich people can buy',
              ],
              correctIndex: 1,
              explanation: "IPO stands for Initial Public Offering. It's the first time a company's stock is available for anyone to buy. After that, the stock trades freely on an exchange.",
            },
          },
          {
            type: 'complete',
            emoji: '🌟',
            heading: "Now you know why it exists.",
            body: "Stocks exist because companies need money to grow — and they're willing to share the upside with you.",
            xpReward: 10,
          },
        ],
      },
      {
        id: 'u1-l4',
        title: 'Unit 1 Quiz',
        emoji: '🏆',
        xpReward: 30,
        slides: [
          {
            type: 'intro',
            emoji: '🏆',
            heading: 'Unit 1 Quiz',
            body: "Let's see what stuck. No pressure — this is just for you.",
          },
          {
            type: 'quiz',
            emoji: '❓',
            heading: "Question 1 of 4",
            quiz: {
              question: "A stock is best described as:",
              options: [
                'A loan you give to a company',
                'A small piece of ownership in a company',
                'A savings account with interest',
                'A government-issued certificate',
              ],
              correctIndex: 1,
              explanation: "A stock = ownership. When you buy stock, you become a part-owner of that company.",
            },
          },
          {
            type: 'quiz',
            emoji: '❓',
            heading: "Question 2 of 4",
            quiz: {
              question: "A company has 1,000 shares of stock. You buy 100. How much of the company do you own?",
              options: ['1%', '100%', '10%', '0.1%'],
              correctIndex: 2,
              explanation: "100 ÷ 1,000 = 10%. Always divide your shares by the total shares outstanding.",
            },
          },
          {
            type: 'quiz',
            emoji: '❓',
            heading: "Question 3 of 4",
            quiz: {
              question: "A company's stock goes up. What most likely caused this?",
              options: [
                'The company is struggling',
                'Nobody wants to buy the stock',
                'The company is doing well and more people want to own it',
                'The government raised the price',
              ],
              correctIndex: 2,
              explanation: "Stock prices go up when more people want to buy than sell. That happens when a company is performing well.",
            },
          },
          {
            type: 'quiz',
            emoji: '❓',
            heading: "Question 4 of 4",
            quiz: {
              question: "What is an IPO?",
              options: [
                "When a company's stock price hits an all-time high",
                "When a company first sells its stock to the public",
                "A special type of bond",
                "When a company buys back its own stock",
              ],
              correctIndex: 1,
              explanation: "IPO = Initial Public Offering. The first time a company lets the public buy its stock.",
            },
          },
          {
            type: 'complete',
            emoji: '🎓',
            heading: 'Unit 1 Complete!',
            body: "You understand what stocks are, why they exist, and how ownership works. That's the foundation everything else is built on.",
            xpReward: 30,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // UNIT 2 — How the Market Works
  // ─────────────────────────────────────────────
  {
    id: 'unit-2',
    title: 'How the Market Works',
    subtitle: 'Who buys, who sells, and why prices move.',
    color: 'bg-brand-green/10',
    borderColor: 'border-brand-green',
    lessons: [
      {
        id: 'u2-l1',
        title: 'What is the Stock Market?',
        emoji: '🏛️',
        xpReward: 10,
        slides: [
          {
            type: 'intro',
            emoji: '🏛️',
            heading: 'What is the Stock Market?',
            body: "It's not as complicated as it sounds. Let's break it down.",
          },
          {
            type: 'text',
            emoji: '🛒',
            heading: 'Think of it like a marketplace',
            body: "A farmers market has vendors selling produce and buyers buying it. The stock market is the same idea — except instead of tomatoes, people are buying and selling pieces of companies.",
          },
          {
            type: 'text',
            emoji: '💻',
            heading: "It's mostly digital now",
            body: "The old image of people screaming on a trading floor still exists, but today 99% of trades happen online in milliseconds. You can buy a piece of Nike from your phone in seconds.",
          },
          {
            type: 'fact',
            emoji: '📊',
            heading: 'Did you know?',
            body: "Over $400 billion worth of stocks are traded every single day in the US alone. The market is open Monday–Friday, 9:30am–4pm Eastern time.",
          },
          {
            type: 'tap-reveal',
            emoji: '🤔',
            heading: "What are the main US stock exchanges?",
            body: 'Tap to find out.',
            tapReveal: "The two biggest are the NYSE (New York Stock Exchange) and Nasdaq. NYSE is where older, established companies like Coca-Cola trade. Nasdaq is where tech companies like Apple, Google, and Tesla trade.",
          },
          {
            type: 'quiz',
            emoji: '🧠',
            heading: 'Quick check!',
            quiz: {
              question: "When is the US stock market open?",
              options: [
                '24 hours a day, 7 days a week',
                'Monday–Friday, 9:30am–4pm Eastern',
                'Only on weekdays after 5pm',
                'Saturday and Sunday only',
              ],
              correctIndex: 1,
              explanation: "The market has set hours. Outside of those hours, you can still place orders — they just execute when the market opens.",
            },
          },
          {
            type: 'complete',
            emoji: '✅',
            heading: 'The market makes sense.',
            body: "It's just a marketplace for buying and selling pieces of companies.",
            xpReward: 10,
          },
        ],
      },
      {
        id: 'u2-l2',
        title: "Who's Buying and Selling?",
        emoji: '👥',
        xpReward: 10,
        slides: [
          {
            type: 'intro',
            emoji: '👥',
            heading: "Who's Buying and Selling?",
            body: "You might think it's just Wall Street suits. It's not.",
          },
          {
            type: 'text',
            emoji: '👩‍💼',
            heading: 'Retail investors — that\'s you',
            body: "Regular people like you who buy and sell stocks through apps like Robinhood, Fidelity, or Webull. Retail investors make up a huge portion of daily trading.",
          },
          {
            type: 'text',
            emoji: '🏦',
            heading: 'Institutional investors',
            body: "Big organizations like banks, pension funds, and hedge funds that trade billions of dollars. They move markets. When they buy a stock heavily, the price usually goes up. When they sell, it can drop fast.",
          },
          {
            type: 'fact',
            emoji: '🐳',
            heading: 'What is a "whale"?',
            body: "A whale is an investor with so much money that their trades alone can move a stock's price. Knowing when whales are buying or selling is a skill advanced traders develop.",
          },
          {
            type: 'text',
            emoji: '⚖️',
            heading: 'Supply and demand drives everything',
            body: "Every trade has a buyer and a seller. When more people want to buy a stock than sell it, the price goes up. When more people want to sell than buy, the price goes down. That's it.",
          },
          {
            type: 'chart-demo',
            heading: 'See it in action',
            demoType: 'supply-demand',
          },
          {
            type: 'quiz',
            emoji: '🧠',
            heading: 'Quick check!',
            quiz: {
              question: "More people want to sell a stock than buy it. What happens to the price?",
              options: ['It goes up', 'It stays the same', 'It goes down', 'It gets removed from the market'],
              correctIndex: 2,
              explanation: "More sellers than buyers = price drops. Supply and demand is the engine of the entire stock market.",
            },
          },
          {
            type: 'complete',
            emoji: '💡',
            heading: 'Supply and demand.',
            body: "That's the whole engine. More buyers = price up. More sellers = price down.",
            xpReward: 10,
          },
        ],
      },
      {
        id: 'u2-l3',
        title: 'Why Prices Move',
        emoji: '📉📈',
        xpReward: 10,
        slides: [
          {
            type: 'intro',
            emoji: '📈',
            heading: 'Why Prices Move',
            body: "Prices don't move randomly. There are real reasons — and learning them is your edge.",
          },
          {
            type: 'text',
            emoji: '📰',
            heading: 'News moves stocks fast',
            body: "A company announces record profits → stock jumps. A product gets recalled → stock drops. A CEO resigns → stock drops. The market reacts to information in real time, sometimes in seconds.",
          },
          {
            type: 'text',
            emoji: '😨',
            heading: 'Fear and greed are real forces',
            body: "When the economy looks bad, people panic-sell their stocks — even good ones. When everything looks great, people rush to buy — sometimes overpaying. Understanding crowd psychology is one of the biggest edges you can have.",
          },
          {
            type: 'fact',
            emoji: '📅',
            heading: 'Earnings season',
            body: "Four times a year, companies report how much money they made. These 'earnings reports' can send a stock up or down 10-20% in a single day. Knowing when earnings are coming is essential.",
          },
          {
            type: 'tap-reveal',
            emoji: '🤔',
            heading: 'What does "the market is up" mean?',
            body: 'Tap to find out.',
            tapReveal: "When people say 'the market is up,' they usually mean the S&P 500 index went up. The S&P 500 tracks 500 of the biggest US companies and is used as a snapshot of how the overall market is doing.",
          },
          {
            type: 'quiz',
            emoji: '🧠',
            heading: 'Quick check!',
            quiz: {
              question: "A company reports it made way more money than expected this quarter. What most likely happens?",
              options: [
                'The stock drops because profits are suspicious',
                'Nothing happens — earnings don\'t affect price',
                'The stock goes up because investors are excited',
                'The company shuts down',
              ],
              correctIndex: 2,
              explanation: "Beating earnings expectations is one of the strongest short-term signals for a stock price increase. Investors reward companies that outperform.",
            },
          },
          {
            type: 'complete',
            emoji: '🔍',
            heading: 'Prices move for reasons.',
            body: "News, earnings, fear, greed — these are the forces. Now you know what to watch.",
            xpReward: 10,
          },
        ],
      },
      {
        id: 'u2-l4',
        title: 'Unit 2 Quiz',
        emoji: '🏆',
        xpReward: 30,
        slides: [
          {
            type: 'intro',
            emoji: '🏆',
            heading: 'Unit 2 Quiz',
            body: "Let's lock in what you've learned about how the market works.",
          },
          {
            type: 'quiz',
            emoji: '❓',
            heading: 'Question 1 of 4',
            quiz: {
              question: "The US stock market is open:",
              options: [
                '24 hours a day',
                'Monday–Friday, 9:30am–4pm Eastern',
                'Weekends only',
                'Only when the economy is good',
              ],
              correctIndex: 1,
              explanation: "Market hours are set. Pre-market and after-hours trading exist but with less activity and wider spreads.",
            },
          },
          {
            type: 'quiz',
            emoji: '❓',
            heading: 'Question 2 of 4',
            quiz: {
              question: "What drives a stock's price up or down?",
              options: [
                'The government sets all stock prices',
                'Supply and demand — more buyers = up, more sellers = down',
                'Stock prices are random',
                'Only large banks control prices',
              ],
              correctIndex: 1,
              explanation: "Supply and demand is the core engine of price movement. Everything else — news, earnings, fear — works through this mechanism.",
            },
          },
          {
            type: 'quiz',
            emoji: '❓',
            heading: 'Question 3 of 4',
            quiz: {
              question: "What is the S&P 500?",
              options: [
                'A type of savings account',
                'A single very expensive stock',
                'An index that tracks 500 of the largest US companies',
                'A government bond',
              ],
              correctIndex: 2,
              explanation: "The S&P 500 is the most widely watched indicator of the US market's health. When people say 'the market is up,' they usually mean the S&P 500 is up.",
            },
          },
          {
            type: 'quiz',
            emoji: '❓',
            heading: 'Question 4 of 4',
            quiz: {
              question: "A company's CEO suddenly resigns with no explanation. What would you expect?",
              options: [
                'The stock price goes up — new leadership is exciting',
                'Nothing — CEO changes never affect stock price',
                'The stock price likely drops — uncertainty makes investors nervous',
                'The company immediately shuts down',
              ],
              correctIndex: 2,
              explanation: "Uncertainty scares investors. An unexpected CEO exit raises questions about the company's direction, causing many to sell.",
            },
          },
          {
            type: 'complete',
            emoji: '🎓',
            heading: 'Unit 2 Complete!',
            body: "You understand how the market works, who's in it, and why prices move. This is the foundation of reading the market.",
            xpReward: 30,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // UNIT 3 — Getting Started
  // ─────────────────────────────────────────────
  {
    id: 'unit-3',
    title: 'Getting Started',
    subtitle: 'Brokers, portfolios, and your first move.',
    color: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500',
    lessons: [
      {
        id: 'u3-l1',
        title: 'What is a Broker?',
        emoji: '🖥️',
        xpReward: 10,
        slides: [
          {
            type: 'intro',
            emoji: '🖥️',
            heading: 'What is a Broker?',
            body: "You can't just walk up to Apple and buy their stock. You need a middleman — a broker.",
          },
          {
            type: 'text',
            emoji: '🏪',
            heading: 'The broker is your access point',
            body: "A broker is a platform that connects you to the stock market. They execute your buy and sell orders. Without one, you can't trade. With one, you can buy stock in seconds.",
          },
          {
            type: 'fact',
            emoji: '📱',
            heading: 'Popular brokers you may know',
            body: "Robinhood, Webull, Fidelity, Charles Schwab, TD Ameritrade. They're all brokers. Most are free to use — they make money in other ways. Always research a broker before giving them your money.",
          },
          {
            type: 'text',
            emoji: '🔍',
            heading: 'What to look for in a broker',
            body: "Commission-free trades (most are now), no account minimum or a low one, easy-to-use app, good educational resources, and strong security. Never use a broker that pressures you or guarantees returns — that's a scam.",
          },
          {
            type: 'tap-reveal',
            emoji: '🛡️',
            heading: 'Is my money protected?',
            body: 'Tap to find out.',
            tapReveal: "Legitimate US brokers are insured by SIPC (Securities Investor Protection Corporation) up to $500,000. This protects you if the broker goes bankrupt — not if your stocks go down. Always verify a broker is SIPC-insured before depositing money.",
          },
          {
            type: 'quiz',
            emoji: '🧠',
            heading: 'Quick check!',
            quiz: {
              question: "What does a broker do?",
              options: [
                'Sets the price of stocks',
                'Guarantees you will make money',
                'Connects you to the stock market so you can buy and sell',
                'Only works for rich investors',
              ],
              correctIndex: 2,
              explanation: "A broker is simply your access point to the market. They execute your orders — they don't control prices or guarantee outcomes.",
            },
          },
          {
            type: 'complete',
            emoji: '✅',
            heading: "You know what a broker is.",
            body: "And you know what to look for — and what to avoid.",
            xpReward: 10,
          },
        ],
      },
      {
        id: 'u3-l2',
        title: 'How to Actually Buy a Stock',
        emoji: '💳',
        xpReward: 10,
        slides: [
          {
            type: 'intro',
            emoji: '💳',
            heading: 'How to Actually Buy a Stock',
            body: "Step by step. No mystery.",
          },
          {
            type: 'text',
            emoji: '1️⃣',
            heading: 'Step 1 — Open a brokerage account',
            body: "Download an app like Robinhood or Fidelity. Sign up with your name, email, Social Security Number (required by law), and bank info. Takes about 10 minutes. Your account gets verified within a day.",
          },
          {
            type: 'text',
            emoji: '2️⃣',
            heading: 'Step 2 — Fund your account',
            body: "Transfer money from your bank account to your brokerage. This is called a deposit. Most brokers let you start with as little as $1. The money usually clears in 1–3 business days.",
          },
          {
            type: 'text',
            emoji: '3️⃣',
            heading: 'Step 3 — Search for the stock',
            body: "Every stock has a ticker symbol — a short abbreviation. Apple = AAPL. Nike = NKE. Tesla = TSLA. Search the ticker in your broker's app and you'll see the current price and chart.",
          },
          {
            type: 'text',
            emoji: '4️⃣',
            heading: 'Step 4 — Place your order',
            body: "Choose how many shares you want and tap Buy. A market order buys at the current price right now. A limit order lets you set the price you're willing to pay. We'll cover these in depth in the next track.",
          },
          {
            type: 'quiz',
            emoji: '🧠',
            heading: 'Quick check!',
            quiz: {
              question: "What is a ticker symbol?",
              options: [
                "A company's annual report",
                'A short abbreviation used to identify a stock (e.g. AAPL for Apple)',
                "The stock's price history",
                'A type of stock order',
              ],
              correctIndex: 1,
              explanation: "Ticker symbols are short codes every stock has. You'll use them constantly when searching and trading.",
            },
          },
          {
            type: 'complete',
            emoji: '🚀',
            heading: 'You know how to buy a stock.',
            body: "The process is simpler than most people think. The hard part is knowing WHAT to buy — and that's what the rest of this app teaches you.",
            xpReward: 10,
          },
        ],
      },
      {
        id: 'u3-l3',
        title: 'What is a Portfolio?',
        emoji: '💼',
        xpReward: 10,
        slides: [
          {
            type: 'intro',
            emoji: '💼',
            heading: 'What is a Portfolio?',
            body: "Once you start buying stocks, you need to think about the bigger picture.",
          },
          {
            type: 'text',
            emoji: '🗂️',
            heading: 'Your portfolio is everything you own',
            body: "Your portfolio is the full collection of investments you hold — stocks, ETFs, cash — all of it. Think of it like a folder that holds all your investments in one place.",
          },
          {
            type: 'text',
            emoji: '🥚',
            heading: "Don't put all your eggs in one basket",
            body: "If you put all your money into one stock and that company struggles, you lose big. Spreading your money across multiple stocks — called diversification — means one bad pick doesn't wipe you out.",
          },
          {
            type: 'fact',
            emoji: '📊',
            heading: 'A simple starter portfolio',
            body: "Many beginner investors start with 5–10 stocks across different industries. Tech, retail, healthcare, food. That way, if one sector drops, others may hold steady.",
          },
          {
            type: 'tap-reveal',
            emoji: '🤔',
            heading: 'What is an ETF?',
            body: 'Tap to find out.',
            tapReveal: "An ETF (Exchange-Traded Fund) is a basket of stocks bundled into one. Buy 1 share of SPY (an S&P 500 ETF) and you instantly own a tiny piece of all 500 companies in the S&P 500. Great for beginners who want instant diversification.",
          },
          {
            type: 'quiz',
            emoji: '🧠',
            heading: 'Quick check!',
            quiz: {
              question: "What is diversification?",
              options: [
                'Putting all your money into the best stock you can find',
                'Spreading your investments across multiple stocks to reduce risk',
                'Only buying stocks that pay dividends',
                'Selling all your stocks when the market drops',
              ],
              correctIndex: 1,
              explanation: "Diversification is one of the most important risk management tools you have. It doesn't eliminate risk — but it limits how much damage any single bad investment can do.",
            },
          },
          {
            type: 'complete',
            emoji: '💼',
            heading: 'You understand portfolios.',
            body: "Diversification is your shield. You now know how to think about your investments as a whole, not just individual stocks.",
            xpReward: 10,
          },
        ],
      },
      {
        id: 'u3-l4',
        title: 'Unit 3 Quiz',
        emoji: '🏆',
        xpReward: 30,
        slides: [
          {
            type: 'intro',
            emoji: '🏆',
            heading: 'Unit 3 Quiz',
            body: "Brokers, buying, portfolios — let's make sure it all clicked.",
          },
          {
            type: 'quiz',
            emoji: '❓',
            heading: 'Question 1 of 4',
            quiz: {
              question: "You want to buy Nike stock. What do you need first?",
              options: [
                'A meeting with Nike executives',
                'A brokerage account',
                'At least $10,000',
                'A stockbroker who works on Wall Street',
              ],
              correctIndex: 1,
              explanation: "A brokerage account is your access point. Most are free to open with no minimum deposit.",
            },
          },
          {
            type: 'quiz',
            emoji: '❓',
            heading: 'Question 2 of 4',
            quiz: {
              question: "Nike's ticker symbol is NKE. What does that mean?",
              options: [
                "It's Nike's stock price",
                "It's Nike's annual revenue in billions",
                "It's the short code used to identify Nike on the stock market",
                "It's the number of shares Nike has",
              ],
              correctIndex: 2,
              explanation: "Every publicly traded company has a unique ticker symbol. It's how you search for and trade a specific stock.",
            },
          },
          {
            type: 'quiz',
            emoji: '❓',
            heading: 'Question 3 of 4',
            quiz: {
              question: "You put all your savings into one stock and it drops 60%. What investing mistake did you make?",
              options: [
                'You used the wrong broker',
                'You bought at the wrong time of day',
                'You failed to diversify — too much in one stock',
                'You should have used a limit order',
              ],
              correctIndex: 2,
              explanation: "Never put everything into one stock. Diversifying across multiple stocks and sectors protects you from any single company tanking your entire portfolio.",
            },
          },
          {
            type: 'quiz',
            emoji: '❓',
            heading: 'Question 4 of 4',
            quiz: {
              question: "What is an ETF?",
              options: [
                'A type of savings bond',
                'A basket of stocks bundled into one investment',
                'A foreign currency exchange',
                'A fee charged by brokers',
              ],
              correctIndex: 1,
              explanation: "ETFs give you instant diversification. One purchase of an S&P 500 ETF means you own a piece of 500 companies at once.",
            },
          },
          {
            type: 'complete',
            emoji: '🎓',
            heading: 'Unit 3 Complete!',
            body: "You know how to open an account, buy your first stock, and think about your portfolio. You're ready to talk money.",
            xpReward: 30,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // UNIT 4 — Money & Risk
  // ─────────────────────────────────────────────
  {
    id: 'unit-4',
    title: 'Money & Risk',
    subtitle: 'The mindset that separates winners from losers.',
    color: 'bg-red-500/10',
    borderColor: 'border-red-400',
    lessons: [
      {
        id: 'u4-l1',
        title: 'Saving vs. Investing',
        emoji: '💰',
        xpReward: 10,
        slides: [
          {
            type: 'intro',
            emoji: '💰',
            heading: 'Saving vs. Investing',
            body: "They're not the same thing. Knowing the difference is crucial.",
          },
          {
            type: 'text',
            emoji: '🏦',
            heading: 'Saving is safe — but slow',
            body: "Saving money in a bank account is safe. Your money is there when you need it. But a savings account earning 0.5% interest on $1,000 gives you just $5 a year. Inflation eats that alive.",
          },
          {
            type: 'fact',
            emoji: '📊',
            heading: 'Inflation is the silent thief',
            body: "Inflation averages about 3% per year. If your savings earn less than 3%, your money is actually losing purchasing power. $100 today won't buy the same things in 10 years.",
          },
          {
            type: 'text',
            emoji: '📈',
            heading: 'Investing grows your money',
            body: "The S&P 500 has averaged about 10% returns per year over the last 50 years. $1,000 invested and left alone for 30 years becomes roughly $17,000. That's the power of letting money work for you.",
          },
          {
            type: 'chart-demo',
            heading: 'Drag the slider and watch the difference',
            demoType: 'savings-vs-investing',
          },
          {
            type: 'text',
            emoji: '⚖️',
            heading: 'The balance',
            body: "You need both. Keep 3–6 months of living expenses in savings as an emergency fund. Invest everything beyond that. Never invest money you might need in the next 1–2 years.",
          },
          {
            type: 'quiz',
            emoji: '🧠',
            heading: 'Quick check!',
            quiz: {
              question: "Inflation is 3% per year. Your savings account earns 1% per year. What is actually happening to your money?",
              options: [
                "It's growing — 1% is better than nothing",
                "It's staying the same",
                "It's losing purchasing power — inflation is outpacing your return",
                "It's doubling every year",
              ],
              correctIndex: 2,
              explanation: "If inflation is higher than your return, your money buys less over time even though the number in your account went up. Investing is how you stay ahead of inflation.",
            },
          },
          {
            type: 'complete',
            emoji: '⚖️',
            heading: 'Saving protects. Investing grows.',
            body: "You need both — but most people only do one. Now you know the difference.",
            xpReward: 10,
          },
        ],
      },
      {
        id: 'u4-l2',
        title: "Why People Are Scared",
        emoji: '😰',
        xpReward: 10,
        slides: [
          {
            type: 'intro',
            emoji: '😰',
            heading: "Why People Are Scared",
            body: "The fear is real. But understanding it is the first step past it.",
          },
          {
            type: 'text',
            emoji: '📉',
            heading: "You can lose money — that's real",
            body: "Let's not sugarcoat it. Stocks go down. Sometimes a lot. In 2020, the market dropped 34% in one month. In 2008, it dropped 57% over a year. Scary numbers. But there's more to the story.",
          },
          {
            type: 'fact',
            emoji: '📈',
            heading: 'The market has recovered every single time',
            body: "Every crash in history — 1929, 1987, 2001, 2008, 2020 — the market eventually recovered and went on to new highs. The people who got hurt most were the ones who panicked and sold at the bottom.",
          },
          {
            type: 'text',
            emoji: '🧠',
            heading: 'Fear and greed are your biggest enemies',
            body: "FOMO (Fear of Missing Out) makes you buy at the top. Panic makes you sell at the bottom. These two emotions cause more investment losses than anything else. Recognizing them is your superpower.",
          },
          {
            type: 'tap-reveal',
            emoji: '💡',
            heading: "What should you do when the market crashes?",
            body: 'Tap to find out.',
            tapReveal: "For long-term investors: nothing. Or better — buy more. A crash is a sale on stocks. The worst thing you can do is panic-sell and lock in losses. The best investors in history got rich by buying when everyone else was scared.",
          },
          {
            type: 'quiz',
            emoji: '🧠',
            heading: 'Quick check!',
            quiz: {
              question: "The stock market drops 20% and everyone is panicking. What does history say is the right move for a long-term investor?",
              options: [
                'Sell everything immediately to stop the bleeding',
                'Stay calm — and consider buying more at lower prices',
                'Move everything to crypto',
                'Close your brokerage account',
              ],
              correctIndex: 1,
              explanation: "Market crashes are terrifying in the moment — but they're also opportunities. Every crash in history has been followed by a recovery. Panic selling turns paper losses into real ones.",
            },
          },
          {
            type: 'complete',
            emoji: '💪',
            heading: 'Fear is normal. Acting on it is optional.',
            body: "The best investors aren't fearless — they're disciplined. Now you have the context to stay calm when others don't.",
            xpReward: 10,
          },
        ],
      },
      {
        id: 'u4-l3',
        title: 'What is Risk, Really?',
        emoji: '⚖️',
        xpReward: 10,
        slides: [
          {
            type: 'intro',
            emoji: '⚖️',
            heading: 'What is Risk, Really?',
            body: "Risk isn't something to avoid. It's something to understand and manage.",
          },
          {
            type: 'text',
            emoji: '🎯',
            heading: 'Risk vs. reward',
            body: "Higher potential reward always comes with higher risk. A savings account is low risk, low reward. A single small-company stock is high risk, high reward. Understanding this tradeoff is foundational to every investment decision you'll ever make.",
          },
          {
            type: 'text',
            emoji: '🛡️',
            heading: 'The golden rule of risk',
            body: "Never invest money you cannot afford to lose. If you'd have to sell your stocks to pay rent next month, that's not investing — that's gambling with your survival. Invest only your surplus.",
          },
          {
            type: 'fact',
            emoji: '📊',
            heading: 'Position sizing — the professional approach',
            body: "Professional traders often risk no more than 1–2% of their total portfolio on any single trade. If you have $1,000, that means risking no more than $10–$20 on one position. This way, even 10 bad trades in a row don't wipe you out.",
          },
          {
            type: 'text',
            emoji: '⏳',
            heading: 'Time reduces risk',
            body: "The longer you hold a diversified portfolio, the lower your risk of losing money. Over any 20-year period in US history, the stock market has never lost money. Time is your most powerful risk management tool.",
          },
          {
            type: 'quiz',
            emoji: '🧠',
            heading: 'Quick check!',
            quiz: {
              question: "You have $500 to invest. Following the 1-2% rule, how much should you risk on a single trade?",
              options: ['$250', '$500 — go big or go home', '$5–$10', '$100'],
              correctIndex: 2,
              explanation: "1% of $500 = $5. 2% = $10. This seems small, but it means you can make 50+ trades before losing your entire investment even if every single one loses. Protecting your capital is everything.",
            },
          },
          {
            type: 'complete',
            emoji: '🛡️',
            heading: 'Risk is manageable.',
            body: "You now understand the risk/reward tradeoff, the golden rule of investing, and why position sizing matters.",
            xpReward: 10,
          },
        ],
      },
      {
        id: 'u4-l4',
        title: 'Starting Small',
        emoji: '🌱',
        xpReward: 10,
        slides: [
          {
            type: 'intro',
            emoji: '🌱',
            heading: 'Starting Small',
            body: "You don't need thousands of dollars to start investing. You need a plan.",
          },
          {
            type: 'text',
            emoji: '💵',
            heading: 'Fractional shares changed everything',
            body: "Amazon stock costs over $3,000 per share. But most brokers now offer fractional shares — you can buy $10 worth of Amazon. You own a fraction of a share, but you still benefit when the price goes up.",
          },
          {
            type: 'text',
            emoji: '📅',
            heading: 'Dollar-cost averaging',
            body: "Instead of trying to time the market perfectly, invest a fixed amount regularly — say $25 every week regardless of price. Sometimes you'll buy high, sometimes low. Over time it averages out and removes the pressure of guessing the perfect moment.",
          },
          {
            type: 'chart-demo',
            heading: 'Invest $50 each week — watch your average cost',
            demoType: 'dca',
          },
          {
            type: 'fact',
            emoji: '🔢',
            heading: 'The math of starting early',
            body: "Investing $100/month starting at age 22 grows to about $650,000 by 62 (at 10% avg return). Starting at 32 instead gets you only $226,000. Starting early is worth more than investing more money later.",
          },
          {
            type: 'tap-reveal',
            emoji: '🎯',
            heading: "What should your first investment actually be?",
            body: 'Tap to find out.',
            tapReveal: "For most beginners: an S&P 500 index ETF like VOO or SPY. It's instant diversification across 500 of the biggest US companies, low fees, and it tracks the overall market. Warren Buffett himself recommends this for most investors.",
          },
          {
            type: 'quiz',
            emoji: '🧠',
            heading: 'Quick check!',
            quiz: {
              question: "What is dollar-cost averaging?",
              options: [
                'Only buying stocks when the price is at its lowest point',
                'Investing a fixed amount regularly regardless of price',
                'Averaging the prices of multiple stocks before buying',
                'A fee your broker charges on each trade',
              ],
              correctIndex: 1,
              explanation: "Dollar-cost averaging removes the pressure of timing the market. You buy consistently — sometimes at a high, sometimes at a low — and your average cost evens out over time.",
            },
          },
          {
            type: 'complete',
            emoji: '🌱',
            heading: "Start small. Start now.",
            body: "The best investment you'll ever make is the first one — because it makes every future one easier.",
            xpReward: 10,
          },
        ],
      },
      {
        id: 'u4-l5',
        title: 'Starter Track Final Quiz',
        emoji: '🎓',
        xpReward: 50,
        slides: [
          {
            type: 'intro',
            emoji: '🎓',
            heading: 'Final Quiz',
            body: "This is it. Everything you've learned, one last time. You've got this.",
          },
          {
            type: 'quiz',
            emoji: '❓',
            heading: 'Question 1 of 5',
            quiz: {
              question: "You buy 10 shares of a company that has 1,000 total shares. The company is worth $50,000. How much is your investment worth?",
              options: ['$50', '$500', '$5,000', '$50,000'],
              correctIndex: 1,
              explanation: "10/1,000 = 1% ownership. 1% of $50,000 = $500. Understanding this math helps you evaluate whether a stock's price makes sense.",
            },
          },
          {
            type: 'quiz',
            emoji: '❓',
            heading: 'Question 2 of 5',
            quiz: {
              question: "The market drops 30% and you're scared. What is the historically proven right move for a long-term investor?",
              options: [
                'Sell everything and move to cash',
                'Stay invested and consider buying more',
                'Move everything into crypto',
                'Close your account and never invest again',
              ],
              correctIndex: 1,
              explanation: "Every market crash in history has been followed by a recovery to new highs. Selling locks in losses. The investors who stayed in — or bought more — came out ahead every time.",
            },
          },
          {
            type: 'quiz',
            emoji: '❓',
            heading: 'Question 3 of 5',
            quiz: {
              question: "What is the safest first investment for a complete beginner?",
              options: [
                'A single hot stock your friend recommended',
                'Cryptocurrency',
                'An S&P 500 index ETF like VOO or SPY',
                'Options contracts',
              ],
              correctIndex: 2,
              explanation: "An S&P 500 ETF gives you instant diversification across 500 companies, low fees, and tracks the overall market. It's what Warren Buffett recommends for most people.",
            },
          },
          {
            type: 'quiz',
            emoji: '❓',
            heading: 'Question 4 of 5',
            quiz: {
              question: "You have $1,000 to invest. Following safe risk management, the most you should risk on any single trade is:",
              options: ['$500', '$1,000 — all in', '$10–$20', '$200'],
              correctIndex: 2,
              explanation: "The 1–2% rule: risk only $10–$20 per trade on a $1,000 portfolio. It feels small but it protects you from blowing up your account on a few bad trades.",
            },
          },
          {
            type: 'quiz',
            emoji: '❓',
            heading: 'Question 5 of 5',
            quiz: {
              question: "Inflation is 3% per year. Your savings account earns 1%. Your $1,000 in savings after 1 year has actually:",
              options: [
                'Grown — $1,010 is more than $1,000',
                'Lost purchasing power — inflation outpaced your return',
                'Stayed the same in real terms',
                'Doubled because of compound interest',
              ],
              correctIndex: 1,
              explanation: "Real return = investment return minus inflation. 1% − 3% = −2%. Your money's purchasing power shrank by 2% even though the number went up.",
            },
          },
          {
            type: 'complete',
            emoji: '🏆',
            heading: 'Starter Track Complete!',
            body: "You now understand what stocks are, how the market works, how to buy your first stock, and how to manage risk. You are ready to invest. Welcome to the Builder Track.",
            xpReward: 50,
          },
        ],
      },
    ],
  },
]
