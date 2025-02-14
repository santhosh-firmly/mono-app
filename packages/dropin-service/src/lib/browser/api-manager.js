//#region Paypal
export async function paypalStart() {
    const res = await window.firmly.paypalStart();

    return res.status == 200 ? res.data : null;
}

export async function paypalApprove(attributes) {
    const res = await window.firmly.paypalAuthorize(attributes);

    return res.status == 200 ? res.data : null;
}
