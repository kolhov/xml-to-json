import imageToBase64 from 'image-to-base64';
import * as fs from 'node:fs';
import * as path from "path";
import mime from 'mime-types';
import _ from 'lodash';

export async function importAll(){
  await reformatDocxData('otazky', 'Otazky');
  await reformatDocxData('otazky-ilustrace', 'Otázky kvíz s ilustracemi');
  await reformatDocxData('video_prip', 'Otázka video připoj');
  await reformatDocxData('znacky', 'Otázky kvíz značky');

}

export async function reformatDocxData(itemPath: string, category: string) {

  let jsonData = [];

  let dataPath = `./src/data/docx/${itemPath}/question.json`;
  try {
    const data = fs.readFileSync(dataPath, 'utf8');
    jsonData.push(...JSON.parse(data));
  } catch (err) {
    console.error('Error:', err.message);
  }

  const formattedJson = await Promise.all(jsonData.map(async (item) => {
    let options: string[] = [];
    let answerId: number;

    for (const x of item['options']) {
      if (x.label == item['answer']) {
        answerId = item['options'].indexOf(x);
      }
      options.push(x['text']);
    }

    return {
      category: category,
      text: item.question,
      attachmentType: (itemPath != 'otazky') ? "image" : null,
      attachment: (itemPath != 'otazky')  ? "data:image/png;base64," + await getImageString(itemPath, jsonData.indexOf(item) + 1) : null,
      options: [...options],
      answerIdx: answerId,
    }
  }));

  const jsonString = JSON.stringify(formattedJson, null, 2);
  const filePath = path.join('.', 'output', `${itemPath}_2024_08_01.json`);

  fs.writeFileSync(filePath, jsonString, 'utf8');
  console.log(`file writed ${filePath}`)
}

async function getImageString(itemPath, name) {
  return imageToBase64(`src/data/docx/${itemPath}/media/image${name}.png`) // Path to the image
    .catch(
      (error) => {
        console.log(error);
        return null;
      }       // Logs an error if there was one
    )
    .then(
      (response) => {
        return response; // "cGF0aC90by9maWxlLmpwZw=="
      }
    )
}

