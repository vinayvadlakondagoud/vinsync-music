const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const YTDLP = path.join(process.env.TEMP, 'yt-dlp.exe');
const FFMPEG_DIR = path.join(process.env.TEMP, 'ffmpeg2', 'ffmpeg-master-latest-win64-gpl', 'bin');
const FFMPEG_PATH = path.join(FFMPEG_DIR, 'ffmpeg.exe');
const OUTPUT_DIR = path.join(__dirname, 'downloads');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const name = "Night Changes";
const query = "One Direction Night Changes";

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

const slug = slugify(name);
const outputTemplate = path.join(OUTPUT_DIR, `${slug}.%(ext)s`);
const mp3Path = path.join(OUTPUT_DIR, `${slug}.mp3`);

console.log("Downloading:", name);
console.log("yt-dlp:", YTDLP);
console.log("Output:", outputTemplate);

try {
  execSync(
    `"${YTDLP}" --ffmpeg-location "${FFMPEG_DIR}" -f bestaudio --extract-audio --audio-format mp3 --audio-quality 192k -o "${outputTemplate}" "ytsearch:${query}"`,
    { timeout: 120000, shell: 'cmd.exe', stdio: 'inherit' }
  );
  if (fs.existsSync(mp3Path)) {
    console.log("SUCCESS:", mp3Path, `(${(fs.statSync(mp3Path).size / 1024 / 1024).toFixed(1)} MB)`);
  } else {
    console.log("Files in output:", fs.readdirSync(OUTPUT_DIR));
  }
} catch (err) {
  console.error("FAIL:", err.message);
  console.log("Files in output:", fs.readdirSync(OUTPUT_DIR));
}
