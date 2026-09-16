export async function checkScrollPopups(page) {

    const results = [];

    const scrollPositions = [
        0.25,
        0.50,
        0.75,
        1.00
    ];


    console.log("");
    console.log("========================================");
    console.log("SCROLL POPUP CHECK");
    console.log("========================================");


    for (
        const position
        of scrollPositions
    ) {

        try {

            // =================================
            // GET PAGE HEIGHT
            // =================================

            const pageHeight =
                await page.evaluate(() => {

                    return Math.max(
                        document.body.scrollHeight,
                        document.documentElement.scrollHeight
                    );
                });


            // =================================
            // CALCULATE SCROLL POSITION
            // =================================

            const scrollY =
                Math.floor(
                    pageHeight * position
                );


            console.log("");

            console.log(
                `Scrolling to ${position * 100}%`
            );


            // =================================
            // SCROLL
            // =================================

            await page.evaluate(
                y => {

                    window.scrollTo({
                        top: y,
                        behavior: "instant"
                    });

                },
                scrollY
            );


            // =================================
            // WAIT FOR POPUP
            // =================================

            await page.waitForTimeout(
                1500
            );


            // =================================
            // DETECT VISIBLE POPUPS
            // =================================

            const popups =
                await page.locator(
                    `
                    [role="dialog"],
                    .modal,
                    .popup,
                    .pop-up,
                    [class*="popup"],
                    [class*="modal"],
                    [id*="popup"],
                    [id*="modal"]
                    `
                ).evaluateAll(
                    elements => {

                        return elements
                            .filter(element => {

                                const style =
                                    window.getComputedStyle(
                                        element
                                    );

                                const rect =
                                    element.getBoundingClientRect();


                                return (

                                    style.display !==
                                        "none"

                                    &&

                                    style.visibility !==
                                        "hidden"

                                    &&

                                    style.opacity !==
                                        "0"

                                    &&

                                    rect.width > 0

                                    &&

                                    rect.height > 0
                                );
                            })
                            .map(
                                element => {

                                    return {

                                        tag:
                                            element.tagName
                                                .toLowerCase(),

                                        id:
                                            element.id,

                                        className:
                                            element.className
                                                ?.toString()
                                                .substring(
                                                    0,
                                                    200
                                                ),

                                        text:
                                            element.innerText
                                                ?.trim()
                                                .substring(
                                                    0,
                                                    300
                                                )
                                    };
                                }
                            );
                    }
                );


            // =================================
            // REMOVE DUPLICATE POPUPS
            // =================================

            const uniquePopups =
                removeDuplicatePopups(
                    popups
                );


            // =================================
            // SAVE RESULT
            // =================================

            results.push({

                scrollPosition:
                    `${position * 100}%`,

                popupFound:
                    uniquePopups.length > 0,

                popupCount:
                    uniquePopups.length,

                popups:
                    uniquePopups
            });


            // =================================
            // LOG RESULT
            // =================================

            if (
                uniquePopups.length > 0
            ) {

                console.log(
                    "Popup Found:",
                    uniquePopups.length
                );


                for (
                    const popup
                    of uniquePopups
                ) {

                    console.log(
                        "Popup:",
                        popup.tag,
                        popup.id,
                        popup.className
                    );
                }

            } else {

                console.log(
                    "No popup detected."
                );
            }


            // =================================
            // CHECK POPUP FORMS
            // =================================

            if (
                uniquePopups.length > 0
            ) {

                const popupForms =
                    await checkPopupForms(
                        page
                    );


                results[
                    results.length - 1
                ].forms =
                    popupForms;
            }


        } catch (error) {

            console.log(
                "Scroll popup check error:",
                error.message
            );


            results.push({

                scrollPosition:
                    `${position * 100}%`,

                popupFound:
                    false,

                popupCount:
                    0,

                error:
                    error.message
            });
        }
    }


    // ========================================
    // RETURN TO TOP
    // ========================================

    await page.evaluate(() => {

        window.scrollTo({
            top: 0,
            behavior: "instant"
        });

    });


    return results;
}



// ============================================
// CHECK FORMS INSIDE POPUPS
// ============================================

async function checkPopupForms(page) {

    const forms =
        await page.locator(
            `
            [role="dialog"] form,
            .modal form,
            .popup form,
            .pop-up form,
            [class*="popup"] form,
            [class*="modal"] form,
            [id*="popup"] form,
            [id*="modal"] form
            `
        ).evaluateAll(
            forms => {

                return forms.map(
                    (form, index) => {

                        const fields =
                            [
                                ...form.querySelectorAll(
                                    "input, textarea, select, button"
                                )
                            ];


                        return {

                            formNumber:
                                index + 1,

                            fieldCount:
                                fields.length,

                            fields:
                                fields.map(
                                    field => {

                                        return {

                                            tag:
                                                field.tagName
                                                    .toLowerCase(),

                                            type:
                                                field.getAttribute(
                                                    "type"
                                                ),

                                            name:
                                                field.getAttribute(
                                                    "name"
                                                ),

                                            id:
                                                field.getAttribute(
                                                    "id"
                                                ),

                                            placeholder:
                                                field.getAttribute(
                                                    "placeholder"
                                                ),

                                            required:
                                                field.hasAttribute(
                                                    "required"
                                                )
                                        };
                                    }
                                )
                        };
                    }
                );
            }
        );


    return forms;
}



// ============================================
// REMOVE DUPLICATE POPUPS
// ============================================

function removeDuplicatePopups(
    popups
) {

    const seen =
        new Set();


    const unique =
        [];


    for (
        const popup
        of popups
    ) {

        const fingerprint = `

            ${popup.id || ""}

            ${popup.className || ""}

            ${popup.text || ""}

        `
            .toLowerCase()
            .replace(
                /\s+/g,
                " "
            )
            .trim();


        if (
            seen.has(
                fingerprint
            )
        ) {

            continue;
        }


        seen.add(
            fingerprint
        );


        unique.push(
            popup
        );
    }


    return unique;
}