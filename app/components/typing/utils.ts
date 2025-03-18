export const commonWords = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
  "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
  "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"
];

export const quotes = [
  "The only way to do great work is to love what you do.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Life is what happens when you're busy making other plans.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "It does not matter how slowly you go as long as you do not stop.",
  "Everything you've ever wanted is on the other side of fear.",
  "The best way to predict the future is to create it.",
  "The journey of a thousand miles begins with one step.",
  "The only impossible journey is the one you never begin.",
  "What you get by achieving your goals is not as important as what you become by achieving your goals."
];

export const themes = {
  dark: {
    background: '#323437',
    text: '#d1d0c5',
    textDark: '#646669',
    primary: '#e2b714',
    containerBg: '#2c2e31',
    error: '#ca4754'
  },
  light: {
    background: '#ffffff',
    text: '#2c2e31',
    textDark: '#646669',
    primary: '#e2b714',
    containerBg: '#f2f2f2',
    error: '#ca4754'
  }
};

export const generateTestText = (count: number, mode: 'time' | 'words' | 'quote' | 'custom' = 'time', customText?: string) => {
  // For custom mode, return the provided text
  if (mode === 'custom' && customText) {
    return customText;
  }

  // For quote mode, return a random quote
  if (mode === 'quote') {
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  // Scale word count based on test duration for time mode
  let wordCount;
  if (mode === 'time') {
    if (count <= 15) {
      wordCount = Math.floor(Math.random() * 3) + 8; // 8-10 words for 15s
    } else if (count <= 30) {
      wordCount = Math.floor(Math.random() * 5) + 15; // 15-20 words for 30s
    } else if (count <= 60) {
      wordCount = Math.floor(Math.random() * 10) + 25; // 25-35 words for 60s
    } else {
      wordCount = Math.floor(Math.random() * 15) + 40; // 40-55 words for 120s
    }
  } else {
    // For words mode, use the provided count
    wordCount = count;
  }

  const selectedWords = Array.from({ length: wordCount }, () => 
    commonWords[Math.floor(Math.random() * commonWords.length)]
  );
  return selectedWords.join(" ");
};

export interface SpeedDataPoint {
  time: number;
  wpm: number;
  raw: number;
} 