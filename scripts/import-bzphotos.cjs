// Read-only originals; only web derivatives and manifests enter the repository.
const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const input = path.resolve(process.argv[2] || 'D:/bzphotos');
const entries = [
 ['6303','走过这条林荫路','校园'], ['6814','迎着光的校园','校园'],
 ['5704','树隙里的阳光','四季'], ['5705','草坪上的光影','日常'], ['5706','银杏映红楼','四季'],
 ['5795','傍晚的轮廓','日常'], ['5847','熟悉的教学楼','校园'], ['6255','球门前的午后','日常'],
 ['6260','草叶间的小世界','四季'], ['6263','新绿正好','四季'], ['6267','校园里的向上','校园'],
 ['6275','绿荫深处','校园'], ['6295','树影交错的课间','日常'], ['6296','读书的人','校园'],
 ['6302','林荫路的另一刻','四季'], ['6307','光里走过的身影','日常'], ['6310','转角遇见阳光','日常'],
 ['6317','夏日的长廊','四季'], ['6337','抬头望见的枝叶','四季'], ['6806','墙上的文字','校园'],
 ['6812','树下的安静时光','日常'], ['6839','叶间的访客','四季'], ['6848','满树金色','四季'], ['6869','楼宇的剪影','校园'],
];
async function main() {
 await fs.mkdir(path.join(root,'public/campus-collection'),{recursive:true});
 const photos=[]; let originalBytes=0, webBytes=0;
 for(const [number,title,category] of entries){
  const file=await fs.readFile(path.join(input,`IMG_${number}.JPG`)); originalBytes+=file.length;
  const variants=[];
  for(const width of [640,1280,1920]){
   const {data,info}=await sharp(file,{limitInputPixels:40000000}).rotate().resize({width,withoutEnlargement:true}).webp({quality:78,effort:4}).toBuffer({resolveWithObject:true});
   const hash=createHash('sha256').update(data).digest('hex').slice(0,12);
   const src=`/campus-collection/bz-${number}-${info.width}-${hash}.webp`;
   await fs.writeFile(path.join(root,'public',src),data);webBytes+=data.length;
   variants.push({src,width:info.width,height:info.height});
  }
  const placeholder=await sharp(file).rotate().resize({width:40}).webp({quality:30}).toBuffer();
  const full=variants.at(-1);
  photos.push({id:`bz-${number}`,title,category,src:full.src,thumbnail:variants[0].src,srcSet:variants.map(v=>`${v.src} ${v.width}w`).join(', '),width:full.width,height:full.height,placeholder:`data:image/webp;base64,${placeholder.toString('base64')}`});
 }
 await fs.writeFile(path.join(root,'data/campus-collection.json'),JSON.stringify(photos,null,2)+'\n');
 await fs.writeFile(path.join(root,'data/home-campus-photos.json'),JSON.stringify(photos.slice(0,2),null,2)+'\n');
 console.log(JSON.stringify({photos:photos.length,originalBytes,webBytes}));
}
main().catch(e=>{console.error(e);process.exitCode=1});
