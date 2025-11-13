// Dr. ChinTickle Motivational Quote System
// Miami Vice themed motivational quotes with context-aware selection

export const drChinTickleQuotes = {
  // Motivational (Serious - for missed workouts, comeback motivation)
  general: [
    "If you can get 1% better each day for one year, you'll end up 37 times better by the time you're done.",
    "Never miss twice.",
    "You do not rise to the level of your goals. You fall to the level of your systems.",
    "Start small, but start now.",
    "Consistency before intensity. Start small and become the kind of person who shows up every day.",
    "Being consistent is not the same as being perfect… It is all about average speed, not maximum speed.",
    "Habits are the compound interest of self-improvement.",
    "The best time to plant a tree was 20 years ago. The second best time is now.",
    "You don't have to be great to get started, but you have to get started to be great.",
    "Small progress is still progress. Don't let perfect be the enemy of good.",
    "The only workout you'll regret is the one you didn't do."
  ],

  // Reality Check (Pre-workout harsh truth bombs)
  preWorkout: [
    "There's no such thing as depression because you can just go to the gym.",
    "I've never met a person taking their fitness seriously who's depressed.",
    "You don't have to be fat. This is a choice you're making every day.",
    "God hates when you disrespect a gift he gives you. This is why weak people are always unlucky.",
    "Every day you don't work out is a vote for the person you don't want to become.",
    "Your genetics loaded the gun. Your lifestyle pulls the trigger.",
    "The cemetery is full of people who were going to start tomorrow.",
    "You're not too busy. You just don't want it enough.",
    "Your current habits are perfectly designed to give you the results you're currently getting.",
    "If you don't make time for exercise, you'll have to make time for illness.",
    // New quotes for v1.3.0
    "The only thing harder than working out is explaining why you didn't.",
    "You know what's harder than working out? Being weak and hating yourself.",
    "You're not too tired to work out. You're too weak to start.",
    "Your body keeps an accurate journal regardless of what you write on Instagram.",
    "You can Facetune your photos but you can't Facetune your blood pressure.",
    "Your excuses are more consistent than your workouts."
  ],

  // Workout Dark Humor (During workouts and rest periods)
  workout: [
    // Funny quotes moved here
    "Remember: You're not just building muscle, you're building character. And frankly, you need both.",
    "Every rep is a small rebellion against your past lazy self.",
    "Somewhere out there, someone weaker than you is making excuses.",
    "20 minutes too tough? Even your excuses are out of shape!",
    "If it takes you more than 20 minutes, you're overcompensating",
    // Original workout quotes
    "Only cucks and cowards stay at the gym longer than 20 mins.",
    "Your excuses are like your biceps - practically non-existent.",
    "Lunch has been canceled today due to lack of hustle.",
    "Pain is weakness leaving the body. And you have a lot of weakness to get rid of.",
    "If it doesn't challenge you, it won't change you. And you really need changing.",
    "Sweat is just fat crying.",
    "Burn fat, not excuses",
    "Workouts lasting more than 20 minutes are for untalented people.",
    "You're training like someone who wants to stay exactly where they are.",
    "Exceed 20 minutes? Gay.",
    "Beyond 20 min? Gay.",
    "Longer than 20 min? Pure gay.",
    // New quotes for v1.3.0
    "You're not tired, you're just not used to not being lazy.",
    "If you're still here after 20 minutes, you're procrastinating.",
    "Complaining burns zero calories.",
    "If lifting was easy, it would be called 'your life choices.'",
    "That's not sweat, that's your ego melting.",
    "Your ancestors hunted mammoths. You can handle 20 minutes."
  ],

  // Victory (Post-workout celebration)
  completion: [
    "Another victory in the war against weakness.",
    "Pain is temporary, but being weak is forever (and also embarrassing).",
    "You just proved weakness wrong.",
    // New quotes for v1.3.0
    "Congratulations. You did the bare minimum for self-respect.",
    "Twenty minutes of effort. A lifetime of not being pathetic.",
    "You're done. Your excuses can come back now.",
    "That wasn't hard. You're just soft. But you're less soft now.",
    "You completed 20 minutes. Most people can't even complete a sentence without complaining.",
    "While you were working out, your excuses were at home getting fat."
  ]
};

// Context-aware quote selection
export const getQuote = (context = 'general', previousQuote = null) => {
  // Map legacy/other contexts to new categories for compatibility
  let quotes;
  switch (context) {
    case 'preWorkout':
      quotes = drChinTickleQuotes.preWorkout;
      break;
    case 'workout':
      quotes = drChinTickleQuotes.workout;
      break;
    case 'completion':
      quotes = drChinTickleQuotes.completion;
      break;
    case 'welcome': // Login screen should use preWorkout
      quotes = drChinTickleQuotes.preWorkout;
      break;
    case 'rest': // Rest timer should use workout quotes
      quotes = drChinTickleQuotes.workout;
      break;
    default:
      quotes = drChinTickleQuotes.general;
  }

  // Avoid repeating the same quote
  let availableQuotes = quotes;
  if (previousQuote) {
    availableQuotes = quotes.filter(quote => quote !== previousQuote);
  }
  if (availableQuotes.length === 0) {
    availableQuotes = quotes;
  }
  return availableQuotes[Math.floor(Math.random() * availableQuotes.length)];
};

// Helper to rotate between preWorkout and general for dashboard
export const getDashboardQuote = (previousContext = null, previousQuote = null) => {
  // Alternate between preWorkout and general
  const categories = ['preWorkout', 'general'];
  // If previousContext is null, pick randomly
  let nextCategory;
  if (!previousContext) {
    nextCategory = categories[Math.floor(Math.random() * categories.length)];
  } else {
    // Alternate
    nextCategory = previousContext === 'preWorkout' ? 'general' : 'preWorkout';
  }
  return {
    quote: getQuote(nextCategory, previousQuote),
    context: nextCategory
  };
};

// Special occasion quotes (unchanged)
export const getSpecialQuote = (occasion) => {
  const specialQuotes = {
    birthday: "Happy Birthday! Your gift? The opportunity to get stronger!",
    newYear: "New Year, New Gains! Time to make this year legendary!",
    monday: "Monday Motivation: Champions don't take days off!",
    weekend: "Weekend Warriors assemble! Time to earn your rest!",
    milestone: "Milestone achieved! You're officially in beast mode!",
  };
  return specialQuotes[occasion] || getQuote('general');
};

export default {
  getQuote,
  getSpecialQuote,
  drChinTickleQuotes,
}; 