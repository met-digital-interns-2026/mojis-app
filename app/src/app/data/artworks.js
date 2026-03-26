// This file holds all the artwork data in one place.
// Right now it's hardcoded — later we'll replace this with database calls.

export const CATEGORIES = [
  {
    emoji: "😢",
    label: "Saddest",
    count: 2847,
    color: "#4A6FA5",
    bgGrad: "linear-gradient(135deg, #4A6FA5 0%, #2D4A7A 100%)",
    exhibition: "European Paintings",
    artwork: {
      id: "436105",
      title: "The Death of Socrates",
      artist: "Jacques-Louis David",
      year: "1787",
      image: "https://images.metmuseum.org/CRDImages/ep/original/DP-13139-001.jpg",
      reactions: { "😢": 1243, "😮": 892, "🤔": 712 },
      comments: [
        { user: "ArtLover42", emoji: "😢", text: "This one hits different when you see it in person", likes: 24, replies: [
          { user: "MuseumGuide", emoji: "😮", text: "Right?? The painting is over 10 feet wide!", likes: 8 },
          { user: "ClassicsFan", emoji: "😢", text: "I literally teared up standing in front of it", likes: 5 },
        ]},
        { user: "MuseumKid", emoji: "😮", text: "Wait he actually chose to die?? That's wild", likes: 18, replies: [
          { user: "PhiloNerd", emoji: "🤔", text: "He believed in following the law even when it was unjust", likes: 12 },
        ]},
        { user: "SocratesFan", emoji: "🤔", text: "The way his students are grieving while he stays calm...", likes: 31, replies: [] },
      ],
    },
  },
  {
    emoji: "❤️",
    label: "Most Loved",
    count: 5102,
    color: "#C1476F",
    bgGrad: "linear-gradient(135deg, #C1476F 0%, #8B2252 100%)",
    exhibition: "Modern & Contemporary",
    artwork: {
      id: "437984",
      title: "Water Lilies",
      artist: "Claude Monet",
      year: "1919",
      image: "https://images.metmuseum.org/CRDImages/ep/original/DT1877.jpg",
      reactions: { "❤️": 3891, "😍": 1211, "✨": 842 },
      comments: [
        { user: "PaintingPro", emoji: "❤️", text: "I could stare at this for hours honestly", likes: 42, replies: [
          { user: "MonetStan", emoji: "😍", text: "Same!! I sat on the bench for 20 minutes", likes: 15 },
        ]},
        { user: "LilyPad", emoji: "😍", text: "The colors are insane up close!!", likes: 33, replies: [] },
      ],
    },
  },
  {
    emoji: "😱",
    label: "Most Shocking",
    count: 1956,
    color: "#D4763A",
    bgGrad: "linear-gradient(135deg, #D4763A 0%, #A04E1B 100%)",
    exhibition: "Arms & Armor",
    artwork: {
      id: "35829",
      title: "Armor Garniture",
      artist: "Attributed to Kolman Helmschmid",
      year: "ca. 1525",
      image: "https://images.metmuseum.org/CRDImages/aa/original/DP-12881-005.jpg",
      reactions: { "😱": 987, "😮": 654, "🔥": 315 },
      comments: [
        { user: "KnightFan", emoji: "😱", text: "Imagine actually wearing this into battle", likes: 15, replies: [
          { user: "ArmorNerd", emoji: "🔥", text: "It weighs like 50 pounds and they fought in it!!", likes: 9 },
        ]},
        { user: "HistoryNerd", emoji: "🔥", text: "The detail on this is next level craftsmanship", likes: 22, replies: [] },
      ],
    },
  },
  {
    emoji: "🤔",
    label: "Most Puzzling",
    count: 3211,
    color: "#6B7B5E",
    bgGrad: "linear-gradient(135deg, #6B7B5E 0%, #4A5940 100%)",
    exhibition: "Asian Art",
    artwork: {
      id: "45434",
      title: "Under the Wave off Kanagawa",
      artist: "Katsushika Hokusai",
      year: "ca. 1830–32",
      image: "https://images.metmuseum.org/CRDImages/as/original/DP141139.jpg",
      reactions: { "🤔": 1567, "😍": 1102, "✨": 542 },
      comments: [
        { user: "WaveCatcher", emoji: "🤔", text: "Is it about nature's power or human smallness?", likes: 27, replies: [
          { user: "ArtTeacher", emoji: "✨", text: "That's the beauty of it — it's both!", likes: 19 },
        ]},
        { user: "PrintLover", emoji: "😍", text: "Fun fact: this is a woodblock print not a painting!", likes: 45, replies: [
          { user: "WaveCatcher", emoji: "😮", text: "Wait WHAT that makes it even more impressive", likes: 11 },
        ]},
        { user: "OceanVibes", emoji: "✨", text: "Mt. Fuji hiding in the background is everything", likes: 16, replies: [] },
      ],
    },
  },
  {
    emoji: "😍",
    label: "Most Beautiful",
    count: 4320,
    color: "#8E6BAD",
    bgGrad: "linear-gradient(135deg, #8E6BAD 0%, #5E3D7A 100%)",
    exhibition: "Egyptian Art",
    artwork: {
      id: "544",
      title: "Sphinx of Hatshepsut",
      artist: "Unknown",
      year: "ca. 1479–1458 B.C.",
      image: "https://images.metmuseum.org/CRDImages/eg/original/DP246556.jpg",
      reactions: { "😍": 2104, "😮": 1305, "❤️": 911 },
      comments: [
        { user: "EgyptFan", emoji: "😍", text: "A female pharaoh!! She was ahead of her time", likes: 38, replies: [
          { user: "HistoryBuff", emoji: "🔥", text: "Hatshepsut was one of the most successful pharaohs ever", likes: 21 },
        ]},
        { user: "TimeTraveler", emoji: "😮", text: "3,500 years old and still looks this good", likes: 29, replies: [] },
      ],
    },
  },
];

export const TRENDING = [
  { emoji: "🔥", title: "Starry Night Sketch", artist: "Van Gogh", count: 89, time: "2m ago" },
  { emoji: "😂", title: "Portrait of a Man", artist: "Frans Hals", count: 45, time: "5m ago" },
  { emoji: "✨", title: "Temple of Dendur", artist: "Egyptian, 15 B.C.", count: 312, time: "12m ago" },
];

export const EMOJI_CATEGORIES = {
  sad:        { label: "Sad",          color: "#4A6FA5", levels: ["😕","😞","😢","😭"] },
  disgusted:  { label: "Disgusted",    color: "#7CB342", levels: ["😐","🤢","🤮","💀"] },
  confused:   { label: "Confused",     color: "#FF9800", levels: ["🤔","😵‍💫","🤯","❓"] },
  love:       { label: "Love",         color: "#C1476F", levels: ["🙂","😍","❤️‍🔥","💖"] },
  funny:      { label: "Funny",        color: "#FFD600", levels: ["😏","😄","😂","🤣"] },
  scary:      { label: "Scary",        color: "#7B1FA2", levels: ["😟","😨","😱","👻"] },
  mindblowing:{ label: "Mind-blowing", color: "#00BCD4", levels: ["😮","🤯","💥","✨"] },
  angry:      { label: "Angry",        color: "#F44336", levels: ["😑","😡","🤬","🔥"] },
};

// This is the artwork shown on the detail page and scan page.
// Later this will come from the database based on the URL.
export const ARTWORK_DETAIL = {
  id: "11417",
  title: "Washington Crossing the Delaware",
  artist: "Emanuel Leutze",
  year: "1851",
  gallery: "Gallery 760",
  exhibition: "American Wing",
  medium: "Oil on canvas",
  dimensions: "149 × 255 in. (378.5 × 647.7 cm)",
  image: "https://images.metmuseum.org/CRDImages/ap/original/DT100.jpg",
  description: "This iconic painting captures George Washington's daring surprise crossing of the Delaware River on December 25–26, 1776, a turning point of the American Revolution. Leutze, a German-American painter, created this monumental work in Düsseldorf to inspire liberal reformers in Europe. The dramatic composition, luminous sky, and heroic poses have made it one of the most recognized images in American art.",
  reactions: { "😍": 1893, "😮": 1241, "🇺🇸": 876, "🔥": 654 },
  totalReactions: 4664,
  comments: [
    { user: "PatriotPete", emoji: "🇺🇸", text: "Standing in front of this made me emotional ngl", likes: 34, replies: [
      { user: "ArtNewbie", emoji: "😍", text: "Same I wasn't expecting to feel so much!", replyTo: "PatriotPete", likes: 12 },
    ]},
    { user: "ArtStudent", emoji: "😮", text: "The scale of this painting is INSANE in person — like 20 feet wide", likes: 51, replies: [
      { user: "MetGuide", emoji: "🔥", text: "It's actually over 21 feet! One of the largest in the museum", replyTo: "ArtStudent", likes: 18 },
      { user: "ArtStudent", emoji: "😮", text: "That's even crazier than I thought!!", replyTo: "MetGuide", likes: 5 },
    ]},
    { user: "HistoryBuff", emoji: "😍", text: "Fun fact: Leutze painted this in Germany, not America!", likes: 28, replies: [] },
    { user: "ClassicsFan", emoji: "🤔", text: "The flag in the painting is historically inaccurate — it wasn't designed yet in 1776", likes: 43, replies: [
      { user: "HistoryBuff", emoji: "😮", text: "Great catch! Leutze used artistic license for the drama", replyTo: "ClassicsFan", likes: 15 },
    ]},
  ],
};

export const RELATED_ARTWORKS = [
  { id: "11507", title: "The Rocky Mountains, Lander's Peak", artist: "Albert Bierstadt", year: "1863", image: "https://images.metmuseum.org/CRDImages/ap/original/DT160.jpg", topEmoji: "😍", reactions: 1847 },
  { id: "10159", title: "Fur Traders Descending the Missouri", artist: "George Caleb Bingham", year: "1845", image: "https://images.metmuseum.org/CRDImages/ap/original/DT68.jpg", topEmoji: "❤️", reactions: 923 },
  { id: "10814", title: "Heart of the Andes", artist: "Frederic Edwin Church", year: "1859", image: "https://images.metmuseum.org/CRDImages/ap/original/DT51.jpg", topEmoji: "😮", reactions: 2105 },
  { id: "11189", title: "The Veteran in a New Field", artist: "Winslow Homer", year: "1865", image: "https://images.metmuseum.org/CRDImages/ap/original/DT1880.jpg", topEmoji: "🤔", reactions: 654 },
];

// Flat list of all featured artworks available as avatar choices
export const FEATURED_ARTWORKS = [
  { id: "436105",  title: "The Death of Socrates",                artist: "Jacques-Louis David",        image: "https://images.metmuseum.org/CRDImages/ep/original/DP-13139-001.jpg" },
  { id: "437984",  title: "Water Lilies",                         artist: "Claude Monet",               image: "https://images.metmuseum.org/CRDImages/ep/original/DT1877.jpg" },
  { id: "35829",   title: "Armor Garniture",                      artist: "Kolman Helmschmid",          image: "https://images.metmuseum.org/CRDImages/aa/original/DP-12881-005.jpg" },
  { id: "45434",   title: "Under the Wave off Kanagawa",          artist: "Katsushika Hokusai",         image: "https://images.metmuseum.org/CRDImages/as/original/DP141139.jpg" },
  { id: "544",     title: "Sphinx of Hatshepsut",                 artist: "Unknown",                    image: "https://images.metmuseum.org/CRDImages/eg/original/DP246556.jpg" },
  { id: "11417",   title: "Washington Crossing the Delaware",     artist: "Emanuel Leutze",             image: "https://images.metmuseum.org/CRDImages/ap/original/DT100.jpg" },
  { id: "11507",   title: "The Rocky Mountains, Lander's Peak",   artist: "Albert Bierstadt",           image: "https://images.metmuseum.org/CRDImages/ap/original/DT160.jpg" },
  { id: "10159",   title: "Fur Traders Descending the Missouri",  artist: "George Caleb Bingham",       image: "https://images.metmuseum.org/CRDImages/ap/original/DT68.jpg" },
  { id: "10814",   title: "Heart of the Andes",                   artist: "Frederic Edwin Church",      image: "https://images.metmuseum.org/CRDImages/ap/original/DT51.jpg" },
  { id: "11189",   title: "The Veteran in a New Field",           artist: "Winslow Homer",              image: "https://images.metmuseum.org/CRDImages/ap/original/DT1880.jpg" },
];

// Helper: look up an artwork by ID from all our data
export function getArtworkById(id) {
  if (ARTWORK_DETAIL.id === id) return ARTWORK_DETAIL;
  for (const cat of CATEGORIES) {
    if (cat.artwork.id === id) return cat.artwork;
  }
  const related = RELATED_ARTWORKS.find(a => a.id === id);
  if (related) return related;
  return null;
}
