const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./survey.db');
const imagesDir = path.join(__dirname, 'images');

// 读取所有图片文件
const files = fs.readdirSync(imagesDir).filter(f =>
  /\.(png|jpg|jpeg|gif)$/i.test(f)
);

let pending = files.length;
if (pending === 0) {
  db.close();
  console.log('No images found.');
  process.exit(0);
}

files.forEach((img) => {
  db.get(
    "SELECT id FROM questions WHERE params = ?",
    [JSON.stringify({ img })],
    (err, row) => {
      if (err) {
        console.error(err);
        if (--pending === 0) db.close();
        return;
      }
      if (!row) {
        db.run(
          "INSERT INTO questions (type, params, correct, strategy) VALUES (?, ?, ?, ?)",
          [
            "dots",
            JSON.stringify({ img }),
            "", // correct 答案可后续补充
            null
          ],
          function (err) {
            if (err) {
              console.error(err);
            } else {
              console.log(`Inserted question for image: ${img}`);
            }
            if (--pending === 0) db.close();
          }
        );
      } else {
        console.log(`Question for image ${img} already exists.`);
        if (--pending === 0) db.close();
      }
    }
  );
});
