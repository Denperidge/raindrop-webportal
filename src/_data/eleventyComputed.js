function getTagsFromData(raindropArray) {
    const raindropsTags = raindropArray.map(raindrop => raindrop.tags)
    const tags = new Set();
    raindropsTags.forEach(raindropTags => {
        raindropTags.forEach(raindropTag => tags.add(raindropTag));
    });
    return Array.from(tags);
}

function returnPerCollection(data, callback) {
    const output = {};
    const allRaindrops = data.raindrops;
    const collectionNames = Object.keys(allRaindrops);
    collectionNames.forEach((collectionName) => {
        output[collectionName] = callback(data.raindrops[collectionName]);
    })
    return output;
}

export default {
    tags: (data) => {
        if (Object.keys(data.raindrops).length < 1) {
            console.error("No raindrops found")
            return;
        }

        const tags = returnPerCollection(data, function(raindrops) {
            console.log(raindrops)
            return getTagsFromData(raindrops)
        })
        console.log(tags)
    },
    raindropsByTags: (data) => {
        return;
        const tags = getTagsFromData(data);
        const raindrops = data.raindrops;
        const out = {};
        tags.forEach((tag) => {
            out[tag] = [];
            raindrops.forEach((raindrop) => {
                if (raindrop.tags.includes(tag)) {
                    out[tag].push(raindrop);
                }
            })
        })
        return out;
    }
}