const archiver = require("archiver");
const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");
const getExtension = require("./getExtension");

const config = {
  mode: null,
  text_size: {
    portrait: 'poppins_32.fnt',
    landscape: 'poppins_16.fnt',
    square: 'poppins_32.fnt'
  },
  logo_size: {
    portrait: 175,
    landscape: 100,
    square: 175,
  },
  logo_position: {
    portrait: [870, 1040],
    landscape: [940, 415],
    square: [950, 950]
  },
  image_size: {
    portrait: [1080, 1350],
    landscape: [1080, 608],
    square: [1200, 1200]
  },
  font:{
    portrait: 'poppins_40.fnt',
    landscape: 'poppins_20.fnt',
    square: 'poppins_40.fnt'
  },
  text_padding:{
    portrait: 20,
    landscape: 10,
    square: 20
  }
}

module.exports = (files, dogName, res) => {
  if (files.length > 1) {
    var output = fs.createWriteStream(
      path.join(__dirname, "../public/images/temp/download.zip")
    );
    var archive = archiver("zip", {
      zlib: { level: 9 }
    });
    archive.pipe(output);
  }

  let filesWritten = 0;
  
  files.map((file, ind) => {
    const extension = getExtension(file);

    Jimp.read(
      path.join(__dirname, "../public/images/logo.png"),
      (err, logo) => {
        if (err) throw err;
        
        
        
        logo.quality(100);
        Jimp.read(file.path, (err, mainImage) => {
          if (err) throw err;
          if (mainImage.bitmap.width > mainImage.bitmap.height) {
            config.mode = 'landscape'
           
          } else if (mainImage.bitmap.height > mainImage.bitmap.width) {
            config.mode = 'portrait'
          } else {
            config.mode = 'square'
          }
          logo.resize(config.logo_size[config.mode], config.logo_size[config.mode])
          mainImage.cover(config.image_size[config.mode][0], config.image_size[config.mode][1]);
          mainImage.quality(100);
          mainImage.composite(
            logo,
            config.logo_position[config.mode][0],
            config.logo_position[config.mode][1]
          );
          Jimp.loadFont(
            path.join(__dirname, `../public/fonts/${config.font[config.mode]}`)
          ).then(font => {
            const textWidth = Jimp.measureText(font, dogName);
            const textHeight = Jimp.measureTextHeight(font, dogName, 100);
            new Jimp(textWidth + config.text_padding[config.mode], textHeight + config.text_padding[config.mode], "#f07937", (err, img) => {
              mainImage.composite(
                img,
                mainImage.bitmap.width - textWidth - 50 - (config.text_padding[config.mode] / 2),
                mainImage.bitmap.height - textHeight - 50 - (config.text_padding[config.mode] / 2)
              );
              mainImage.print(
                font,
                mainImage.bitmap.width - textWidth - 50,
                mainImage.bitmap.height - textHeight - 50,
                dogName
              );
              mainImage.write(file.path, () => {
                filesWritten++;
                if (filesWritten === files.length) {
                  if (files.length > 1) {
                    files.map((f, i) => {
                      archive.file(f.path, { name: `${i}${extension}` });
                    });
                    archive.finalize().then(() => {
                      return res.status(200).send({
                        download_link: path.join(
                          __dirname,
                          "../public/images/temp/download.zip"
                        )
                      });
                    });
                  } else {
                    return res.status(200).send({
                      download_link: path.join(__dirname, `../${file.path}`)
                    });
                  }
                }
              });
            });
          });
        });
      }
    );
  });
};
