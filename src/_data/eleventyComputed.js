function getTagsFromData(data) {
    const raindropsTags = data.raindrops.map(raindrop => raindrop.tags)
    const tags = new Set();
    raindropsTags.forEach(raindropTags => {
        raindropTags.forEach(raindropTag => tags.add(raindropTag));
    });
    return Array.from(tags);
    
}

export default {
    tags: getTagsFromData,
    raindropsByTags: (data) => {
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