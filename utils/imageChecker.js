export async function checkImages(page) {

    const images = await page.locator("img").evaluateAll(images => {

        return images.map((img, index) => ({
            index: index + 1,
            src: img.src,
            alt: img.getAttribute("alt")
        }));

    });

    const brokenImages = [];
    const missingAlt = [];
    const workingImages = [];

    for (const image of images) {

        // Check alt attribute
        if (image.alt === null || image.alt.trim() === "") {

            missingAlt.push({
                index: image.index,
                src: image.src
            });

        }

        // Check image loading
        const imageLocator = page.locator("img").nth(image.index - 1);

        const isLoaded = await imageLocator.evaluate(img => {
            return img.complete && img.naturalWidth > 0;
        });

        if (isLoaded) {

            workingImages.push({
                index: image.index,
                src: image.src
            });

        } else {

            brokenImages.push({
                index: image.index,
                src: image.src
            });

        }

    }

    return {
        totalImages: images.length,
        workingImages,
        brokenImages,
        missingAlt
    };
}