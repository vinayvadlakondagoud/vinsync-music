const { execSync } = require('child_process');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: 'dgdzewqko',
  api_key: '577947731953396',
  api_secret: 'JAG8kW_X41mva5LzEBV06xkwxR4',
});

const YTDLP = path.join(process.env.TEMP, 'yt-dlp.exe');
const FFMPEG_DIR = path.join(process.env.TEMP, 'ffmpeg2', 'ffmpeg-master-latest-win64-gpl', 'bin');

const songs = [
  // === Existing 16 songs (to re-upload to new account) ===
  { id: 1,  name: "Blinding Lights", artist: "The Weeknd",              query: "The Weeknd Blinding Lights", industry: "hollywood", mood: "energetic" },
  { id: 2,  name: "Shape of You", artist: "Ed Sheeran",                 query: "Ed Sheeran Shape of You", industry: "hollywood", mood: "romantic" },
  { id: 3,  name: "Watermelon Sugar", artist: "Harry Styles",           query: "Harry Styles Watermelon Sugar", industry: "hollywood", mood: "chill" },
  { id: 4,  name: "Levitating", artist: "Dua Lipa",                     query: "Dua Lipa Levitating", industry: "hollywood", mood: "energetic" },
  { id: 5,  name: "Good For You", artist: "Selena Gomez",              query: "Selena Gomez Good For You", industry: "hollywood", mood: "romantic" },
  { id: 6,  name: "As It Was", artist: "Harry Styles",                  query: "Harry Styles As It Was", industry: "hollywood", mood: "chill" },
  { id: 7,  name: "Heat Waves", artist: "Glass Animals",               query: "Glass Animals Heat Waves", industry: "hollywood", mood: "chill" },
  { id: 8,  name: "Lost In The Fire", artist: "The Weeknd",             query: "The Weeknd Lost In The Fire Gesaffelstein", industry: "hollywood", mood: "dark" },
  { id: 9,  name: "After Hours", artist: "The Weeknd",                  query: "The Weeknd After Hours", industry: "hollywood", mood: "dark" },
  { id: 10, name: "Timeless", artist: "The Weeknd",                     query: "The Weeknd Timeless Playboi Carti", industry: "hollywood", mood: "dark" },
  { id: 11, name: "Closer", artist: "The Chainsmokers",                 query: "The Chainsmokers Closer Halsey", industry: "hollywood", mood: "romantic" },
  { id: 12, name: "Ijazat", artist: "Falak Shabir",                     query: "Falak Shabir Ijazat", industry: "bollywood", mood: "romantic" },
  { id: 13, name: "Superman", artist: "Yo Yo Honey Singh",              query: "Yo Yo Honey Singh Superman", industry: "bollywood", mood: "energetic" },
  { id: 14, name: "Call Aundi", artist: "Yo Yo Honey Singh",            query: "Yo Yo Honey Singh Call Aundi", industry: "bollywood", mood: "energetic" },
  { id: 15, name: "Desi Kalakaar", artist: "Yo Yo Honey Singh",         query: "Yo Yo Honey Singh Desi Kalakaar", industry: "bollywood", mood: "energetic" },
  { id: 16, name: "Mitti Di Khushboo", artist: "Ayushmann Khurrana",    query: "Ayushmann Khurrana Mitti Di Khushboo", industry: "bollywood", mood: "chill" },
  // === Allu Arjun Telugu ===
  { id: 17, name: "Srivalli", artist: "Sid Sriram",                     query: "Srivalli Pushpa", industry: "tollywood", mood: "romantic" },
  { id: 18, name: "Oo Antava Oo Oo Antava", artist: "Indravathi",       query: "Oo Antava Pushpa", industry: "tollywood", mood: "energetic" },
  { id: 19, name: "Butta Bomma", artist: "Armaan Malik",                query: "Butta Bomma Ala Vaikunthapurramuloo", industry: "tollywood", mood: "romantic" },
  { id: 20, name: "Samajavaragamana", artist: "Sid Sriram",             query: "Samajavaragamana Ala Vaikunthapurramuloo", industry: "tollywood", mood: "romantic" },
  { id: 21, name: "Ramuloo Ramulaa", artist: "Anurag Kulkarni",         query: "Ramuloo Ramulaa Ala Vaikunthapurramuloo", industry: "tollywood", mood: "energetic" },
  { id: 22, name: "Naatu Naatu", artist: "Rahul Sipligunj",             query: "Naatu Naatu RRR full song", industry: "tollywood", mood: "energetic" },
  { id: 23, name: "Top Levedi", artist: "Geetha Madhuri",               query: "Top Levedi Sarrainodu", industry: "tollywood", mood: "energetic" },
  // === Bollywood ===
  { id: 24, name: "Kesariya", artist: "Arijit Singh",                   query: "Kesariya Arijit Singh Brahmastra", industry: "bollywood", mood: "romantic" },
  { id: 25, name: "Apna Bana Le", artist: "Arijit Singh",               query: "Apna Bana Le Arijit Singh Bhediya", industry: "bollywood", mood: "romantic" },
  { id: 26, name: "Tum Kya Mile", artist: "Arijit Singh",               query: "Tum Kya Mile Rocky Aur Rani", industry: "bollywood", mood: "romantic" },
  { id: 27, name: "Chaleya", artist: "Arijit Singh",                    query: "Chaleya Jawan Arijit Singh", industry: "bollywood", mood: "chill" },
  { id: 28, name: "Heeriye", artist: "Jasleen Royal",                   query: "Heeriye Jasleen Royal Arijit Singh", industry: "bollywood", mood: "romantic" },
  { id: 29, name: "Saari Duniya Jalaa Denge", artist: "B Praak",        query: "Saari Duniya Jalaa Denge Animal", industry: "bollywood", mood: "dark" },
  { id: 30, name: "Pehle Bhi Main", artist: "Vishal Mishra",            query: "Pehle Bhi Main Vishal Mishra Animal", industry: "bollywood", mood: "sad" },
  { id: 31, name: "Arjan Vailly", artist: "Bhupinder Babbal",           query: "Arjan Vailly Animal Bhupinder Babbal", industry: "bollywood", mood: "energetic" },
  { id: 32, name: "Jhoome Jo Pathaan", artist: "Arijit Singh",          query: "Jhoome Jo Pathaan Pathaan Arijit Singh", industry: "bollywood", mood: "energetic" },
  // === Hollywood ===
  { id: 33, name: "Anti-Hero", artist: "Taylor Swift",                  query: "Taylor Swift Anti-Hero", industry: "hollywood", mood: "chill" },
  { id: 34, name: "Flowers", artist: "Miley Cyrus",                     query: "Miley Cyrus Flowers", industry: "hollywood", mood: "chill" },
  { id: 35, name: "Cruel Summer", artist: "Taylor Swift",               query: "Taylor Swift Cruel Summer", industry: "hollywood", mood: "energetic" },
  { id: 36, name: "Vampire", artist: "Olivia Rodrigo",                  query: "Olivia Rodrigo Vampire", industry: "hollywood", mood: "dark" },
  { id: 37, name: "What Was I Made For", artist: "Billie Eilish",       query: "Billie Eilish What Was I Made For Barbie", industry: "hollywood", mood: "sad" },
  { id: 38, name: "Dance The Night", artist: "Dua Lipa",                query: "Dua Lipa Dance The Night Barbie", industry: "hollywood", mood: "energetic" },
  { id: 39, name: "Kill Bill", artist: "SZA",                           query: "SZA Kill Bill", industry: "hollywood", mood: "dark" },
  { id: 40, name: "Espresso", artist: "Sabrina Carpenter",              query: "Sabrina Carpenter Espresso", industry: "hollywood", mood: "chill" },
  { id: 41, name: "Too Sweet", artist: "Hozier",                        query: "Hozier Too Sweet", industry: "hollywood", mood: "chill" },
  // === User's additional songs ===
  { id: 42, name: "Night Changes", artist: "One Direction",             query: "One Direction Night Changes", industry: "hollywood", mood: "chill" },
  { id: 43, name: "We Don't Talk Anymore", artist: "Charlie Puth",      query: "Charlie Puth We Dont Talk Anymore Selena Gomez", industry: "hollywood", mood: "sad" },
  { id: 44, name: "Channa Mereya", artist: "Arijit Singh",              query: "Channa Mereya Arijit Singh", industry: "bollywood", mood: "sad" },
  { id: 45, name: "Arz Kiya Hai", artist: "Kailash Kher",               query: "Arz Kiya Hai Kailash Kher", industry: "bollywood", mood: "romantic" },
  { id: 46, name: "Ganga Ke Kinare", artist: "Suresh Wadkar",           query: "Ganga Ke Kinare Suresh Wadkar", industry: "bollywood", mood: "chill" },
  { id: 47, name: "Kun Faya Kun", artist: "A.R. Rahman",                query: "Kun Faya Kun AR Rahman Rockstar", industry: "bollywood", mood: "chill" },
  { id: 48, name: "Har Har Gange", artist: "Kavita Krishnamurthy",      query: "Har Har Gange Kavita Krishnamurthy", industry: "bollywood", mood: "romantic" },
  { id: 49, name: "Shiv Kailash", artist: "Sonu Nigam",                 query: "Shiv Kailash Sonu Nigam", industry: "bollywood", mood: "romantic" },
  { id: 50, name: "Sarkaru Raa", artist: "Anurag Kulkarni",             query: "Sarkaru Raa Anurag Kulkarni", industry: "tollywood", mood: "energetic" },
  { id: 51, name: "Pardesiya", artist: "Shreya Ghoshal",                query: "Pardesiya Yeh Jawaani Hai Deewani", industry: "bollywood", mood: "chill" },
  { id: 52, name: "Ragile Ragile", artist: "Sid Sriram",                query: "Ragile Ragile Sid Sriram", industry: "tollywood", mood: "energetic" },
  { id: 53, name: "Vaari Jaavan", artist: "Shreya Ghoshal",             query: "Vaari Jaavan Shreya Ghoshal", industry: "tollywood", mood: "romantic" },
  { id: 54, name: "Massa Massa", artist: "Udit Narayan",                query: "Massa Massa Udit Narayan", industry: "bollywood", mood: "energetic" },
  { id: 55, name: "Kochu Kunjintachanoru Remix", artist: "M. G. Sreekumar", query: "Kochu Kunjintachanoru Remix", industry: "mollywood", mood: "energetic" },
  { id: 56, name: "Thooki", artist: "Sid Sriram",                       query: "Thooki Sid Sriram", industry: "tollywood", mood: "energetic" },
  { id: 57, name: "Sunflower", artist: "Post Malone",                   query: "Post Malone Sunflower Swae Lee", industry: "hollywood", mood: "chill" },
  { id: 58, name: "Señorita", artist: "Shawn Mendes",                   query: "Shawn Mendes Senorita Camila Cabello", industry: "hollywood", mood: "romantic" },
  { id: 59, name: "Pardesi Pardesi Jana Nahi", artist: "Udit Narayan",  query: "Pardesi Pardesi Jana Nahi Udit Narayan", industry: "bollywood", mood: "sad" },
  { id: 60, name: "Shah Ka Rutba", artist: "Amit Trivedi",              query: "Shah Ka Rutba Amit Trivedi", industry: "bollywood", mood: "energetic" },
  { id: 61, name: "Sittharala Sirapadu", artist: "Sid Sriram",          query: "Sittharala Sirapadu Sid Sriram", industry: "tollywood", mood: "romantic" },
  { id: 62, name: "O Humdum Suniyo Re", artist: "Kunal Ganjawala",      query: "O Humdum Suniyo Re Kunal Ganjawala", industry: "bollywood", mood: "romantic" },
  { id: 63, name: "O Sanam", artist: "KK",                              query: "O Sanam KK Lucky Ali", industry: "bollywood", mood: "romantic" },
  { id: 64, name: "Saathiya", artist: "Sonu Nigam",                     query: "Saathiya Sonu Nigam", industry: "bollywood", mood: "romantic" },
  { id: 65, name: "Dildara", artist: "Sonu Nigam",                      query: "Dildara Sonu Nigam", industry: "bollywood", mood: "romantic" },
  { id: 66, name: "Ilahi", artist: "A.R. Rahman",                       query: "Ilahi Yeh Jawaani Hai Deewani", industry: "bollywood", mood: "energetic" },
  { id: 67, name: "Senorita", artist: "Farhan Akhtar",                  query: "Senorita Farhan Akhtar Zindagi Na Milegi Dobara", industry: "bollywood", mood: "chill" },
  { id: 68, name: "I Love You", artist: "Sonu Nigam",                   query: "I Love You Sonu Nigam", industry: "bollywood", mood: "romantic" },
  { id: 69, name: "Challa", artist: "Rabbi Shergill",                   query: "Challa Rabbi Shergill Jab Tak Hai Jaan", industry: "bollywood", mood: "energetic" },
  { id: 70, name: "Manali Trance", artist: "Yo Yo Honey Singh",         query: "Manali Trance Yo Yo Honey Singh", industry: "bollywood", mood: "energetic" },
  { id: 71, name: "Saiyaara", artist: "Mohit Chauhan",                  query: "Saiyaara Mohit Chauhan Ek Tha Tiger", industry: "bollywood", mood: "romantic" },
  { id: 72, name: "Tum Ho", artist: "Mohit Chauhan",                    query: "Tum Ho Mohit Chauhan Rockstar", industry: "bollywood", mood: "sad" },
  { id: 73, name: "Sunn Raha Hai Na Tu", artist: "Ankit Tiwari",        query: "Sunn Raha Hai Na Tu Ankit Tiwari Aashiqui 2", industry: "bollywood", mood: "sad" },
  { id: 74, name: "Qaafirana", artist: "Arijit Singh",                  query: "Qaafirana Arijit Singh Kedarnath", industry: "bollywood", mood: "romantic" },
  { id: 75, name: "Main Rahoon Ya Na Rahoon", artist: "Arijit Singh",   query: "Main Rahoon Ya Na Rahoon Arijit Singh", industry: "bollywood", mood: "romantic" },
  { id: 76, name: "Phir Se", artist: "A.R. Rahman",                     query: "Phir Se AR Rahman", industry: "bollywood", mood: "romantic" },
  { id: 77, name: "Nadaan Parinde", artist: "A.R. Rahman",              query: "Nadaan Parinde AR Rahman Rockstar", industry: "bollywood", mood: "chill" },
  { id: 78, name: "Mahakaal", artist: "Shankar Mahadevan",              query: "Mahakaal Shankar Mahadevan", industry: "bollywood", mood: "energetic" },
  { id: 79, name: "Rama Rama Ratte Ratte", artist: "Ravindra Jain",     query: "Rama Rama Ratte Ratte Ravindra Jain", industry: "bollywood", mood: "romantic" },
  { id: 80, name: "More Sankat Ke Kataiya", artist: "Sharda",           query: "More Sankat Ke Kataiya", industry: "bollywood", mood: "romantic" },
  { id: 81, name: "Jay Jay Kedara", artist: "Shankar Mahadevan",        query: "Jay Jay Kedara Shankar Mahadevan", industry: "bollywood", mood: "romantic" },
  { id: 82, name: "Dhan Dhan Bhola Nath", artist: "Shankar Mahadevan",  query: "Dhan Dhan Bhola Nath Shankar Mahadevan", industry: "bollywood", mood: "romantic" },
  { id: 83, name: "Radha Kaise Na Jale", artist: "Arijit Singh",        query: "Radha Kaise Na Jale Lagaan Arijit Singh", industry: "bollywood", mood: "romantic" },
  { id: 84, name: "Namo Namo", artist: "Amit Trivedi",                  query: "Namo Namo Amit Trivedi Kedarnath", industry: "bollywood", mood: "romantic" },
  { id: 85, name: "Mere Banke Bihari Laal", artist: "Shreya Ghoshal",   query: "Mere Banke Bihari Laal Shreya Ghoshal", industry: "bollywood", mood: "romantic" },
  { id: 86, name: "Radha Gori Gori", artist: "Kavita Krishnamurthy",    query: "Radha Gori Gori Kavita Krishnamurthy", industry: "bollywood", mood: "romantic" },
  { id: 87, name: "Pyaro Vrindavan", artist: "Kavita Krishnamurthy",    query: "Pyaro Vrindavan Kavita Krishnamurthy", industry: "bollywood", mood: "romantic" },
  { id: 88, name: "Samjhawan", artist: "Jawad Ahmad",                   query: "Samjhawan Jawad Ahmad", industry: "bollywood", mood: "romantic" },
  { id: 89, name: "Mudivesukuntaaro", artist: "Vedala Hemachandra",     query: "Mudivesukuntaaro", industry: "tollywood", mood: "romantic" },
  { id: 90, name: "Bavo Bangaram", artist: "M. M. Keeravani",           query: "Bavo Bangaram", industry: "tollywood", mood: "romantic" },
  { id: 91, name: "Rathiri Rathiri", artist: "Sid Sriram",              query: "Rathiri Rathiri Sid Sriram", industry: "tollywood", mood: "romantic" },
  { id: 92, name: "Pori Rayee Jathara", artist: "Ramya Behara",         query: "Pori Rayee Jathara", industry: "tollywood", mood: "energetic" },
  { id: 93, name: "Malle Chettu", artist: "Sid Sriram",                 query: "Malle Chettu Sid Sriram", industry: "tollywood", mood: "chill" },
  { id: 94, name: "Rambai Neemeedha Naku", artist: "Sid Sriram",        query: "Rambai Neemeedha Naku", industry: "tollywood", mood: "romantic" },
  { id: 95, name: "Na Roja Nuvve", artist: "Sid Sriram",                query: "Na Roja Nuvve Sid Sriram", industry: "tollywood", mood: "romantic" },
  { id: 96, name: "Chikiri Chikiri", artist: "Shankar Mahadevan",       query: "Chikiri Chikiri Shankar Mahadevan", industry: "tollywood", mood: "energetic" },
  { id: 97, name: "Aaya Sher", artist: "Daler Mehndi",                  query: "Aaya Sher Daler Mehndi", industry: "bollywood", mood: "energetic" },
  { id: 98, name: "Ye Tune Kya Kiya", artist: "Javed Bashir",           query: "Ye Tune Kya Kiya Javed Bashir Once Upon A Time", industry: "bollywood", mood: "sad" },
  { id: 99, name: "Chikni Chameli", artist: "Shreya Ghoshal",           query: "Chikni Chameli Shreya Ghoshal Agneepath", industry: "bollywood", mood: "energetic" },
  { id: 100, name: "Lallati Bhandar", artist: "Shankar Mahadevan",      query: "Lallati Bhandar", industry: "bollywood", mood: "romantic" },
  { id: 101, name: "Jugraafiya", artist: "Shreya Ghoshal",             query: "Jugraafiya Shreya Ghoshal", industry: "bollywood", mood: "energetic" },
  { id: 102, name: "Bulleya", artist: "Amit Mishra",                   query: "Bulleya Amit Mishra Ae Dil Hai Mushkil", industry: "bollywood", mood: "chill" },
  { id: 103, name: "Dagabaaz Re", artist: "Shreya Ghoshal",            query: "Dagabaaz Re Shreya Ghoshal Dabangg 2", industry: "bollywood", mood: "energetic" },
  { id: 104, name: "Dard E Disco", artist: "Sonu Nigam",               query: "Dard E Disco Sonu Nigam Om Shanti Om", industry: "bollywood", mood: "energetic" },
  { id: 105, name: "Aa Re Pritam Pyaare", artist: "Shreya Ghoshal",    query: "Aa Re Pritam Pyaare Shreya Ghoshal", industry: "bollywood", mood: "energetic" },
  { id: 106, name: "Shararat", artist: "Shreya Ghoshal",               query: "Shararat Shreya Ghoshal", industry: "bollywood", mood: "energetic" },
  { id: 107, name: "Ud-daa Punjab", artist: "Vishal Dadlani",          query: "Ud daa Punjab Vishal Dadlani", industry: "bollywood", mood: "energetic" },
  { id: 108, name: "Paisa Paisa", artist: "Yo Yo Honey Singh",         query: "Paisa Paisa Yo Yo Honey Singh", industry: "bollywood", mood: "energetic" },
  { id: 109, name: "Yaar Naa Miley", artist: "Yo Yo Honey Singh",      query: "Yaar Naa Miley Yo Yo Honey Singh", industry: "bollywood", mood: "romantic" },
  { id: 110, name: "Soni De Nakhre", artist: "Labh Janjua",            query: "Soni De Nakhre Labh Janjua", industry: "bollywood", mood: "energetic" },
  { id: 111, name: "Dilliwaali Girlfriend", artist: "Arijit Singh",    query: "Dilliwaali Girlfriend Arijit Singh Yeh Jawaani Hai Deewani", industry: "bollywood", mood: "energetic" },
  { id: 112, name: "Dhadhang Dhang", artist: "Shreya Ghoshal",         query: "Dhadhang Dhang Shreya Ghoshal", industry: "bollywood", mood: "energetic" },
];

const OUTPUT_DIR = path.join(__dirname, 'downloads');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function downloadSong(song) {
  const slug = slugify(song.name);
  const outputTemplate = path.join(OUTPUT_DIR, `${slug}.%(ext)s`);
  const mp3Path = path.join(OUTPUT_DIR, `${slug}.mp3`);

  if (fs.existsSync(mp3Path)) {
    console.log(`[SKIP] ${song.name} (already downloaded)`);
    return mp3Path;
  }

  console.log(`[DL] ${song.name}...`);
  try {
    execSync(
      `"${YTDLP}" --ffmpeg-location "${FFMPEG_DIR}" -f bestaudio --extract-audio --audio-format mp3 --audio-quality 192k -o "${outputTemplate}" "ytsearch:${song.query}"`,
      { timeout: 120000, shell: 'cmd.exe', stdio: ['pipe', 'pipe', 'pipe'] }
    );
    if (fs.existsSync(mp3Path)) {
      const size = (fs.statSync(mp3Path).size / 1024 / 1024).toFixed(1);
      console.log(`[OK] ${song.name} (${size} MB)`);
      return mp3Path;
    }
    console.log(`[WARN] ${song.name} - mp3 not found, trying without conversion`);
    const webmFiles = fs.readdirSync(OUTPUT_DIR).filter(f => f.startsWith(slug) && !f.endsWith('.mp3'));
    for (const f of webmFiles) {
      if (fs.existsSync(path.join(OUTPUT_DIR, f))) {
        const src = path.join(OUTPUT_DIR, f);
        const dst = path.join(OUTPUT_DIR, `${slug}.mp3`);
        execSync(`"${FFMPEG_DIR}\\ffmpeg.exe" -i "${src}" -q:a 2 "${dst}" -y`, { timeout: 60000, shell: 'cmd.exe', stdio: 'pipe' });
        if (fs.existsSync(dst)) {
          const size = (fs.statSync(dst).size / 1024 / 1024).toFixed(1);
          console.log(`[OK] ${song.name} (converted, ${size} MB)`);
          return dst;
        }
      }
    }
    return null;
  } catch (err) {
    if (fs.existsSync(mp3Path)) {
      const size = (fs.statSync(mp3Path).size / 1024 / 1024).toFixed(1);
      console.log(`[OK] ${song.name} (${size} MB)`);
      return mp3Path;
    }
    console.error(`[FAIL] ${song.name}: ${err.message}`);
    return null;
  }
}

async function uploadToCloudinary(filePath, publicId) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      { resource_type: 'video', public_id: publicId, format: 'mp3' },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      }
    );
  });
}

async function processAll() {
  const results = [];
  const failed = [];

  for (const song of songs) {
    const mp3Path = downloadSong(song);
    if (mp3Path) {
      const slug = slugify(song.name);
      console.log(`[UP] ${song.name}...`);
      try {
        const url = await uploadToCloudinary(mp3Path, `music/${slug}`);
        results.push({ ...song, slug, url });
        console.log(`[UPLOADED] ${song.name} -> ${url}`);
      } catch (err) {
        console.error(`[UPLOAD FAIL] ${song.name}: ${err.message}`);
        failed.push(song.name);
      }
    } else {
      failed.push(song.name);
    }
  }

  console.log('\n\n========================================');
  console.log('DOWNLOAD/FAIL SUMMARY');
  console.log('========================================');
  console.log(`Total: ${songs.length}, Success: ${results.length}, Failed: ${failed.length}`);
  if (failed.length > 0) {
    console.log('Failed:', failed.join(', '));
  }

  console.log('\n\n========================================');
  console.log('DATA.JS ENTRIES (copy these into data.js)');
  console.log('========================================\n');
  for (const r of results) {
    const image = r.id <= 23 ? `/img/${slugify(r.name)}.webp` : r.id <= 41 ? `https://picsum.photos/seed/${slugify(r.name)}/400/400` : `https://picsum.photos/seed/${slugify(r.name)}/400/400`;
    console.log(`  {`);
    console.log(`    id: ${r.id}, name: "${r.name}", artist: "${r.artist}",`);
    console.log(`    image: "${image}", audio: "${r.url}",`);
    console.log(`    industry: "${r.industry}", mood: "${r.mood}",`);
    console.log(`  },`);
  }
  console.log('=====================================\n');
}

processAll().catch(console.error);
