import 'dotenv/config';
import eleventyAutoCacheBuster from "eleventy-auto-cache-buster";
import eleventyFavicons from "eleventy-favicons";
import eleventySass from "@grimlink/eleventy-plugin-sass";
import sass from "sass";
import { env } from "process"
import { readdirSync } from "fs";
import { join, basename, extname } from "path";

const ASSETS_DIR = "src/assets/";

const files = readdirSync(ASSETS_DIR);
const faviconDict = {};
for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = extname(file);
    if ([".png", ".ico"].includes(ext.toLowerCase())) {
        faviconDict[basename(file, ext)] = file;
    }
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