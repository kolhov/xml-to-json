import imageToBase64 from 'image-to-base64';
import * as fs from 'node:fs';
import * as path from "path";
import mime from 'mime-types';
import _ from 'lodash';

export async function reformatData(){

  let jsonData = [];
  for (let i = 1; i < 10; i++){
    let dataPath = `./src/data/data${i}.json`;
    try {
      const data = fs.readFileSync(dataPath, 'utf8');
      jsonData.push(...JSON.parse(data));
    } catch (err) {
      console.error('Error:', err.message);
    }
  }

  jsonData = _.uniqBy(jsonData, 'text');

  const formattedJson = await Promise.all(jsonData.map(async (item) => {
    let options: string[] = [];
    let answerId: number;

    for (const x of item['odpovedi']) {
      if (x['correct'] == 1) {
        let index = item['odpovedi'].indexOf(x);
        answerId = index;

      }
      if (mime.lookup(x['data']).toString().startsWith('image/')){
        const imageStr = "data:image/png;base64," + await getImageString(x['data'])
        if (imageStr) options.push(imageStr);
      }
      else {
        options.push(x['data']);
      }
    }

    return {
      category: item?.['okruhy'][0]?.['nazev'],
      text: item.text,
      attachmentType: item?.data ? "image" : null,
      attachment: item?.data ? "data:image/png;base64," + await getImageString(item?.data) : null,
      options: [...options],
      answerIdx: answerId,
    }
  }));

  const jsonString = JSON.stringify(formattedJson, null, 2);
  const filePath = path.join('.', 'output', 'old_2024_08_02.json');

  fs.writeFileSync(filePath, jsonString, 'utf8');
}

async function getImageString(name){
  return imageToBase64(`src/media/data/${name}`) // Path to the image
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

