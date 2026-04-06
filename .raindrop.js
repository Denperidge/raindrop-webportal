import 'dotenv/config';
import downloadFavicon, { downloadFaviconFromWebpage, downloadFaviconFromDuckduckgo } from "favicon-grabber";
import { env } from "process"
import { writeFile } from "fs";

const DATA_DIR = "raindrops/";
const REGEX_GET_COLLECTIONS = RegExp(/vike_pageContext.*?>(?<data>.*?)<\/script>/)
const REGEX_NEXT_PAGE_DISABLED = RegExp(/<a[^<]*?title="Next page"[^>]*?data-variant="disabled"[^>]*?>/)

async function getRaindropCollectionData(raindropUrl, filename="index", page=0, relevantRaindrops=[]) {
    let raindropCollectionHtml;
    try {
        // I'm not quite sure why the website breaks when you add a ? for the params but I'll make it
        if (!raindropUrl.endsWith("/")) { raindropUrl += "/"};
        const reqUrl = `${raindropUrl}sort=-sort&perpage=50&page=${page}`;
        const data = await fetch(reqUrl);
        raindropCollectionHtml = await data.text();
        console.log(reqUrl)
    } catch (e) {
        console.error(`Couldn't finish getting data from ${raindropUrl}`);
        throw e;
    }

    const reqData = raindropCollectionHtml.match(REGEX_GET_COLLECTIONS);

    if (!reqData.groups || !Object.keys(reqData.groups).includes("data")) {
        throw new Error("Couldn't find collections from HTML");
    }
    const raindropCollectionData = JSON.parse(reqData.groups.data.replace(/\\\\/g, "\\"))
    relevantRaindrops = relevantRaindrops.concat(raindropCollectionData.data.raindrops.items);

    // Check if button exists & isn't disabled
    if (raindropCollectionHtml.includes("Next page") && !raindropCollectionHtml.match(REGEX_NEXT_PAGE_DISABLED)) {
        console.log(`Found another page! Requesting page ${page+1}`);
        relevantRaindrops = await getRaindropCollectionData(raindropUrl, filename, page+1, relevantRaindrops);
    }

    if (page == 0){
        console.log("Writing...")
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
    }

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
