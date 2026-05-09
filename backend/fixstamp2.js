const fs = require('fs');
let c = fs.readFileSync('./services/pdfGenerator.js', 'utf8');

// Replace just the sigY and sigH values and positions
c = c.replace(
  'const sigY=109; const sigH=20;\n    if(fSig){const sc=Math.min(200/fSig.width,sigH/fSig.height,1);lastPage.drawImage(fSig,{x:140,y:sigY,width:fSig.width*sc,height:fSig.height*sc});}\n    if(hodSig){const sc=Math.min(110/hodSig.width,sigH/hodSig.height,1);lastPage.drawImage(hodSig,{x:360,y:sigY,width:hodSig.width*sc,height:hodSig.height*sc});}\n    if(vcSig){const sc=Math.min(85/vcSig.width,sigH/vcSig.height,1);lastPage.drawImage(vcSig,{x:493,y:sigY,width:vcSig.width*sc,height:vcSig.height*sc});}',
  'const sigY=110; const sigH=22;\n    if(fSig){const sc=Math.min(180/fSig.width,sigH/fSig.height,1);lastPage.drawImage(fSig,{x:140,y:sigY,width:fSig.width*sc,height:fSig.height*sc});}\n    if(hodSig){const sc=Math.min(110/hodSig.width,sigH/hodSig.height,1);lastPage.drawImage(hodSig,{x:360,y:sigY,width:hodSig.width*sc,height:hodSig.height*sc});}\n    if(vcSig){const sc=Math.min(85/vcSig.width,sigH/vcSig.height,1);lastPage.drawImage(vcSig,{x:493,y:sigY,width:vcSig.width*sc,height:vcSig.height*sc});}'
);

fs.writeFileSync('./services/pdfGenerator.js', c, 'utf8');
const m = require('./services/pdfGenerator');
console.log('OK:', typeof m.generateFeedbackReportPDF, 'size:', fs.statSync('./services/pdfGenerator.js').size);
