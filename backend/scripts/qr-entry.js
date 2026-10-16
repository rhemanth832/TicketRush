import QRCode from 'qrcode';
window.makeQR = (canvas, text, options) => QRCode.toCanvas(canvas, text, options);
