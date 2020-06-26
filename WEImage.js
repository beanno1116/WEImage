

class WEImage {

    constructor(imgSrc = null,ctxType = null){
        this.ctxType = ctxType ? ctxType : '2d';
        this.initCanvas();
        this.img = new Image();
        this.loadImage(imgSrc);      
        this.imgData = null;  
    }

    initCanvas(){
        this.canvas = document.createElement('canvas');
        this.createContext();
    }

    createContext(){
        this.context = this.canvas.getContext(this.ctxType);
    }

    loadImage(src){
        this.img.onload = this.imageDidLoad.bind(this);
        this.img.src = src;
    }

    drawToContext(){
        this.canvas.width = this.img.width;
        this.canvas.height = this.img.height;
        try {
            this.context.drawImage(this.img,0,0);
        } catch (error) {
            console.log(error);
        }
        
    }

    imageDidLoad(e){
        debugger;
        console.log('Image loaded successfully');
        this.drawToContext();
        this.setImageData();
    }
    
    insertImageInto(view){
        view.append(this.canvas);
    }

    setImageData(){
        if (!this.imgData) {            
            this.imgData = this.context.getImageData(0,0,this.canvas.width,this.canvas.height);
        }
        return this.imgData;        
    }

    imageTable(){
        let imgTbl = [];
        let w = this.imgData.width;
        let h = this.imgData.height;
        
        for (let y = 0; y < h; y++) {
            let row = [];
            for (let x = 0; x < w; x++) {                
                let r =  this.imgData.data[((w * y) + x) * 4];
                let g = this.imgData.data[((w * y) + x) * 4 + 1];
                let b = this.imgData.data[((w * y) + x) * 4 + 2];
                let a = this.imgData.data[((w * y) + x) * 4 + 3];
                let pixel = [r,g,b,a];            
                row.push(pixel);                                
            }
            imgTbl.push(row);
        }
        return imgTbl;    
    }

    image2DArray(){
        let data = this.imgData.data;
        let length = data.length;

        let rArr = new Array(length / 4);
        let i = 0;
        while (i < length) {
            rArr[i / 4] = [data[i],data[i + 1],data[i + 2],data[i + 3]];
            i += 4;
        }
        
        return rArr;
    }

    pixelObjectArray(){
        
        let data = this.imgData.data;
        let length = data.length;
        let pixels = [];
    
        for (let i = 0; i < length; i += 4) {
            
            let pixel = {
                r:data[i],
                g:data[i + 1],
                b:data[i + 2],
                a:data[i + 3]
            };
            pixels.push(pixel);                
        }
        return pixels;
    }

    loopPixels(){
        let data = this.imgData.data;
        let length = data.length;        

        for (let i = 0; i < length; i += 4) {
            data[i];
            data[i + 1];
            data[i + 2];
            data[i + 3];
        }
        console.log(`Looped all ${length / 4} pixels`);        
    }

    scaleImage(scale){
        let w = this.canvas.width;
        let h = this.canvas.height;
        this.context.clearRect(0,0,w,h);
        this.context.drawImage(this.img,0,0,(w * scale),(h * scale));
    }

    invertColors(){
        let length = this.imgData.data.length;
        for (let i = 0; i < length; i += 4) {
            this.imgData.data[i] = this.imgData.data[i] ^ 255;
            this.imgData.data[i + 1] = this.imgData.data[i + 1] ^ 255; 
            this.imgData.data[i + 2] = this.imgData.data[i + 2] ^ 255;            
        }
        this.context.putImageData(this.imgData,0,0);
    }

    grayScale(){
        // let buf = new ArrayBuffer(imgData.data.length);
        // let buf8 = new Uint8ClampedArray(buf);
        // let data = new Uint32Array(buf);

        let data = this.imgData.data;
        let length = data.length;
        for (let i = 0; i < length; i += 4) {
            let grey = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
            data[i] = grey;
            data[i + 1] = grey;
            data[i + 2] = grey;
        }
        this.context.putImageData(this.imgData,0,0);        
    }

    threshold(threshold){
        
        let data = this.imgData.data;
        let length = data.length;
        for (let i=0; i < length; i+=4) {
            let r = data[i];
            let g = data[i+1];
            let b = data[i+2];
            let v = (0.2126*r + 0.7152*g + 0.0722*b >= threshold) ? 255 : 0;
            data[i] = data[i+1] = data[i+2] = v
        }
        this.context.putImageData(this.imgData,0,0);
    }

    convolve(kernel,alpha){
        let side = Math.round(Math.sqrt(kernel.length));
        let halfSide = Math.floor(side/2);

        let sData = this.imgData.data;
        let sw = this.imgData.width;
        let sh = this.imgData.height;

        let w = sw;
        let h = sh;

        let imgd = this.context.createImageData(w,h);
        let oimgd = imgd.data;

        let opaque = alpha ? 1 : 0;

        

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let sy = y;
                let sx = x;
                let oimdOff = (y*w+x)*4;
                let r=0,g=0,b=0,a=0;
                for (let cy = 0; cy < side; cy++) {
                    for (let cx = 0; cx < side; cx++) {
                        // let scy = Math.min(sh-1,Math.max(0,sy + cy - halfSide));
                        // let scx = Math.min(sw-1,Math.max(0,sx + cx - halfSide));
                        let scy = sy + cy - halfSide;
                        let scx = sx + cx - halfSide;
                        if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                            let srcOff = (scy * sw + scx) * 4;
                            let wt = kernel[cy*side+cx];

                            r += sData[srcOff] * wt;
                            g += sData[srcOff + 1] * wt;
                            b += sData[srcOff + 2] * wt;
                            a += sData[srcOff + 3] * wt;
                        }
                    }                    
                }
                oimgd[oimdOff] = r;
                oimgd[oimdOff + 1] = g;
                oimgd[oimdOff + 2] = b;
                oimgd[oimdOff + 3] = a + opaque*(255-a);
            }
            this.context.putImageData(imgd,0,0);            
        }
    }

    startEdgeDetect(kernels,threshold){
        
        let res = this.detectEdges(kernels,threshold);
        let mags = res[0];
        let dirs = res[1];
        this.detectFinished(mags,dirs);
    }

    detectEdges(kernels,threshold){
        let kX = kernels.x;
        let kY = kernels.y;
        
        
        let kLength = kX.length;
        let w = this.canvas.width;
        let pOffset = w * 2 + kLength - 1;
        console.log(pOffset);

        const SQRT = Math.sqrt;
        const ATAN2 = Math.atan2;        
        let data = this.image2DArray();
        let pLength = data.length - pOffset;

        let mags = new Array(pLength);
        let dirs = new Array(pLength);

        for(var i = 0; i < pLength; i++){
            let sumX = 0, sumY = 0;
            for(var x = 0; x < kLength; x++){
                for(var y = 0; y < kLength; y++){
                    
                    let px = data[i + (w * y) + x];
                    let r = px[0];
                    sumX += r * kX[y][x];
                    sumY += r * kY[y][x];
                }
            }
            let mag = SQRT(sumX*sumX + sumY*sumY);
            let dir = ATAN2(sumX,sumY);
            
            mags[i] = mag > threshold ? mag : 0;
            dirs[i] = mag > threshold ? dir : 0;
        }

        return [mags,dirs];
    }

    detectFinished(mags,dirs){
        var dLength = this.canvas.width * this.canvas.height * 4;
        this.edges =  new Array(dLength / 4);
        this.directions = new Array(dLength / 4);

        let edges = new Array(dLength);

        let i = 0;

        while (i < dLength) {
            edges[i] = 0;
            if (!(i % 4)) {
                let m = mags[i / 4];
                let d = dirs[i / 4];
                this.edges[i / 4] = m;
                this.directions[i / 4] = d;
                
                if (m != 0) {
                    edges[i - 1] = m / 4;
                }
            }
            i++;        
        }
        let rarr = new Uint8ClampedArray(edges);
        let rImgData = new ImageData(rarr,this.canvas.width,this.canvas.height);
        this.context.putImageData(rImgData,0,0);
    }

    addGradient(factor){
                
        let cImgData = this.imgData;
        let cData = cImgData.data;

        let nImgData = this.context.createImageData(cImgData);
        let nData = nImgData.data;

        let length = cData.length;

        let cbResArr = [];
        

        for (let i = 0; i < length; i += 4) {
            // let rgba = action(data[i],data[i + 1],data[i + 2],data[i + 3],i,length);            
            // data[i] = rgba[0];
            // data[i + 1] = rgba[1];
            // data[i + 2] = rgba[2];
            // data[i + 3] = rgba[3];
            nData[i] = cData[i];
            nData[i + 1] = cData[i + 1];
            nData[i + 2] = cData[i + 2];
            let tmpv = factor + 255 * (length - i) / length;
            nData[i + 3] = tmpv;
        }
        
        this.context.putImageData(nImgData,0,0);

    }

    getFloat32Array(len){
        return this.getUint8Array(len);
    }

    getUint8Array(len){
        if (len.length) {
            return len.slice(0);
        }
        return new Array(len);
    }

    rotate(deg){
        let cw = this.canvas.width;
        let ch = this.canvas.height;

        let iw = this.imgData.width;
        let ih = this.imgData.height;

        this.context.clearRect(0,0,cw,ch);
        this.context.translate(cw/2,ch/2);
        let rd = deg * Math.PI / 180;
        this.context.rotate(rd);
        this.context.drawImage(this.img,-iw/2,-ih/2);
    }
    
}

export default WEImage;