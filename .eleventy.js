//import {} from 'dotenv/config.js';
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

try {
    const data = await fetch (env.RAINDROP_URL);
    //(?<=vite-plugin-ssr_pageContext.*?>).*?<\/script>
    console.log(data.text())
} catch {
    throw new Error(`Couldn't get data from ${env.RAINDROP_URL}`);
}


export default function (eleventyConfig) {
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