import 'dotenv/config';
import { env } from "process"
import {join} from "path";
import { writeFile, createWriteStream } from "fs";
import { Readable } from "stream";
import { finished } from "stream/promises";

const OUTPUT_FILEPATH = "src/_data/raindrops.json";

const regexGetCollections = RegExp(/(?<=vite-plugin-ssr_pageContext.*?>).*?(?=<\/script>)/)

async function downloadFavicon(url, outputFilename, triedBaseDomain=false) {
    const fullOutputFilename = "src/assets/" + outputFilename + ".ico";
    return new Promise(async (resolve, reject) => {
        try {
            const data = await fetch(join(url, "favicon.ico"));
            // Thanks to antonok on https://stackoverflow.com/a/74722818
            const body = data.body;
            const stream = createWriteStream(fullOutputFilename);
            await finished(Readable.fromWeb(body).pipe(stream))
            resolve(fullOutputFilename)
        } catch (e) {
            console.error(`Couldn't finish getting data from ${env.RAINDROP_URL}`);
            if (!triedBaseDomain) {
                downloadFavicon(url, outputFilename, true).then((out) => {
                    resolve(out);
                })
            } else {
                throw e;
            }
        }
    });
}


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

relevantRaindrops.forEach(async raindrop => {
    console.log(
        await downloadFavicon(raindrop.link, raindrop._id)
    )
});