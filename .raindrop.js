import 'dotenv/config';
import downloadFavicon, { downloadFaviconFromWebpage } from "favicon-grabber";
import { env } from "process"
import { writeFile } from "fs";

const OUTPUT_FILEPATH = "src/_data/raindrops.json";
const REGEX_GET_COLLECTIONS = RegExp(/(?<=vite-plugin-ssr_pageContext.*?>).*?(?=<\/script>)/)

async function getRaindropCollectionData() {
    let raindropCollectionHtml;
    try {
        const data = await fetch (env.RAINDROP_URL);
        raindropCollectionHtml = await data.text();
    } catch (e) {
        console.error(`Couldn't finish getting data from ${env.RAINDROP_URL}`);
        throw e;
    }

    const raindropCollectionData = JSON.parse(
        raindropCollectionHtml.match(
            REGEX_GET_COLLECTIONS
        )[0]
    );
    const relevantRaindrops = raindropCollectionData.pageContext.pageProps.raindrops.items;

    writeFile(
        OUTPUT_FILEPATH,
        JSON.stringify(relevantRaindrops),
        { encoding: "utf-8" },
        (e) => {
            if (e) { throw e; }
            else { console.log("Done! Wrote to " + OUTPUT_FILEPATH); }
        }
    );

    return relevantRaindrops;
}

const raindrops = await getRaindropCollectionData();

raindrops.forEach(async raindrop => {
    let downloadFunc = downloadFavicon;
    if (raindrop.link.includes("transreads", "https://transreads.org/")) {
        downloadFunc = downloadFaviconFromWebpage        
    }
    try {
        const output = await downloadFunc(raindrop.link, `src/assets/${raindrop._id}%extname%`)
        console.log(`Downloaded favicon for ${raindrop.link} to ${output}`)
    } catch (e) {
        console.log(e)
    }
});