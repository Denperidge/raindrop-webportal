# Raindrop Webportal
Create a customisable, lightweight and statically built webportal that's maintainable using your bookmarks. This is accomplished using [Eleventy](https://www.11ty.dev/) as the generator, and [Raindrop.io](https://raindrop.io/) as a bookmark-turned-CMS.

## Explanation
### Benefits over Raindrop.io's share functionality
Although Raindrop.io's bookmarking is extremely nice, their share functionality leaves two big problems that I want to work around:
- **No permalinks:** Raindrop.io's share URL format is `https://raindrop.io/{username}/{collection_name_slug}-{id}`; hardly a consistent link to point people to
- **No custom formatting:** the page's formatting is locked. You can filter on tags by clicking them, add a description on the top of the page, but there it ends. Even though it is very sleek, I like being able to customise the page more!

### Limitations
- It currently has no webhook functionality
- It also doesn't look very good

PR's for the above and anything else are more than welcome!

### Lightweight and semantic HTML
- The classics: nav, header, aria-labelledby, skip link
- Custom & simple CSS: not the best looking, but the resulting HTML is extremely light
- No cookies or analytics or any of that. Just a web navigation page for the sake of sharing and exploring links
- No JavaScript is needed, nor used for (non-filter-based) styling. Pressed tag buttons aren't styled through JavaScript, but through `[aria-pressed]` CSS rules
- The filtering functionality (see [js-only mode](#js-only-mode)) is handled through generating a CSS style. No looping over every link element in the webportal; just [simple and clean](https://www.youtube.com/watch?v=B1nDzB1P8GM) class-based styling.

### `no-js` mode
- This is the default option* (and disabled by JavaScript)
- (CSS) Hides all `js-only` elements
- Tag buttons on the top are `<a href="#">` hyperlinks to their respective nav elements
- This means that - while no-js does not have the filter capabilities - it has an identical visual/presentation to the JavaScript counterpart

\*: This has has been done before by many people smarter than me 

### `js-only` mode
If [index.js](src/_assets/index.js) gets loaded by the browser, `js-only` mode is activated
- (CSS) Hides all `no-js` elements
- The tag buttons are now `<label role="button">` elements. Pressing a label...
    - ... checks/unchecks its respective hidden `<input type="checkbox" id="tag-tagName">`
    - (JS) The input onchange event triggers a JS function that sets the contents of a `<style>` element, handling the temporary changes using CSS:
        - (CSS) Nav blocks from non-selected tags are hidden
        - (CSS) Links within shown nav blocks that do not have all selected tags have their opacity
        - (JS) Sets `aria-pressed` for all labels with the same tag based on the
            - (CSS) The base stylesheet styles the `[aria-pressed=true]` buttons differently. This way visual feedback and accessibility data is directly linked!
        - (JS) Side note: to replicate `<a>` keyboard-navigation behaviour on the filter tag buttons, pressing `Enter` with them selected triggers a `click`. This is not a problem in no-js mode, as `<a href="">` is used there


### Loading data from [.eleventy.js](.eleventy.js) instead of using Eleventy's data directory
This is mostly due to the tags requiring a build-time computation (finding out what tags there are, sorting raindrops per tag, etc.).

While this can be done using Eleventy's computed data, it (sadly) does *not* play nice with that computed data being used for front-matter pagination data. Manual data reading it is! 

## How-to
### Getting started
This requires [Node.js](https://nodejs.org/) and [git](https://git-scm.com/) to be installed.
```bash
git clone https://github.com/Denperidge/raindrop-webportal.git
cd raindrop-webportal
npm install
```
At this point, copy/rename the [.env.example](.env.example) to `.env` and modify its values to your liking.
> Note: You probably want to have one entry in `RAINDROP_URLS` to have the name `index` (e.g. `index@https://raindrop.io/username/collection-32639013`). Index will be the landing page.
```bash
npm start  # dev server on localhost:8080
npm run data  # pull collection data from Raindrop.io
npm run build  # Build static site to dist/
```
And that's it!

## License
This project is licensed under the [MIT License](LICENSE).