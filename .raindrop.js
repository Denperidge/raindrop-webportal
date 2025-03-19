import 'dotenv/config';
import { env } from "process"
import {join} from "path";
import { writeFile, createWriteStream } from "fs";
import { Readable } from "stream";
import { finished } from "stream/promises";

const OUTPUT_FILEPATH = "src/_data/raindrops.json";

const REGEX_GET_COLLECTIONS = RegExp(/(?<=vite-plugin-ssr_pageContext.*?>).*?(?=<\/script>)/)
const REGEX_GET_ICO = RegExp(/(?<=href=").*?\.ico/);

function getBaseUrl(url) {
    return url.substring(0, url.indexOf("/"));
}

async function downloadFavicon(url, outputFilename, tried={baseDomain:false, fromHtml:false}) {
    const fullOutputFilename = "src/assets/" + outputFilename + ".ico";
    return new Promise(async (resolve, reject) => {
        let error;
        try {
            const requestUrl = url.endsWith(".ico") ?
                url : join(url, "favicon.ico")
            console.log("Requesting favicon from " + requestUrl)
            const data = await fetch(requestUrl);
            // Thanks to antonok on https://stackoverflow.com/a/74722818
            const body = data.body;
            if (data.status < 400) {
                const stream = createWriteStream(fullOutputFilename);
                await finished(Readable.fromWeb(body).pipe(stream))
                resolve(fullOutputFilename);
            }
        } catch (e) {
            error = e;
        }
        if (!tried.fromHtml) {
            tried.fromHtml = true;
            const requestUrl = url.endsWith(".ico") ?
                url.substring(0, url.lastIndexOf("/") + 1) :
                url;
            console.log("Determining favicon from " + requestUrl)
            const data = await fetch(requestUrl);
            contents = await data.text();
            console.log(contents)
            console.log("***")
            try {
                const icoPath = contents.match(REGEX_GET_ICO)[0];
                let newUrl;
                if (icoPath.startsWith("/")) {
                    newUrl = join(getBaseUrl(url), icoPath);
                } else {
                    newUrl = join(url, icoPath);
                }
                downloadFavicon(newUrl, outputFilename, tried).then(resolve);
            } catch (e) {
                console.log("Error during determining faivcon from HTML")
                console.log(`status code: ${data.status}, url: ${url}, outputFilename: ${outputFilename}, tried: ${JSON.stringify(tried)}`);
                throw e;
            }
            
        } else if (!tried.baseDomain) {
            tried.baseDomain = true;
            downloadFavicon(getBaseUrl(url), outputFilename, tried).then(resolve);
        } else if (error) {
            console.log(`Error whilst downloading favicon. URL: ${url}, outputFilename: ${outputFilename}, tried: ${JSON.stringify(tried)}`)
            throw error;
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
    downloadFavicon(raindrop.link, raindrop._id).then(output => {
        console.log(`Downloaded favicon for ${raindrop.link} to ${output}`)
    }).catch(err => { throw err; });
});