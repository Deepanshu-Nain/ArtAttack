const WORDS = [
  "Apple", "Dog", "House", "Tree", "Car", "Sun", "Moon", "Star",
  "Cat", "Bird", "Fish", "Flower", "Book", "Chair", "Table", "Phone",
  "Computer", "Pizza", "Hamburger", "Coffee", "Guitar", "Piano",
  "Mountain", "River", "Ocean", "Ship", "Train", "Airplane", "Rocket",
  "Ghost", "Dragon", "Robot", "Alien", "Zombie", "Vampire", "Ninja",
  "Pirate", "King", "Queen", "Castle", "Sword", "Shield", "Crown"
];

// Fisher-Yates shuffle — unlike `sort(() => 0.5 - Math.random())` this is
// unbiased, so every word is equally likely to be offered.
function shuffle<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function generateWordChoices(count: number = 3): string[] {
  return shuffle(WORDS).slice(0, count);
}
