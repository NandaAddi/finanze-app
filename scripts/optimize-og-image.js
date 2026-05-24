const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = path.join(__dirname, '../public/og-image.png');
const outputPath = path.join(__dirname, '../public/og-image-optimized.png');

async function optimizeImage() {
  try {
    console.log('Optimizing og-image.png...');
    
    // Read the original image
    const metadata = await sharp(inputPath).metadata();
    console.log(`Original dimensions: ${metadata.width}x${metadata.height}`);
    
    // We want to compress the PNG to be under 300KB
    // A great way is to use sharp's png optimization options (compressionLevel, quality)
    // or convert it to a highly optimized 8-bit palette PNG which is perfect for vectors/screenshots
    await sharp(inputPath)
      .png({
        quality: 80,
        compressionLevel: 9,
        palette: true // Reduces size drastically by using 8-bit palette while maintaining premium quality
      })
      .toFile(outputPath);
      
    const originalSizeKB = (fs.statSync(inputPath).size / 1024).toFixed(1);
    const optimizedSizeKB = (fs.statSync(outputPath).size / 1024).toFixed(1);
    
    console.log(`Original Size: ${originalSizeKB} KB`);
    console.log(`Optimized Size: ${optimizedSizeKB} KB`);
    
    if (parseFloat(optimizedSizeKB) < 300) {
      console.log('Optimization successful! Replacing original image with optimized version...');
      fs.copyFileSync(outputPath, inputPath);
      fs.unlinkSync(outputPath);
      console.log('Done!');
    } else {
      console.log('Optimized image is still larger than 300KB. Retrying with lower quality...');
      await sharp(inputPath)
        .png({
          quality: 60,
          compressionLevel: 9,
          palette: true
        })
        .toFile(outputPath);
      const reOptimizedSizeKB = (fs.statSync(outputPath).size / 1024).toFixed(1);
      console.log(`Re-optimized Size: ${reOptimizedSizeKB} KB`);
      fs.copyFileSync(outputPath, inputPath);
      fs.unlinkSync(outputPath);
      console.log('Done!');
    }
  } catch (error) {
    console.error('Error optimizing image:', error);
  }
}

optimizeImage();
