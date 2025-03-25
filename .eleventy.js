import 'dotenv/config';
import eleventyAutoCacheBuster from "eleventy-auto-cache-buster";
import eleventyFavicons from "eleventy-favicons";
import eleventySass from "@grimlink/eleventy-plugin-sass";
import sass from "sass";
import { env } from "process"
import { readdirSync, readFileSync } from "fs";
import { basename, extname } from "path";

const ASSETS_DIR = "src/assets/";

function generateFaviconDict(dir) {
    const files = readdirSync(dir);
    const output = {};
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = extname(file);
        if ([".png", ".ico"].includes(ext.toLowerCase())) {
            output[basename(file, ext)] = file;
        }
    }
    return output;
}
const faviconDict = generateFaviconDict(ASSETS_DIR);

function getTagsFromData(raindropArray) {
    const raindropsTags = raindropArray.map(raindrop => raindrop.tags)
    const tags = new Set();
    raindropsTags.forEach(raindropTags => {
        raindropTags.forEach(raindropTag => tags.add(raindropTag));
    });
    return Array.from(tags);
    
}

function getPageCollectionData(collectionName) {
    const raindrops = JSON.parse(readFileSync(`src/_data/raindrops/${collectionName}.json`));
    const tags = getTagsFromData(raindrops);

    const raindropsByTags = {};
    tags.forEach((tag) => {
        raindropsByTags[tag] = [];
        raindrops.forEach((raindrop) => {
            if (raindrop.tags.includes(tag)) {
                raindropsByTags[tag].push(raindrop);
            }
        })
    })
    return {raindrops, tags, raindropsByTags}
}
const pages = [];
const entries = env.RAINDROP_URLS.split(",", 2);
for (let i = 0; i < entries.length; i++) {
    const [pageName, url] = entries[i].split("@", 2);
    const collectionData = await getPageCollectionData(pageName)
    collectionData.pageName = pageName.toLowerCase() == "index" ? "" : pageName
    pages.push(collectionData);
}

export const config = {
    dir: {
        input: "src",
        output: "dist"
    }
};


export default function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy(ASSETS_DIR);
    eleventyConfig.addGlobalData("assetsDir", ASSETS_DIR)
    eleventyConfig.addGlobalData("faviconDict", faviconDict)
    eleventyConfig.addGlobalData("env", env)
    eleventyConfig.addGlobalData("pages", pages);

    eleventyConfig.addPlugin(eleventyAutoCacheBuster);

    eleventyConfig.addPlugin(eleventySass, {
        sass: sass,
        outputPath: "",  // optional subdirectory
        outputStyle: "compressed"
    });
    
    /*
    eleventyConfig.addPlugin(eleventyFavicons, {
        image: "src/static/logo.svg",
        favicons: {
            background: "#8352c5",
            theme_color: "#8352c5",
        }
    });
    */

    eleventyConfig.addPassthroughCopy("src/static/")
}