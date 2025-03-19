import 'dotenv/config';
import { downloadFavicon } from "./favicon-fetcher/favicon-fetcher.js";
import { env } from "process"
import {join} from "path";
import { writeFile, createWriteStream } from "fs";
import { Readable } from "stream";
import { finished } from "stream/promises";

const OUTPUT_FILEPATH = "src/_data/raindrops.json";

const REGEX_GET_COLLECTIONS = RegExp(/(?<=vite-plugin-ssr_pageContext.*?>).*?(?=<\/script>)/)
const REGEX_GET_ICO = RegExp(/(?<=href=").*?\.ico/);


let contents;
try {
    const data = await fetch (env.RAINDROP_URL);
    contents = await data.text();
} catch (e) {
    console.error(`Couldn't finish getting data from ${env.RAINDROP_URL}`);
    throw e;
}

const data = JSON.parse(
    contents.match(REGEX_GET_COLLECTIONS)[0]
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

relevantRaindrops.forEach(async raindrop => {
    downloadFavicon(raindrop.link, `src/assets/${raindrop._id}%extname%`).then(output => {
        console.log(`Downloaded favicon for ${raindrop.link} to ${output}`)
    }).catch(err => { throw err; });
});