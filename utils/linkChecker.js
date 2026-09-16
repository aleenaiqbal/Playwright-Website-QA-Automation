export async function checkBrokenLinks(page) {

    const links = await page.locator("a").evaluateAll(anchors => {

        return anchors
            .map(anchor => anchor.href)
            .filter(href => href.startsWith("http"));

    });

    const uniqueLinks = [...new Set(links)];

    const brokenLinks = [];
    const workingLinks = [];

    for (const link of uniqueLinks) {

        try {

            const response = await page.request.get(link, {
                timeout: 10000
            });

            const status = response.status();

            if (status >= 400) {

                brokenLinks.push({
                    url: link,
                    status: status
                });

            } else {

                workingLinks.push({
                    url: link,
                    status: status
                });

            }

        } catch (error) {

            brokenLinks.push({
                url: link,
                status: "ERROR"
            });

        }

    }

    return {
        totalLinks: uniqueLinks.length,
        workingLinks: workingLinks,
        brokenLinks: brokenLinks
    };
}