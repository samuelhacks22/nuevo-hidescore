import { storage } from "./storage";

const sampleMovies = [
  {
    title: "The Shawshank Redemption",
    description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    posterUrl: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400&h=600&fit=crop",
    releaseYear: 1994,
    genre: ["Drama"],
    platform: ["Netflix", "Amazon Prime"],
    director: "Frank Darabont",
    cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton"],
    runtime: 142,
    language: "English",
    country: "USA",
  },
  {
    title: "The Dark Knight",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
    posterUrl: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop",
    releaseYear: 2008,
    genre: ["Action", "Crime", "Drama"],
    platform: ["HBO Max"],
    director: "Christopher Nolan",
    cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
    runtime: 152,
    language: "English",
    country: "USA",
  },
  {
    title: "Inception",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.",
    posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop",
    releaseYear: 2010,
    genre: ["Sci-Fi", "Thriller", "Action"],
    platform: ["Netflix"],
    director: "Christopher Nolan",
    cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Ellen Page"],
    runtime: 148,
    language: "English",
    country: "USA",
  },
  {
    title: "Pulp Fiction",
    description: "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.",
    posterUrl: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=600&fit=crop",
    releaseYear: 1994,
    genre: ["Crime", "Drama"],
    platform: ["Amazon Prime"],
    director: "Quentin Tarantino",
    cast: ["John Travolta", "Uma Thurman", "Samuel L. Jackson"],
    runtime: 154,
    language: "English",
    country: "USA",
  },
  {
    title: "The Matrix",
    description: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    posterUrl: "https://images.unsplash.com/photo-1574267432644-f610dd5d9c17?w=400&h=600&fit=crop",
    releaseYear: 1999,
    genre: ["Sci-Fi", "Action"],
    platform: ["HBO Max"],
    director: "Lana Wachowski, Lilly Wachowski",
    cast: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss"],
    runtime: 136,
    language: "English",
    country: "USA",
  },
  {
    title: "Interstellar",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    posterUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=600&fit=crop",
    releaseYear: 2014,
    genre: ["Sci-Fi", "Drama", "Adventure"],
    platform: ["Paramount+"],
    director: "Christopher Nolan",
    cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
    runtime: 169,
    language: "English",
    country: "USA",
  },
];

const sampleSeries = [
  {
    title: "Breaking Bad",
    description: "A high school chemistry teacher turned methamphetamine manufacturer partners with a former student.",
    posterUrl: "https://images.unsplash.com/photo-1574267432644-f610dd5d9c17?w=400&h=600&fit=crop",
    releaseYear: 2008,
    endYear: 2013,
    genre: ["Crime", "Drama", "Thriller"],
    platform: ["Netflix"],
    creator: "Vince Gilligan",
    cast: ["Bryan Cranston", "Aaron Paul", "Anna Gunn"],
    seasons: 5,
    episodes: 62,
    language: "English",
    country: "USA",
  },
  {
    title: "Game of Thrones",
    description: "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns.",
    posterUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop",
    releaseYear: 2011,
    endYear: 2019,
    genre: ["Fantasy", "Drama", "Adventure"],
    platform: ["HBO Max"],
    creator: "David Benioff, D.B. Weiss",
    cast: ["Emilia Clarke", "Peter Dinklage", "Kit Harington"],
    seasons: 8,
    episodes: 73,
    language: "English",
    country: "USA",
  },
  {
    title: "Stranger Things",
    description: "When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces.",
    posterUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop",
    releaseYear: 2016,
    genre: ["Sci-Fi", "Horror", "Drama"],
    platform: ["Netflix"],
    creator: "The Duffer Brothers",
    cast: ["Millie Bobby Brown", "Finn Wolfhard", "Winona Ryder"],
    seasons: 4,
    episodes: 34,
    language: "English",
    country: "USA",
  },
  {
    title: "The Crown",
    description: "Follows the political rivalries and romance of Queen Elizabeth II's reign and the events that shaped the second half of the 20th century.",
    posterUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop",
    releaseYear: 2016,
    genre: ["Drama", "Documentary"],
    platform: ["Netflix"],
    creator: "Peter Morgan",
    cast: ["Claire Foy", "Olivia Colman", "Imelda Staunton"],
    seasons: 6,
    episodes: 60,
    language: "English",
    country: "UK",
  },
  {
    title: "The Mandalorian",
    description: "The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.",
    posterUrl: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=400&h=600&fit=crop",
    releaseYear: 2019,
    genre: ["Sci-Fi", "Action", "Adventure"],
    platform: ["Disney+"],
    creator: "Jon Favreau",
    cast: ["Pedro Pascal", "Gina Carano", "Giancarlo Esposito"],
    seasons: 3,
    episodes: 24,
    language: "English",
    country: "USA",
  },
];

export async function seedDatabase() {
  try {
    console.log("Seeding database...");

    // Check if data already exists
    const existingMovies = await storage.getAllMovies();
    const existingSeries = await storage.getAllSeries();

    if (existingMovies.length > 0 || existingSeries.length > 0) {
      console.log("Database already has content. Skipping seed.");
      return;
    }

    // Seed movies
    for (const movie of sampleMovies) {
      await storage.createMovie(movie);
      console.log(`Created movie: ${movie.title}`);
    }

    // Seed series
    for (const series of sampleSeries) {
      await storage.createSeries(series);
      console.log(`Created series: ${series.title}`);
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}
