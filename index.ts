import {reformatData} from "./src/reformatUtil.js";
import {importAll} from "./src/docxUtil.js";
import * as fs from "fs";
import path from "path";



reformatData().then(() => {
  console.log('success');
  importAll().then(() => {
    console.log('success');

    const folderPath = './output'; // измените на свою папку
    const files = fs.readdirSync(folderPath);

    let combinedData = [];

    files.forEach(file => {
      if (path.extname(file) === '.json') {
        const filePath = path.join(folderPath, file);
        const data = fs.readFileSync(filePath, 'utf8');
        combinedData.push(...JSON.parse(data));
      }
    });

    const jsonString = JSON.stringify(combinedData, null, 2);
    const filePath = path.join('.', 'output', '2024_08_02.json');

    fs.writeFileSync(filePath, jsonString, 'utf8');
  });
});


