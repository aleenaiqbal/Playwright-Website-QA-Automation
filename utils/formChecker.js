export async function checkSignupForms(page) {

    const forms = await page.locator("form").evaluateAll(forms => {

        return forms.map((form, index) => {

            const inputs = [
                ...form.querySelectorAll(
                    "input, textarea, select, button"
                )
            ];

            return {
                formNumber: index + 1,

                action: form.getAttribute("action"),

                method: form.getAttribute("method"),

                fields: inputs.map(input => {

                    const id =
                        input.getAttribute("id");

                    const name =
                        input.getAttribute("name");

                    const placeholder =
                        input.getAttribute("placeholder");

                    const type =
                        input.getAttribute("type");

                    let label = null;


                    // --------------------------------
                    // 1. Label using "for"
                    // --------------------------------

                    if (id) {

                        const labelElement =
                            form.querySelector(
                                `label[for="${CSS.escape(id)}"]`
                            );

                        if (labelElement) {

                            label =
                                labelElement.innerText
                                    .trim();
                        }
                    }


                    // --------------------------------
                    // 2. Label wrapping the input
                    // --------------------------------

                    if (!label) {

                        const parentLabel =
                            input.closest("label");

                        if (parentLabel) {

                            label =
                                parentLabel.innerText
                                    .trim();
                        }
                    }


                    // --------------------------------
                    // 3. aria-label
                    // --------------------------------

                    if (!label) {

                        label =
                            input.getAttribute(
                                "aria-label"
                            );
                    }


                    // --------------------------------
                    // 4. aria-labelledby
                    // --------------------------------

                    if (!label) {

                        const labelledBy =
                            input.getAttribute(
                                "aria-labelledby"
                            );

                        if (labelledBy) {

                            const labelElement =
                                form.querySelector(
                                    `#${CSS.escape(labelledBy)}`
                                );

                            if (labelElement) {

                                label =
                                    labelElement.innerText
                                        .trim();
                            }
                        }
                    }


                    // --------------------------------
                    // 5. Placeholder fallback
                    // --------------------------------

                    if (!label && placeholder) {

                        label = placeholder;
                    }


                    return {

                        tag:
                            input.tagName
                                .toLowerCase(),

                        type:
                            type,

                        name:
                            name,

                        id:
                            id,

                        placeholder:
                            placeholder,

                        required:
                            input.hasAttribute(
                                "required"
                            ),

                        label:
                            label || null
                    };
                })
            };
        });
    });


    // --------------------------------
    // Find Signup Forms
    // --------------------------------

    const signupForms = [];


    for (const form of forms) {

        const fieldText =
            JSON.stringify(
                form.fields
            ).toLowerCase();


        const hasEmail =
            fieldText.includes("email");


        const hasName =
            fieldText.includes("name") ||
            fieldText.includes("first name");


        const hasPhone =
            fieldText.includes("phone") ||
            fieldText.includes("mobile") ||
            fieldText.includes("tel") ||
            fieldText.includes("phone no") ||
            fieldText.includes('"pn"');


        /*
         A signup/contact lead form normally
         contains email + name/phone.
        */

        if (
            hasEmail &&
            (hasName || hasPhone)
        ) {

            signupForms.push(form);
        }
    }


    return {

        totalForms:
            forms.length,

        signupForms:
            signupForms
    };
}