import 'dotenv/config';
import downloadFavicon, { downloadFaviconFromWebpage, downloadFaviconFromDuckduckgo } from "favicon-grabber";
import { env } from "process"
import { writeFile } from "fs";

const DATA_DIR = "raindrops/";
const REGEX_GET_COLLECTIONS = RegExp(/(?<=vite-plugin-ssr_pageContext.*?>).*?(?=<\/script>)/)

async function getRaindropCollectionData(raindropUrl, filename="index") {
    let raindropCollectionHtml;
    try {
        const data = await fetch(raindropUrl);
        raindropCollectionHtml = await data.text();
    } catch (e) {
        console.error(`Couldn't finish getting data from ${raindropUrl}`);
        throw e;
    }

    const raindropCollectionData = JSON.parse(
        raindropCollectionHtml.match(
            REGEX_GET_COLLECTIONS
        )[0]
    );
    const relevantRaindrops = raindropCollectionData.pageContext.pageProps.raindrops.items;

    const dest = DATA_DIR + filename + ".json";
    writeFile(
        dest,
        JSON.stringify(relevantRaindrops),
        { encoding: "utf-8" },
        (e) => {
            if (e) { throw e; }
            else { console.log("Done! Wrote to " + dest); }
        }
    );

    return relevantRaindrops;
}

async function getRaindropFavicons(raindropArray) {
    for (let i = 0; i < raindropArray.length; i++) {
        const raindrop = raindropArray[i];
        const overrides = {};
        let downloadFunc = downloadFavicon;

        if (raindrop.link.includes("transreads", "https://transreads.org/")) {
            downloadFunc = downloadFaviconFromWebpage        
        } else if (raindrop.link.includes("queerjs")) {
            overrides.searchMetaTags = true;
            overrides.ignoreContentTypeHeader = true;
        } else if (raindrop.link.includes("https://beeldbank.kortrijk.be/portal/media")) {
            downloadFunc= downloadFaviconFromDuckduckgo;
        }

        try {
            const output = await downloadFunc(raindrop.link, `src/_assets/${raindrop._id}%extname%`, overrides)
            console.log(`Downloaded favicon for ${raindrop.link} to ${output}`)
        } catch (e) {
            console.log(e)
        }
    };
}

const entries = env.RAINDROP_URLS.split(",");
for (let i = 0; i < entries.length; i++) {
    const [ pageName, url ] = entries[i].split("@", 2)

    getRaindropCollectionData(url, pageName).then(async (collectionData) => {
        getRaindropFavicons(collectionData).catch((e) => {console.log(e)})
    }).catch((e) => {console.log(e)})
}
