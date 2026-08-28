export type Source =
  | {
      id: string;
      name: string;
      type: "rss";
      feedUrl: string;
    }
  | {
      id: string;
      name: string;
      type: "scrape";
      listUrl: string;
      baseUrl: string;
      // Matches an article href on the listing page, e.g. /news/some-slug
      linkPattern: RegExp;
      maxItems: number;
    }
  | {
      id: string;
      name: string;
      type: "scrape-js";
      // Listing content is client-rendered; not fetchable with a plain HTTP GET.
      // Left as a documented gap for now - see pipeline/README.md.
      listUrl: string;
    };

export const sources: Source[] = [
  // --- Core AI news & analysis ---
  {
    id: "the-batch",
    name: "The Batch (DeepLearning.AI)",
    type: "scrape",
    listUrl: "https://www.deeplearning.ai/the-batch/",
    baseUrl: "https://www.deeplearning.ai",
    linkPattern: /^\/the-batch\/issue-\d+$/,
    maxItems: 5,
  },
  { id: "simon-willison", name: "Simon Willison", type: "rss", feedUrl: "https://simonwillison.net/atom/everything/" },
  { id: "import-ai", name: "Import AI", type: "rss", feedUrl: "https://importai.substack.com/feed" },
  { id: "semianalysis", name: "SemiAnalysis", type: "rss", feedUrl: "https://newsletter.semianalysis.com/feed" },
  { id: "one-useful-thing", name: "One Useful Thing", type: "rss", feedUrl: "https://oneusefulthing.substack.com/feed" },

  // --- Primary AI company sources ---
  { id: "openai-news", name: "OpenAI News", type: "rss", feedUrl: "https://openai.com/news/rss.xml" },
  {
    id: "anthropic-news",
    name: "Anthropic News",
    type: "scrape",
    listUrl: "https://www.anthropic.com/news",
    baseUrl: "https://www.anthropic.com",
    linkPattern: /^\/news\/[a-z0-9-]+$/,
    maxItems: 10,
  },
  { id: "deepmind-blog", name: "DeepMind Blog", type: "rss", feedUrl: "https://deepmind.google/blog/rss.xml" },
  { id: "huggingface-blog", name: "Hugging Face Blog", type: "rss", feedUrl: "https://huggingface.co/blog/feed.xml" },
  { id: "google-ai-blog", name: "Google AI Blog", type: "rss", feedUrl: "https://blog.google/innovation-and-ai/technology/ai/rss/" },

  // --- India AI ecosystem ---
  {
    id: "sarvam-blog",
    name: "Sarvam AI Blog",
    type: "scrape",
    listUrl: "https://www.sarvam.ai/blogs",
    baseUrl: "https://www.sarvam.ai",
    linkPattern: /^\/blogs\/[a-z0-9-]+$/,
    maxItems: 10,
  },
  {
    id: "ai4bharat",
    name: "AI4Bharat",
    type: "scrape-js",
    listUrl: "https://ai4bharat.iitm.ac.in/blog",
  },
  {
    id: "indiaai-gov",
    name: "IndiaAI",
    type: "scrape",
    listUrl: "https://indiaai.gov.in/news",
    baseUrl: "https://indiaai.gov.in",
    linkPattern: /^\/news\/[a-z0-9-]+$/,
    maxItems: 10,
  },
  {
    id: "techcrunch-ai",
    name: "TechCrunch AI",
    type: "rss",
    feedUrl: "https://techcrunch.com/category/artificial-intelligence/feed/",
  },
];
