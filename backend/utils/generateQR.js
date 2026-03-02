import QRCode from 'qrcode';

export const generateQRCode = async (data) => {
    try {
        const jsonString = JSON.stringify(data);
        const qrCodeBase64 = await QRCode.toDataURL(jsonString);
        return qrCodeBase64;
    } catch (err) {
        console.error('Error generating QR code', err);
        throw err;
    }
};
