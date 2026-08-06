import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const outputRoot = path.resolve("public/images/collections");
const groups = {
  breed: ["pug", "labrador", "golden-retriever", "french-bulldog", "dachshund", "german-shepherd", "border-collie", "cocker-spaniel", "chihuahua", "staffordshire-bull-terrier"],
  cats: ["classic-cat", "maine-coon", "british-shorthair", "bengal", "siamese", "persian", "ragdoll", "sphynx", "scottish-fold", "tuxedo-cat"],
  nature: ["leaf", "tree", "mountain", "wave", "sun", "river", "forest", "lotus", "blossom", "cactus"],
  luxury: ["noir", "monarch", "eclipse", "diamond", "prestige", "aurora", "luxe", "royal", "opulence", "majestic"],
  kids: ["rainbow", "star", "cloud", "balloon", "ice-cream-paw", "sweet-heart", "unicorn", "dino", "rocket", "flower"],
  halloween: ["pumpkin", "ghost", "bat", "witch-hat", "skull", "spider", "cauldron", "tombstone", "black-cat", "haunted-house"],
  christmas: ["snowflake", "christmas-tree", "reindeer", "santa", "stocking", "gingerbread", "candy-cane", "ornament", "gift", "star"],
  easter: ["easter-egg", "bunny", "bunny-paw", "chick", "carrot", "hoppy-bunny", "easter-basket", "he-is-risen", "lamb", "tulip"],
  celebration: ["birthday", "party-time", "surprise", "celebrate", "winner", "champion", "cheers", "love", "engaged", "together", "new-home", "baby", "graduation", "milestone", "anniversary", "good-luck", "best-wishes", "awesome", "memorable", "forever"],
};

function placeholderSvg() {
  return `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><g filter="url(#shadow)"><circle cx="256" cy="270" r="174" fill="#151515" stroke="#f5f5f5" stroke-width="18"/><circle cx="256" cy="98" r="31" fill="#151515" stroke="#f5f5f5" stroke-width="14"/><circle cx="256" cy="98" r="13" fill="#f5f5f5"/><path d="M178 284c39-54 117-54 156 0" fill="none" stroke="#f5f5f5" stroke-linecap="round" stroke-width="13"/><circle cx="210" cy="244" r="10" fill="#f5f5f5"/><circle cx="302" cy="244" r="10" fill="#f5f5f5"/></g><defs><filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-opacity=".22"/></filter></defs></svg>`;
}

for (const [folder, names] of Object.entries(groups)) {
  const folderPath = path.join(outputRoot, folder);
  await fs.mkdir(folderPath, { recursive: true });
  await Promise.all(names.map((name) => sharp(Buffer.from(placeholderSvg())).png().toFile(path.join(folderPath, `${name}.png`))));
}

const essentialOutput = path.join(outputRoot, "essential");
await fs.mkdir(essentialOutput, { recursive: true });
for (const file of await fs.readdir(path.resolve("public/images/tag-shapes/essential"))) {
  if (file.endsWith(".png")) await fs.copyFile(path.resolve("public/images/tag-shapes/essential", file), path.join(essentialOutput, file));
}

console.log("Collection placeholder assets created.");
