import { test, expect } from "@playwright/test";

import { websites } from "../data/websites.js";

import { checkWebsite } from "../utils/websiteChecker.js";

import { checkBrokenLinks } from "../utils/linkChecker.js";

import { checkImages } from "../utils/imageChecker.js";

import { checkSignupForms } from "../utils/formChecker.js";

import { validateSignupForm } from "../utils/formValidator.js";

import {
    createFormFingerprint
} from "../utils/formFingerprint.js";

import {
    crawlWebsite
} from "../utils/crawler.js";

import {
    checkScrollPopups
} from "../utils/popupChecker.js";


test.describe(
    "Website QA Automation",
    () => {


        for (
            const website
            of websites
        ) {


            test(
                `Website QA - ${website.name}`,
                async ({ page }) => {


                    // ========================================
                    // WEBSITE HEALTH CHECK
                    // ========================================

                    console.log("");
                    console.log("");
                    console.log(
                        "########################################"
                    );

                    console.log(
                        "WEBSITE QA AUTOMATION"
                    );

                    console.log(
                        "########################################"
                    );

                    console.log(
                        "Website:",
                        website.name
                    );

                    console.log(
                        "URL:",
                        website.url
                    );


                    const healthResult =
                        await checkWebsite(
                            page,
                            website
                        );


                    console.log("");
                    console.log(
                        "========================================"
                    );

                    console.log(
                        "WEBSITE HEALTH"
                    );

                    console.log(
                        "========================================"
                    );

                    console.log(
                        "Status:",
                        healthResult.status
                    );

                    console.log(
                        "Response Time:",
                        healthResult.responseTime,
                        "ms"
                    );

                    console.log(
                        "Title:",
                        healthResult.title
                    );


                    expect(
                        healthResult.status
                    ).toBeLessThan(400);



                    // ========================================
                    // CRAWLER
                    // ========================================

                    console.log("");
                    console.log(
                        "========================================"
                    );

                    console.log(
                        "WEBSITE CRAWLER"
                    );

                    console.log(
                        "========================================"
                    );


                    const crawledPages =
                        await crawlWebsite(
                            page,
                            website.url
                        );


                    console.log("");
                    console.log(
                        "TOTAL PAGES CRAWLED:",
                        crawledPages.length
                    );


                    // ========================================
                    // PAGE LIST
                    // ========================================

                    console.log("");
                    console.log(
                        "========================================"
                    );

                    console.log(
                        "CRAWLED PAGES"
                    );

                    console.log(
                        "========================================"
                    );


                    crawledPages.forEach(
                        (crawledPage, index) => {

                            console.log("");

                            console.log(
                                `Page ${index + 1}:`
                            );

                            console.log(
                                "URL:",
                                crawledPage.url
                            );

                            console.log(
                                "Status:",
                                crawledPage.status
                            );

                            console.log(
                                "Title:",
                                crawledPage.title
                            );

                            console.log(
                                "H1:",
                                crawledPage.h1
                            );

                            console.log(
                                "Service Page:",
                                crawledPage.isServicePage
                            );
                        }
                    );



                    // ========================================
                    // SERVICE PAGES
                    // ========================================

                    const servicePages =
                        crawledPages.filter(
                            crawledPage =>
                                crawledPage.isServicePage
                        );


                    console.log("");
                    console.log(
                        "========================================"
                    );

                    console.log(
                        "SERVICE PAGES"
                    );

                    console.log(
                        "========================================"
                    );


                    console.log(
                        "Service Pages Found:",
                        servicePages.length
                    );


                    if (
                        servicePages.length === 0
                    ) {

                        console.log(
                            "No service pages detected."
                        );

                    } else {

                        servicePages.forEach(
                            (servicePage, index) => {

                                console.log("");

                                console.log(
                                    `Service Page ${index + 1}:`
                                );

                                console.log(
                                    "URL:",
                                    servicePage.url
                                );

                                console.log(
                                    "Status:",
                                    servicePage.status
                                );

                                console.log(
                                    "Title:",
                                    servicePage.title
                                );

                                console.log(
                                    "H1:",
                                    servicePage.h1
                                );
                            }
                        );
                    }



                    // ========================================
                    // FORM STORAGE
                    // ========================================

                    const allSignupForms = [];

                    const pageFormResults = [];

                    const popupResults = [];



                    // ========================================
                    // PAGE QA CHECK
                    // ========================================

                    console.log("");
                    console.log(
                        "========================================"
                    );

                    console.log(
                        "PAGE QA CHECK"
                    );

                    console.log(
                        "========================================"
                    );


                    for (
                        const crawledPage
                        of crawledPages
                    ) {


                        console.log("");
                        console.log(
                            "----------------------------------------"
                        );

                        console.log(
                            "Checking Page:"
                        );

                        console.log(
                            crawledPage.url
                        );


                        try {

                            // =================================
                            // OPEN PAGE
                            // =================================

                            await page.goto(
                                crawledPage.url,
                                {
                                    waitUntil:
                                        "domcontentloaded",

                                    timeout:
                                        30000
                                }
                            );


                            // =================================
                            // FORM CHECK
                            // =================================

                            const formResult =
                                await checkSignupForms(
                                    page
                                );


                            console.log(
                                "Total Forms:",
                                formResult.totalForms
                            );


                            console.log(
                                "Signup Forms:",
                                formResult.signupForms.length
                            );


                            // =================================
                            // SAVE PAGE FORM RESULT
                            // =================================

                            pageFormResults.push({

                                url:
                                    crawledPage.url,

                                isServicePage:
                                    crawledPage.isServicePage,

                                totalForms:
                                    formResult.totalForms,

                                signupForms:
                                    formResult.signupForms.length
                            });



                            // =================================
                            // PROCESS SIGNUP FORMS
                            // =================================

                            for (
                                const form
                                of formResult.signupForms
                            ) {


                                console.log("");

                                console.log(
                                    `Signup Form ${form.formNumber}`
                                );


                                // =================================
                                // FINGERPRINT
                                // =================================

                                const fingerprint =
                                    createFormFingerprint(
                                        form
                                    );


                                console.log(
                                    "Fingerprint:",
                                    fingerprint
                                );


                                // =================================
                                // VALIDATION
                                // =================================

                                const validation =
                                    validateSignupForm(
                                        form
                                    );


                                console.log(
                                    "Validation:",
                                    validation.status
                                );


                                if (
                                    validation.issues.length > 0
                                ) {

                                    validation.issues.forEach(
                                        issue => {

                                            console.log(
                                                "Issue:",
                                                issue
                                            );
                                        }
                                    );

                                } else {

                                    console.log(
                                        "No validation issues."
                                    );
                                }


                                // =================================
                                // FIELD DETAILS
                                // =================================

                                console.log(
                                    "Fields:",
                                    form.fields.length
                                );


                                form.fields.forEach(
                                    field => {

                                        console.log(

                                            "Field:",
                                            field.tag,

                                            "| Type:",
                                            field.type,

                                            "| Name:",
                                            field.name,

                                            "| ID:",
                                            field.id,

                                            "| Placeholder:",
                                            field.placeholder,

                                            "| Required:",
                                            field.required,

                                            "| Label:",
                                            field.label
                                        );
                                    }
                                );


                                // =================================
                                // STORE FORM
                                // =================================

                                allSignupForms.push({

                                    pageUrl:
                                        crawledPage.url,

                                    formNumber:
                                        form.formNumber,

                                    isServicePage:
                                        crawledPage.isServicePage,

                                    fingerprint:
                                        fingerprint,

                                    validation:
                                        validation
                                });


                            }



                            // =================================
                            // SCROLL POPUP CHECK
                            // =================================

                            console.log("");

                            console.log(
                                "Checking scroll-triggered popups..."
                            );


                            const pagePopupResults =
                                await checkScrollPopups(
                                    page
                                );


                            const detectedPopups =
                                pagePopupResults.filter(
                                    result =>
                                        result.popupFound
                                );


                            console.log(
                                "Popup Scroll Positions:",
                                detectedPopups.length
                            );


                            popupResults.push({

                                pageUrl:
                                    crawledPage.url,

                                isServicePage:
                                    crawledPage.isServicePage,

                                results:
                                    pagePopupResults,

                                popupCount:
                                    detectedPopups.length
                            });


                        } catch (error) {

                            console.log("");

                            console.log(
                                "PAGE QA ERROR:"
                            );

                            console.log(
                                crawledPage.url
                            );

                            console.log(
                                error.message
                            );
                        }
                    }



                    // ========================================
                    // CROSS-PAGE FORM COMPARISON
                    // ========================================

                    console.log("");
                    console.log(
                        "========================================"
                    );

                    console.log(
                        "CROSS-PAGE FORM COMPARISON"
                    );

                    console.log(
                        "========================================"
                    );


                    console.log(
                        "Total Signup Forms:",
                        allSignupForms.length
                    );


                    // ========================================
                    // GROUP FORMS BY FINGERPRINT
                    // ========================================

                    const formGroups = new Map();


                    for (
                        const form
                        of allSignupForms
                    ) {

                        if (
                            !formGroups.has(
                                form.fingerprint
                            )
                        ) {

                            formGroups.set(
                                form.fingerprint,
                                []
                            );
                        }


                        formGroups
                            .get(
                                form.fingerprint
                            )
                            .push(
                                form
                            );
                    }



                    // ========================================
                    // DISPLAY FORM GROUPS
                    // ========================================

                    let groupNumber = 1;


                    for (
                        const [
                            fingerprint,
                            forms
                        ]
                        of formGroups
                    ) {


                        console.log("");

                        console.log(
                            `FORM GROUP ${groupNumber}`
                        );


                        console.log(
                            "Fingerprint:",
                            fingerprint
                        );


                        console.log(
                            "Occurrences:",
                            forms.length
                        );


                        forms.forEach(
                            form => {

                                console.log(
                                    "Page:",
                                    form.pageUrl
                                );

                                console.log(
                                    "Form:",
                                    form.formNumber
                                );

                                console.log(
                                    "Service Page:",
                                    form.isServicePage
                                );
                            }
                        );


                        if (
                            forms.length > 1
                        ) {

                            console.log(
                                "Result: SAME FORM STRUCTURE"
                            );

                        } else {

                            console.log(
                                "Result: UNIQUE FORM"
                            );
                        }


                        groupNumber++;
                    }



                    // ========================================
                    // SERVICE PAGE FORM SUMMARY
                    // ========================================

                    const servicePageForms =
                        allSignupForms.filter(
                            form =>
                                form.isServicePage
                        );


                    console.log("");
                    console.log(
                        "========================================"
                    );

                    console.log(
                        "SERVICE PAGE FORM SUMMARY"
                    );

                    console.log(
                        "========================================"
                    );


                    console.log(
                        "Service Pages:",
                        servicePages.length
                    );


                    console.log(
                        "Signup Forms on Service Pages:",
                        servicePageForms.length
                    );


                    if (
                        servicePageForms.length > 0
                    ) {

                        servicePageForms.forEach(
                            form => {

                                console.log("");

                                console.log(
                                    "Service Page:",
                                    form.pageUrl
                                );

                                console.log(
                                    "Form:",
                                    form.formNumber
                                );

                                console.log(
                                    "Fingerprint:",
                                    form.fingerprint
                                );

                                console.log(
                                    "Validation:",
                                    form.validation.status
                                );
                            }
                        );

                    } else {

                        console.log(
                            "No signup forms found on service pages."
                        );
                    }



                    // ========================================
                    // POPUP SUMMARY
                    // ========================================

                    const pagesWithPopups =
                        popupResults.filter(
                            result =>
                                result.popupCount > 0
                        );


                    const totalPopupDetections =
                        popupResults.reduce(
                            (
                                total,
                                result
                            ) => {

                                return (
                                    total +
                                    result.popupCount
                                );
                            },
                            0
                        );


                    console.log("");
                    console.log(
                        "========================================"
                    );

                    console.log(
                        "SCROLL POPUP SUMMARY"
                    );

                    console.log(
                        "========================================"
                    );


                    console.log(
                        "Pages Checked:",
                        popupResults.length
                    );


                    console.log(
                        "Pages With Popups:",
                        pagesWithPopups.length
                    );


                    console.log(
                        "Total Popup Detections:",
                        totalPopupDetections
                    );


                    if (
                        pagesWithPopups.length > 0
                    ) {

                        pagesWithPopups.forEach(
                            result => {

                                console.log("");

                                console.log(
                                    "Page:",
                                    result.pageUrl
                                );

                                console.log(
                                    "Popup Detections:",
                                    result.popupCount
                                );


                                result.results
                                    .filter(
                                        popup =>
                                            popup.popupFound
                                    )
                                    .forEach(
                                        popup => {

                                            console.log(
                                                "Scroll Position:",
                                                popup.scrollPosition
                                            );

                                            console.log(
                                                "Popup Count:",
                                                popup.popupCount
                                            );


                                            if (
                                                popup.forms &&
                                                popup.forms.length > 0
                                            ) {

                                                console.log(
                                                    "Popup Forms:",
                                                    popup.forms.length
                                                );
                                            }
                                        }
                                    );
                            }
                        );

                    } else {

                        console.log(
                            "No scroll-triggered popups detected."
                        );
                    }



                    // ========================================
                    // FINAL SUMMARY
                    // ========================================

                    console.log("");
                    console.log(
                        "========================================"
                    );

                    console.log(
                        "FINAL WEBSITE QA SUMMARY"
                    );

                    console.log(
                        "========================================"
                    );


                    console.log(
                        "Website:",
                        website.name
                    );


                    console.log(
                        "Homepage:",
                        website.url
                    );


                    console.log(
                        "Homepage Status:",
                        healthResult.status
                    );


                    console.log(
                        "Homepage Response Time:",
                        healthResult.responseTime,
                        "ms"
                    );


                    console.log(
                        "Total Pages Crawled:",
                        crawledPages.length
                    );


                    console.log(
                        "Service Pages:",
                        servicePages.length
                    );


                    console.log(
                        "Total Signup Forms:",
                        allSignupForms.length
                    );


                    console.log(
                        "Unique Form Structures:",
                        formGroups.size
                    );


                    console.log(
                        "Signup Forms on Service Pages:",
                        servicePageForms.length
                    );


                    console.log(
                        "Pages With Scroll Popups:",
                        pagesWithPopups.length
                    );


                    console.log(
                        "Total Popup Detections:",
                        totalPopupDetections
                    );


                    console.log(
                        "========================================"
                    );


                    // ========================================
                    // BASIC ASSERTION
                    // ========================================

                    expect(
                        healthResult.status
                    ).toBeLessThan(400);

                }
            );
        }
    }
);