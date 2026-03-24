import 'dotenv/config';
import { env } from "process"
import { writeFile } from "fs";
import { extname } from 'path';
import metafetch from 'metafetch';

const DATA_DIR = "raindrops/";
const REGEX_GET_COLLECTIONS = RegExp(/vike_pageContext.*?>(?<data>.*?)<\/script>/)

async function getRaindropCollectionData(raindropUrl, filename="index") {
    let raindropCollectionHtml;
    try {
        const data = await fetch(raindropUrl);
        raindropCollectionHtml = await data.text();
    } catch (e) {
        console.error(`Couldn't finish getting data from ${raindropUrl}`);
        throw e;
    }

    const reqData = raindropCollectionHtml.match(REGEX_GET_COLLECTIONS);

    if (!reqData.groups || !Object.keys(reqData.groups).includes("data")) {
        throw new Error("Couldn't find collections from HTML");
    }
    const raindropCollectionData = JSON.parse(reqData.groups.data.replace(/\\\\/g, "\\"))
    const relevantRaindrops = raindropCollectionData.data.raindrops.items;

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
        try {
            const faviconUrl = (await metafetch.fetch(raindrop.link, {retries: 3, render: true})).favicon;
            const faviconReq = await fetch(faviconUrl)
            if (faviconReq.status >= 400) {
                console.warn(`Couldn't find favicon for ${raindrop.link} (status: ${faviconReq.status}, favicon url: ${faviconUrl})`)
                continue
            }
            const output = "src/_assets/" + raindrop._id + extname(faviconUrl).split("?")[0];
            writeFile(output, await faviconReq.bytes(), {encoding: "utf-8"}, (err) => {
                if (err) { throw err };
                console.log(`Downloaded favicon for ${raindrop.link} to ${output}`)
            })
        } catch (e) {
            console.error("Error when fetching favicon for " + raindrop.link)
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
