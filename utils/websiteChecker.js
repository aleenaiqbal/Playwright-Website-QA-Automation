export async function checkWebsite(page, website) {

    const startTime = Date.now();

    const response = await page.goto(website.url, {
        waitUntil: "domcontentloaded"
    });

    const endTime = Date.now();

    const responseTime = endTime - startTime;

    const title = await page.title();

    return {
        name: website.name,
        url: website.url,
        status: response.status(),
        responseTime: responseTime,
        title: title
    };
}