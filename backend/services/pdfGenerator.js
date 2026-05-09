const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fs2 = require("fs");
const path = require("path");
const HEADER_PATH = path.join(__dirname, "../assets/mits-header.png");
let _headerBytes = null;
try { if (fs2.existsSync(HEADER_PATH)) { _headerBytes = fs2.readFileSync(HEADER_PATH); } } catch(e) {}

async function generateFeedbackReportPDF({ submission, reports, hodUser, vcUser, approvedAt }) {
  const User = require("../models/User");
  const axios = require("axios");
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const black=rgb(0,0,0),white=rgb(1,1,1),gray=rgb(0.5,0.5,0.5),lightGray=rgb(0.93,0.93,0.93);
  const blue=rgb(0.118,0.227,0.541),red=rgb(0.8,0.1,0.1),green=rgb(0.082,0.325,0.173);
  const amber=rgb(0.7,0.4,0),darkBlue=rgb(0.05,0.15,0.4);
  const PW=842,PH=595,ML=20,MR=20,CW=802;
  const today=new Date(approvedAt||Date.now()).toLocaleDateString("en-IN",{day:"2-digit",month:"2-digit",year:"numeric"});
  function txt(p,t,x,y,s,f,c){if(!t)return;try{p.drawText(String(t),{x,y,size:s,font:f||font,color:c||black});}catch(e){}}
  function rect(p,x,y,w,h,o){p.drawRectangle({x,y,width:w,height:h,...o});}
  function line(p,x1,y1,x2,y2,t,c){p.drawLine({start:{x:x1,y:y1},end:{x:x2,y:y2},thickness:t||0.5,color:c||black});}
  function wrap(text,max){const words=(text||"").split(" ");const lines=[];let cur="";words.forEach(w=>{const n=cur?cur+" "+w:w;if(n.length<=max){cur=n;}else{if(cur)lines.push(cur);cur=w.length>max?w.substring(0,max-1)+"...":w;}});if(cur)lines.push(cur);return lines;}
  async function embedSig(b64){if(!b64)return null;try{const d=b64.replace(/^data:image\/\w+;base64,/,"");const bytes=Buffer.from(d,"base64");return b64.includes("image/png")?await pdfDoc.embedPng(bytes):await pdfDoc.embedJpg(bytes);}catch{return null;}}
  const seenR=new Set();
  const uniqueReports=reports.filter(r=>{const k=(r.facultyName||"").toLowerCase().trim()+"|"+(r.subjectCode||"").toLowerCase().trim();if(seenR.has(k))return false;seenR.add(k);return true;});
  const facultySigMap={};
  for(const r of uniqueReports){const key=(r.facultyName||"").toLowerCase().trim();if(facultySigMap[key])continue;if(r.facultyUserId){try{const fu=await User.findById(r.facultyUserId).select("signatureImage");if(fu&&fu.signatureImage){const img=await embedSig(fu.signatureImage);if(img)facultySigMap[key]=img;}}catch(e){}}if(!facultySigMap[key]){try{const fu=await User.findOne({role:"faculty",name:new RegExp((r.facultyName||"").trim(),"i")}).select("signatureImage");if(fu&&fu.signatureImage){const img=await embedSig(fu.signatureImage);if(img)facultySigMap[key]=img;}}catch(e){}}}
  const hodSig=await embedSig(hodUser&&hodUser.signatureImage);
  const vcSig=await embedSig(vcUser&&vcUser.signatureImage);
  console.log("[PDF] Sigs HOD:",!!hodSig,"VC:",!!vcSig,"Faculty:",Object.keys(facultySigMap).length);
  let _embH=null;
  async function drawHeader(page,y){if(_headerBytes){if(!_embH){try{_embH=await pdfDoc.embedPng(_headerBytes);}catch(e){}}if(_embH){const nH=Math.round(CW*_embH.height/_embH.width);const iH=Math.min(nH,60);const sW=Math.round(iH*_embH.width/_embH.height);page.drawImage(_embH,{x:ML+(CW-sW)/2,y:y-iH,width:sW,height:iH});line(page,ML,y-iH-4,PW-MR,y-iH-4,0.8,black);return y-iH-8;}}line(page,ML,y,PW-MR,y,1.5,blue);txt(page,"MADHAV INSTITUTE OF TECHNOLOGY & SCIENCE, GWALIOR (M.P.), INDIA",ML+42,y-10,8.5,boldFont,blue);txt(page,"(Deemed University) - NAAC A++ Grade",ML+42,y-22,7,font,red);line(page,ML,y-32,PW-MR,y-32,0.8,black);return y-36;}
  const coverPage=pdfDoc.addPage([PW,PH]);
  let y=PH-15;
  y=await drawHeader(coverPage,y);y-=12;
  const tT="Feedback Report";txt(coverPage,tT,PW/2-timesBoldFont.widthOfTextAtSize(tT,16)/2,y,16,timesBoldFont,darkBlue);y-=22;
  const dT=hodUser&&hodUser.department||"Centre for Computer Science and Technology";txt(coverPage,dT,PW/2-timesFont.widthOfTextAtSize(dT,11)/2,y,11,timesFont,black);y-=16;
  const mT="Academic Year: "+(submission.academicYear||"2025-26")+"   |   Semester: "+(submission.semester||"-")+"   |   Date: "+today;txt(coverPage,mT,PW/2-font.widthOfTextAtSize(mT,8)/2,y,8,font,gray);y-=14;
  line(coverPage,ML,y,PW-MR,y,0.8,blue);y-=6;
  const COLS=[{label:"S.No",x:ML,w:22},{label:"Faculty Name",x:ML+22,w:85},{label:"Code/Batch",x:ML+107,w:65},{label:"Programme",x:ML+172,w:72},{label:"Sem",x:ML+244,w:22},{label:"FFI",x:ML+266,w:26},{label:"Needs Attention",x:ML+292,w:140},{label:"Appreciation",x:ML+432,w:105},{label:"Action Taken",x:ML+537,w:90},{label:"Faculty Signature",x:ML+627,w:CW-627}];
  const TH=20;rect(coverPage,ML,y-TH,CW,TH,{color:blue});COLS.forEach((col,i)=>{if(i>0)line(coverPage,col.x,y,col.x,y-TH,0.3,rgb(0.6,0.7,1));wrap(col.label,Math.floor(col.w/3.5)).forEach((l,li)=>txt(coverPage,l,col.x+2,y-6-li*7,5.5,boldFont,white));});y-=TH;
  const ROW_H=80,ROW_GAP=4,SIG_RESERVE=115;
  for(let i=0;i<uniqueReports.length;i++){if(y-ROW_H-ROW_GAP<SIG_RESERVE)break;const r=uniqueReports[i];rect(coverPage,ML,y-ROW_H,CW,ROW_H,{color:i%2===0?lightGray:white});line(coverPage,ML,y-ROW_H,PW-MR,y-ROW_H,0.5,rgb(0.75,0.75,0.75));COLS.forEach((col,ci)=>{if(ci>0)line(coverPage,col.x,y,col.x,y-ROW_H,0.2,rgb(0.8,0.8,0.8));});const ffi=r.ffiScore;const fC=ffi!=null?(ffi>=4?green:ffi>=3?amber:red):black;const parts=(r.subjectCode||"-").split("-");const cB=parts.length>1?parts[0].trim()+"\n"+parts.slice(1).join("-").trim():(r.subjectCode||"-");const aT=(r.commentsNeedingAttention||[]).length>0?r.commentsNeedingAttention.join("\n"):"None";const pcts=r.commentPercentages||{};const pL=Object.entries(pcts).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+": "+v+"%").join(", ");const lA=(r.appreciation||[]).filter(c=>c.trim().split(/\s+/).length>4);const pT=[pL,...lA].filter(Boolean).join("\n")||"-";const vals=[{v:String(i+1),bold:true,center:true},{v:r.facultyName||"-"},{v:cB},{v:r.programme||"-"},{v:r.semester||"-",center:true},{v:ffi!=null?ffi.toFixed(2):"-",color:fC,bold:true,center:true},{v:aT,small:true},{v:pT,small:true},{v:r.actionTaken||"-",small:true},{v:"",sig:true}];vals.forEach((val,ci)=>{const col=COLS[ci];const fs=val.small?5.5:6.5;const lH=fs+2.5;if(val.sig){const sI=facultySigMap[(r.facultyName||"").toLowerCase().trim()];if(sI){const sc=Math.min((col.w-8)/sI.width,(ROW_H-22)/sI.height,0.5);coverPage.drawImage(sI,{x:col.x+4,y:y-ROW_H+10,width:sI.width*sc,height:sI.height*sc});}else{line(coverPage,col.x+4,y-ROW_H+20,col.x+col.w-4,y-ROW_H+20,0.5,gray);}txt(coverPage,r.facultyName||"",col.x+4,y-ROW_H+6,5,font,gray);return;}const mC=Math.floor(col.w/(fs*0.52));const aL=val.v.split("\n").flatMap(seg=>wrap(seg,mC));aL.slice(0,Math.floor((ROW_H-10)/lH)).forEach((l,li)=>{const tX=val.center?col.x+col.w/2-(l.length*fs*0.28):col.x+2;txt(coverPage,l,Math.max(col.x+1,tX),y-6-li*lH,fs,val.bold?boldFont:font,val.color||black);});});y-=ROW_H+ROW_GAP;}
  y-=4;rect(coverPage,ML,y-18,CW,18,{borderColor:black,borderWidth:0.3});txt(coverPage,"FFI & Suggestions are noted for further improvement.",ML+4,y-12,7,font,black);y-=18;
  const sHH=16,sBH=70,sY=y-4;const c1W=Math.floor(CW*0.44),c2W=Math.floor(CW*0.26),c3W=CW-c1W-c2W;const c1X=ML,c2X=ML+c1W,c3X=ML+c1W+c2W;
  rect(coverPage,ML,sY-sHH,CW,sHH,{color:lightGray,borderColor:black,borderWidth:0.5});line(coverPage,c2X,sY,c2X,sY-sHH,0.5,black);line(coverPage,c3X,sY,c3X,sY-sHH,0.5,black);txt(coverPage,"Faculty Name & Signature",c1X+4,sY-11,7,boldFont,black);txt(coverPage,"HOD",c2X+4,sY-11,7,boldFont,black);txt(coverPage,"PRO - VC",c3X+4,sY-11,7,boldFont,black);
  const bY=sY-sHH;rect(coverPage,ML,bY-sBH,CW,sBH,{borderColor:black,borderWidth:0.5});line(coverPage,c2X,bY,c2X,bY-sBH,0.5,black);line(coverPage,c3X,bY,c3X,bY-sBH,0.5,black);
  let fY=bY-9;for(const r of uniqueReports.slice(0,4)){const sI=facultySigMap[(r.facultyName||"").toLowerCase().trim()];txt(coverPage,r.facultyName||"-",c1X+4,fY,6.5,font,black);if(sI){const sc=Math.min(55/sI.width,16/sI.height,0.4);coverPage.drawImage(sI,{x:c1X+115,y:fY-13,width:sI.width*sc,height:sI.height*sc});}else{line(coverPage,c1X+115,fY-4,c1X+c1W-8,fY-4,0.4,gray);}fY-=15;}if(uniqueReports.length>4)txt(coverPage,"+"+(uniqueReports.length-4)+" more",c1X+4,fY,5.5,font,gray);
  txt(coverPage,hodUser&&hodUser.name||"Head of Department",c2X+4,bY-10,6.5,boldFont,black);if(hodSig){const sc=Math.min((c2W-10)/hodSig.width,(sBH-22)/hodSig.height,1);coverPage.drawImage(hodSig,{x:c2X+4,y:bY-sBH+8,width:hodSig.width*sc,height:hodSig.height*sc});}else{line(coverPage,c2X+4,bY-sBH+18,c2X+c2W-8,bY-sBH+18,0.5,gray);}
  txt(coverPage,vcUser&&vcUser.name||"Vice Chancellor",c3X+4,bY-10,6.5,boldFont,black);if(vcSig){const sc=Math.min((c3W-10)/vcSig.width,(sBH-22)/vcSig.height,1);coverPage.drawImage(vcSig,{x:c3X+4,y:bY-sBH+8,width:vcSig.width*sc,height:vcSig.height*sc});}else{line(coverPage,c3X+4,bY-sBH+18,c3X+c3W-8,bY-sBH+18,0.5,gray);}
  function cDL(url){if(!url)return null;const m=url.match(/\/d\/([a-zA-Z0-9_-]+)/)||url.match(/id=([a-zA-Z0-9_-]+)/);if(m)return "https://drive.google.com/uc?export=download&id="+m[1];return url;}
  async function dlR(url,retries=3){for(let a=1;a<=retries;a++){try{const res=await axios.get(url,{responseType:"arraybuffer",timeout:30000,headers:{"User-Agent":"Mozilla/5.0"},maxRedirects:10});const buf=Buffer.from(res.data);if(buf.subarray(0,4).toString()!=="%PDF")throw new Error("Not a PDF");return res.data;}catch(err){console.warn("[PDF] Attempt "+a+": "+err.message);if(a<retries)await new Promise(r=>setTimeout(r,2000*a));}}return null;}
  const sL=new Set();for(let ri=0;ri<uniqueReports.length;ri++){const rp=uniqueReports[ri];const raw=rp.driveLink||rp.pdfLink;if(!raw||raw.startsWith("uploaded:"))continue;const lk=cDL(raw);if(!lk||sL.has(lk))continue;sL.add(lk);console.log("[PDF] Downloading for "+rp.facultyName+"...");const data=await dlR(lk);if(!data){console.warn("[PDF] Skipped "+rp.facultyName);continue;}try{const sD=await PDFDocument.load(data);const cp=await pdfDoc.copyPages(sD,sD.getPageIndices());cp.forEach(p=>pdfDoc.addPage(p));
    const lastPage=pdfDoc.getPage(pdfDoc.getPageCount()-1);
    const fSig=facultySigMap[(rp.facultyName||"").toLowerCase().trim()];
    const sigY=108;const sigH=22;
    if(fSig){const sc=Math.min(180/fSig.width,sigH/fSig.height,1);lastPage.drawImage(fSig,{x:140,y:sigY,width:fSig.width*sc,height:fSig.height*sc});}
    if(hodSig){const sc=Math.min(110/hodSig.width,sigH/hodSig.height,1);lastPage.drawImage(hodSig,{x:360,y:sigY,width:hodSig.width*sc,height:hodSig.height*sc});}
    if(vcSig){const sc=Math.min(85/vcSig.width,sigH/vcSig.height,1);lastPage.drawImage(vcSig,{x:493,y:sigY,width:vcSig.width*sc,height:vcSig.height*sc});}
    console.log("[PDF] Added "+cp.length+" pages for "+rp.facultyName);}catch(err){console.warn("[PDF] Parse error: "+err.message);}}
  const total=pdfDoc.getPageCount();for(let pi=0;pi<total;pi++){try{pdfDoc.getPage(pi).drawText(pi+1+" / "+total,{x:PW-50,y:8,size:6,font,color:gray});}catch(e){}}
  return Buffer.from(await pdfDoc.save());
}
module.exports={generateFeedbackReportPDF};