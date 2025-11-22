
import { storage } from "../server/storage";

async function testSearch() {
    console.log("Testing search for 'Batman'...");
    try {
        const results = await storage.getAllMovies({ search: "Batman" });
        console.log(`Found ${results.length} results for 'Batman'`);
        results.forEach(m => console.log(`- ${m.title}`));
    } catch (e) {
        console.error("Error searching movies:", e);
    }

    console.log("\nTesting search for 'Inception'...");
    try {
        const results = await storage.getAllMovies({ search: "Inception" });
        console.log(`Found ${results.length} results for 'Inception'`);
        results.forEach(m => console.log(`- ${m.title}`));
    } catch (e) {
        console.error("Error searching movies:", e);
    }

    process.exit(0);
}

testSearch().catch(console.error);
