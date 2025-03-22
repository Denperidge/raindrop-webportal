# Raindrop Webportal
Create a customisable, lightweight and statically built webportal that's maintainable using your bookmarks. This is accomplished using [Eleventy](https://www.11ty.dev/) as the generator, and [Raindrop.io](https://raindrop.io/) as a bookmark-turned-CMS.

## Explanation
### Benefits over Raindrop.io's share functionality
Although Raindrop.io's bookmarking is extremely nice, their share functionality leaves two big problems that I want to work around:
- **No permalinks:** Raindrop.io's share URL format is `https://raindrop.io/{username}/{collection_name_slug}-{id}`; hardly a consistent link to point people to
- **No custom formatting:** the page's formatting is locked. You can filter on tags by clicking them, and add a description, but there it ends. Even though it is very sleek, I'd like to be able to make a more functional/organised collection.

### Limitations
- It currently has no webhook functionality
- It also doesn't look very good

PR's for the above and anything else are more than welcome.

### Lightweight and semantic HTML
- The classics: nav, header, aria-labelledby, skip link
- Custom & simple CSS: not the best looking, but no unecessary HTML elements are created
- No cookies or analytics or any of that. Just a web navigation page for the sake of sharing and exploring links
- No JavaScript is needed, nor used for (non-filter-based) styling. Pressed tag buttons aren't directly styled, but are styled through `[aria-pressed]` CSS rules
- The filtering functionality (see [js-only mode](#js-only-mode)) is handled through generating a CSS style. No looping over every link element in the webportal; just [simple and clean](https://www.youtube.com/watch?v=B1nDzB1P8GM) class-based styling.

### `no-js` mode
- This is the default option (and disabled by JavaScript)*
- Hides all `js-only` elements using CSS
- Tag buttons on the top are `<a href="#">` hyperlinks to their respective nav elements
- This means that - while no-js does not have the filter capabilities - it has an identical visual/presentation to the JavaScript counterpart
\*: This has has been done before by many people smarter than me 

### `js-only` mode
If [index.js](src/assets/index.js) gets loaded by the browser, `js-only` mode is activated
- Hides all `no-js` elements
- The tag buttons are now `<label role="button">` elements. Pressing a label...
    - ... checks/unchecks its respective hidden `<input type="checkbox" id="tag-tagName">`
    - Side note: to replicate `<a>` keyboard-navigation behaviour, `Enter` works as a toggle
    - The input onchange event triggers a JS function that sets the contents of a `<style>` element, handling the temporary changes using CSS:
        - Nav blocks from non-selected tags are hidden
        - Links within shown nav blocks that do not have all selected tags have their opacity lowered
        - Sets `aria-pressed` for all labels with the same tag based on the
        - The base stylesheet styles the `[aria-pressed=true]` buttons differently. This way visual feedback and screen-reader stuff is directly linked!

## How-to
### Getting started
This requires [Node.js](https://nodejs.org/) and [git](https://git-scm.com/) to be installed.
```bash
git clone https://github.com/Denperidge/raindrop-webportal.git
cd raindrop-webportal
npm install
```
At this point, copy/rename the [.env.example](.env.example) to `.env` and modify its values to your liking
```bash
npm start  # dev server on localhost:8080
npm run data  # pull collection data from Raindrop.io
npm run build  # Build static site to dist/
```
And that's it!

## License
This project is licensed under the [MIT License](LICENSE).