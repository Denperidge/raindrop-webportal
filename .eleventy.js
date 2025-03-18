import 'dotenv/config';
import eleventyAutoCacheBuster from "eleventy-auto-cache-buster";
import eleventyFavicons from "eleventy-favicons";
import eleventySass from "@grimlink/eleventy-plugin-sass";
import sass from "sass";
import { env } from "process"

export const config = {
    dir: {
        input: "src",
        output: "dist"
    }
};


export default function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("src/assets/")

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