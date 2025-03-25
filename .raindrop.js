import 'dotenv/config';
import downloadFavicon, { downloadFaviconFromWebpage } from "favicon-grabber";
import { env, exit } from "process"
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

    writeFile(
        DATA_DIR + filename + ".json",
        JSON.stringify(relevantRaindrops),
        { encoding: "utf-8" },
        (e) => {
            if (e) { throw e; }
            else { console.log("Done! Wrote to " + DATA_DIR); }
        }
    );

    return relevantRaindrops;
}

function getRaindropFavicons(raindropArray) {
    raindropArray.forEach(async raindrop => {
        let downloadFunc = downloadFavicon;
        if (raindrop.link.includes("transreads", "https://transreads.org/")) {
            downloadFunc = downloadFaviconFromWebpage        
        }
        try {
            const output = await downloadFunc(raindrop.link, `src/_assets/${raindrop._id}%extname%`)
            console.log(`Downloaded favicon for ${raindrop.link} to ${output}`)
        } catch (e) {
            console.log(e)
        }
    });
}

const entries = env.RAINDROP_URLS.split(",");
for (let i = 0; i < entries.length; i++) {
    const [ pageName, url ] = entries[i].split("@", 2)

    const collectionData = await getRaindropCollectionData(url, pageName);
    try {
        await getRaindropFavicons(collectionData)
    } catch (e) {
        console.log(e)
    }
}

if (env.CI != undefined && env.CI != "false" && env.CI != "0") {
    // Errors are normal in this script, but CI shouldn't fail because of that
    exit(0);
}
