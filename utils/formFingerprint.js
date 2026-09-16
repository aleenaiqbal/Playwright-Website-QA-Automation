export function createFormFingerprint(form) {

    const fingerprint = form.fields
        .map(field => {

            return [
                field.tag || "",
                field.type || "",
                field.name || "",
                field.required ? "required" : "optional"
            ].join("|");

        })
        .join("||");

    return fingerprint;
}


export function compareForms(form1, form2) {

    const fingerprint1 = createFormFingerprint(form1);
    const fingerprint2 = createFormFingerprint(form2);

    return fingerprint1 === fingerprint2;
}