export async function crawlWebsite(page, startUrl) {

    const visited = new Set();
    const pagesToVisit = [];

    const crawledPages = [];

    const startUrlObject = new URL(startUrl);

    const baseDomain =
        startUrlObject.hostname
            .replace(/^www\./, "");


    // ========================================
    // GET SITEMAP URLS
    // ========================================

    const sitemapUrls =
        await getSitemapUrls(
            page,
            startUrl
        );


    console.log("");
    console.log("========================================");
    console.log("SITEMAP");
    console.log("========================================");

    console.log(
        "Sitemap URLs Found:",
        sitemapUrls.length
    );


    // ========================================
    // ADD START URL
    // ========================================

    pagesToVisit.push(startUrl);


    // ========================================
    // ADD SITEMAP URLs
    // ========================================

    for (const sitemapUrl of sitemapUrls) {

        if (
            !pagesToVisit.includes(
                sitemapUrl
            )
        ) {

            pagesToVisit.push(
                sitemapUrl
            );
        }
    }


    console.log(
        "Initial URLs to Crawl:",
        pagesToVisit.length
    );


    // ========================================
    // START CRAWLING
    // ========================================

    while (
        pagesToVisit.length > 0
    ) {

        const currentUrl =
            pagesToVisit.shift();


        if (!currentUrl) {
            continue;
        }


        // ====================================
        // URL VALIDATION
        // ====================================

        let urlObject;

        try {

            urlObject =
                new URL(currentUrl);

        } catch (error) {

            continue;
        }


        // ====================================
        // SAME DOMAIN CHECK
        // ====================================

        const currentDomain =
            urlObject.hostname
                .replace(
                    /^www\./,
                    ""
                );


        if (
            currentDomain !==
            baseDomain
        ) {

            continue;
        }


        // ====================================
        // REMOVE HASH
        // ====================================

        urlObject.hash = "";


        const cleanUrl =
            urlObject.href;


        // ====================================
        // DUPLICATE CHECK
        // ====================================

        if (
            visited.has(cleanUrl)
        ) {

            continue;
        }


        visited.add(cleanUrl);


        // ====================================
        // GET PATH
        // ====================================

        const pathname =
            urlObject.pathname
                .toLowerCase()
                .replace(
                    /\/+$/,
                    ""
                );


        // ====================================
        // SKIP BLOG
        // ====================================

        if (

            pathname === "/blog" ||

            pathname.startsWith(
                "/blog/"
            )

        ) {

            console.log(
                "SKIPPED BLOG:",
                cleanUrl
            );

            continue;
        }


        // ====================================
        // SKIP FILES
        // ====================================

        if (
            isFileUrl(pathname)
        ) {

            console.log(
                "SKIPPED FILE:",
                cleanUrl
            );

            continue;
        }


        try {

            console.log("");
            console.log(
                "========================================"
            );

            console.log(
                "CRAWLING PAGE"
            );

            console.log(
                "========================================"
            );

            console.log(
                cleanUrl
            );


            // =================================
            // OPEN PAGE
            // =================================

            const response =
                await page.goto(
                    cleanUrl,
                    {
                        waitUntil:
                            "domcontentloaded",

                        timeout:
                            30000
                    }
                );


            if (!response) {

                console.log(
                    "No response received."
                );

                continue;
            }


            const status =
                response.status();


            // =================================
            // TITLE
            // =================================

            const title =
                await page.title();


            // =================================
            // H1
            // =================================

            const h1 =
                await page
                    .locator("h1")
                    .first()
                    .textContent()
                    .catch(
                        () => ""
                    );


            const cleanH1 =
                h1
                    ? h1.trim()
                    : "";


            // =================================
            // SERVICE PAGE DETECTION
            // =================================

            const servicePage =
                isServicePage(
                    pathname,
                    title,
                    cleanH1
                );


            // =================================
            // SAVE PAGE
            // =================================

            crawledPages.push({

                url:
                    cleanUrl,

                pathname:
                    pathname,

                status:
                    status,

                title:
                    title,

                h1:
                    cleanH1,

                isServicePage:
                    servicePage
            });


            console.log(
                "Status:",
                status
            );

            console.log(
                "Title:",
                title
            );

            console.log(
                "H1:",
                cleanH1
            );

            console.log(
                "Service Page:",
                servicePage
            );


            // =================================
            // FIND LINKS
            // =================================

            const links =
                await page
                    .locator("a")
                    .evaluateAll(
                        anchors => {

                            return anchors

                                .map(
                                    anchor =>
                                        anchor.href
                                )

                                .filter(
                                    href =>
                                        href &&
                                        href.startsWith(
                                            "http"
                                        )
                                );
                        }
                    );


            // =================================
            // ADD DISCOVERED LINKS
            // =================================

            for (
                const link of links
            ) {

                try {

                    const linkObject =
                        new URL(link);


                    const linkDomain =
                        linkObject.hostname
                            .replace(
                                /^www\./,
                                ""
                            );


                    // -------------------------
                    // Same domain
                    // -------------------------

                    if (
                        linkDomain !==
                        baseDomain
                    ) {

                        continue;
                    }


                    // -------------------------
                    // Remove hash
                    // -------------------------

                    linkObject.hash =
                        "";


                    const nextUrl =
                        linkObject.href;


                    const nextPath =
                        linkObject.pathname
                            .toLowerCase()
                            .replace(
                                /\/+$/,
                                ""
                            );


                    // -------------------------
                    // Skip blog
                    // -------------------------

                    if (

                        nextPath === "/blog" ||

                        nextPath.startsWith(
                            "/blog/"
                        )

                    ) {

                        continue;
                    }


                    // -------------------------
                    // Skip files
                    // -------------------------

                    if (
                        isFileUrl(
                            nextPath
                        )
                    ) {

                        continue;
                    }


                    // -------------------------
                    // Add URL
                    // -------------------------

                    if (

                        !visited.has(
                            nextUrl
                        ) &&

                        !pagesToVisit.includes(
                            nextUrl
                        )

                    ) {

                        pagesToVisit.push(
                            nextUrl
                        );
                    }

                } catch (error) {

                    // Ignore invalid URLs
                }
            }


        } catch (error) {

            console.log("");
            console.log(
                "ERROR CRAWLING:"
            );

            console.log(
                cleanUrl
            );

            console.log(
                error.message
            );
        }
    }


    return crawledPages;
}



// ============================================
// SITEMAP
// ============================================

async function getSitemapUrls(
    page,
    startUrl
) {

    const startUrlObject =
        new URL(startUrl);


    const origin =
        startUrlObject.origin;


    const possibleSitemaps = [

        `${origin}/sitemap.xml`,

        `${origin}/sitemap_index.xml`,

        `${origin}/wp-sitemap.xml`

    ];


    const sitemapUrls = [];


    for (
        const sitemapUrl
        of possibleSitemaps
    ) {

        try {

            console.log(
                "Checking sitemap:",
                sitemapUrl
            );


            const response =
                await page.request.get(
                    sitemapUrl,
                    {
                        timeout: 10000
                    }
                );


            if (
                !response.ok()
            ) {

                continue;
            }


            const text =
                await response.text();


            if (
                !text.includes("<url")
                &&
                !text.includes("<sitemap")
            ) {

                continue;
            }


            // =================================
            // SITEMAP URL EXTRACTION
            // =================================

            const matches =
                text.match(
                    /<loc>\s*(.*?)\s*<\/loc>/gi
                );


            if (!matches) {

                continue;
            }


            for (
                const match
                of matches
            ) {

                const url =
                    match
                        .replace(
                            /<loc>\s*/i,
                            ""
                        )
                        .replace(
                            /\s*<\/loc>/i,
                            ""
                        )
                        .trim();


                if (
                    url &&
                    !sitemapUrls.includes(
                        url
                    )
                ) {

                    sitemapUrls.push(
                        url
                    );
                }
            }


            /*
             If we found a sitemap,
             stop checking the other
             sitemap locations.
            */

            if (
                sitemapUrls.length > 0
            ) {

                break;
            }

        } catch (error) {

            console.log(
                "Sitemap unavailable:",
                sitemapUrl
            );
        }
    }


    return sitemapUrls;
}



// ============================================
// SERVICE PAGE DETECTOR
// ============================================

function isServicePage(
    pathname,
    title = "",
    h1 = ""
) {

    const text = `

        ${pathname}

        ${title}

        ${h1}

    `.toLowerCase();


    const serviceKeywords = [

        "service",
        "services",

        "solution",
        "solutions",

        "what-we-do",

        "offerings",

        "expertise",

        "consulting",

        "hire",

        "writing-service",

        "assignment-help",

        "homework-help",

        "essay-help",

        "exam-help",

        "test-help",

        "course-help",

        "online-class-help",

        "dissertation-help",

        "thesis-help",

        "coursework-help",

        "take-my-",

        "do-my-",

        "write-my-",

        "help-with-",

        "help-me-",

        "online-exam",

        "exam",

        "homework",

        "assignment",

        "dissertation",

        "thesis"

    ];


    return serviceKeywords.some(
        keyword =>
            text.includes(
                keyword
            )
    );
}



// ============================================
// FILE DETECTOR
// ============================================

function isFileUrl(
    pathname
) {

    const fileExtensions = [

        ".pdf",
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".svg",
        ".ico",

        ".css",
        ".js",
        ".json",
        ".xml",

        ".zip",
        ".rar",

        ".doc",
        ".docx",

        ".xls",
        ".xlsx",

        ".ppt",
        ".pptx",

        ".mp4",
        ".mp3",
        ".avi",
        ".mov"
    ];


    return fileExtensions.some(
        extension =>
            pathname.endsWith(
                extension
            )
    );
}