/**
 * Extracts the average color from an image URL using a hidden canvas.
 * @param {string} imageUrl 
 * @returns {Promise<string>} Hex color string
 */
export const extractPrimaryColor = (imageUrl) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imageUrl;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 10;
            canvas.height = 10;

            ctx.drawImage(img, 0, 0, 10, 10);
            const data = ctx.getImageData(0, 0, 10, 10).data;

            let r = 0, g = 0, b = 0;
            for (let i = 0; i < data.length; i += 4) {
                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
            }

            const count = data.length / 4;
            r = Math.floor(r / count);
            g = Math.floor(g / count);
            b = Math.floor(b / count);

            resolve(`rgb(${r}, ${g}, ${b})`);
        };

        img.onerror = () => {
            resolve('rgb(6, 182, 212)'); // Fallback to cyan-500
        };
    });
};
