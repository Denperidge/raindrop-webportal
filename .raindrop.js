import 'dotenv/config';
import { env } from "process"
import { writeFile } from "fs";

const OUTPUT_FILEPATH = "src/_data/raindrops.json";

const regexGetCollections = RegExp(/(?<=vite-plugin-ssr_pageContext.*?>).*?(?=<\/script>)/)


let contents;
try {
    const data = await fetch (env.RAINDROP_URL);
    contents = await data.text();
} catch (e) {
    console.error(`Couldn't finish getting data from ${env.RAINDROP_URL}`);
    throw e;
}

const data = JSON.parse(
    contents.match(regexGetCollections)[0]
);
const relevantRaindrops = data.pageContext.pageProps.raindrops.items;

writeFile(
    OUTPUT_FILEPATH,
    JSON.stringify(relevantRaindrops),
    { encoding: "utf-8" },
    (e) => {
        if (e) { throw e; }
        else { console.log("Done! Wrote to " + OUTPUT_FILEPATH); }
    }
);