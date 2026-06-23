const cloudinary = require('cloudinary').v2;
const path = require('path');

cloudinary.config({
  cloud_name: 'dgdzewqko',
  api_key: '577947731953396',
  api_secret: 'JAG8kW_X41mva5LzEBV06xkwxR4',
});

const mp3Path = path.join(__dirname, 'downloads', 'night_changes.mp3');

console.log("Uploading:", mp3Path);

cloudinary.uploader.upload(
  mp3Path,
  { resource_type: 'video', public_id: 'music/night_changes', format: 'mp3' },
  (err, result) => {
    if (err) {
      console.error("Upload error:", err);
    } else {
      console.log("Upload success!");
      console.log("URL:", result.secure_url);
    }
  }
);
