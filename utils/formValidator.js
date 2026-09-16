export function validateSignupForm(form) {

    const fields =
        form.fields;


    const result = {

        name: null,

        email: null,

        phone: null,

        issues: []
    };


    // ========================================
    // NAME FIELD
    // ========================================

    const nameField =
        fields.find(field => {

            const text = `
                ${field.name || ""}
                ${field.id || ""}
                ${field.placeholder || ""}
                ${field.label || ""}
            `.toLowerCase();


            return (

                text.includes("name") ||

                text.includes("first") ||

                text.includes("full name")
            );
        });


    if (nameField) {

        result.name = {

            found: true,

            type:
                nameField.type,

            required:
                nameField.required,

            placeholder:
                nameField.placeholder,

            label:
                nameField.label
        };

    } else {

        result.name = {

            found: false
        };

        result.issues.push(
            "Name field missing"
        );
    }



    // ========================================
    // EMAIL FIELD
    // ========================================

    const emailField =
        fields.find(field => {

            const text = `
                ${field.name || ""}
                ${field.id || ""}
                ${field.placeholder || ""}
                ${field.type || ""}
                ${field.label || ""}
            `.toLowerCase();


            return (
                text.includes("email")
            );
        });


    if (emailField) {

        result.email = {

            found: true,

            type:
                emailField.type,

            required:
                emailField.required,

            placeholder:
                emailField.placeholder,

            label:
                emailField.label
        };


        /*
         Only report the email type as a review
         because email validation can also be
         implemented using JavaScript.
        */

        if (
            emailField.type !== "email" &&
            emailField.type !== "text"
        ) {

            result.issues.push(
                "Email field has unusual input type"
            );
        }

    } else {

        result.email = {

            found: false
        };

        result.issues.push(
            "Email field missing"
        );
    }



    // ========================================
    // PHONE FIELD
    // ========================================

    const phoneField =
        fields.find(field => {

            const text = `
                ${field.name || ""}
                ${field.id || ""}
                ${field.placeholder || ""}
                ${field.type || ""}
                ${field.label || ""}
            `.toLowerCase();


            return (

                text.includes("phone") ||

                text.includes("mobile") ||

                text.includes("tel") ||

                text.includes("phone no") ||

                text.includes("phone number") ||

                field.name === "pn"
            );
        });


    if (phoneField) {

        result.phone = {

            found: true,

            type:
                phoneField.type,

            required:
                phoneField.required,

            placeholder:
                phoneField.placeholder,

            label:
                phoneField.label
        };


        /*
         IMPORTANT:

         type="text" is allowed.

         We don't treat it as a defect because
         many production websites use text inputs
         for phone numbers.
        */

        if (
            phoneField.type !== "text" &&
            phoneField.type !== "tel" &&
            phoneField.type !== "number"
        ) {

            result.issues.push(
                "Phone field has unusual input type"
            );
        }

    } else {

        result.phone = {

            found: false
        };

        result.issues.push(
            "Phone field missing"
        );
    }



    // ========================================
    // FINAL VALIDATION STATUS
    // ========================================

    if (
        result.issues.length === 0
    ) {

        result.status = "PASS";

    } else {

        result.status = "REVIEW";
    }


    return result;
}