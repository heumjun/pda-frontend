/**
 * pdf 변환시 pdfDocument 객체 반환
 * @param {*} fileName pdf 파일명(확장자는 필요없음.)
 * @param {int} 0:portrait, 1:landscape   wijmo.pdf.PdfPageOrientation.Portrait 참조
 * @returns pdfDocument 객체
 */
export const pdfDocument = (fileName,paramLayout)=>{

    let Layout = {
        0:{margins:{left:30,right:30,top:30,bottom:30},layout: wijmo.pdf.PdfPageOrientation.Portrait},
        1:{margins:{left:30,right:30,top:30,bottom:30},layout: wijmo.pdf.PdfPageOrientation.Landscape}
    }

    let doc = new wijmo.pdf.PdfDocument({
        header:{height:0},
        footer:{declarative:{text:'\t&[Page]\\&[Pages]'}},
        ended:(sender,args)=>wijmo.pdf.saveBlob(args.blob,`${fileName}.pdf`),
        pageSettings:Layout[paramLayout]
    });

    //문서 기본폰트 나눔고딕 셋팅
    doc.registerFont({
        source: '/font/NanumGothic/NanumGothic.ttf',
        name:'nanum',
        style:'normal',
        weight: 'nomal',
        sansSerif: true
    });

    doc.setFont(new wijmo.pdf.PdfFont('nanum'));
    
    return doc;
}

/**
 * 그리드를 pdf에 삽입시 변경해주는 함수
 * @param {*} grid 그리드 객체
 * @param {*} doc pdfDocuemnt 객체
 * @param {*} width 그리드 가로사이즈 (세로출력시 550이 꽉찬사이즈, 가로출력시730)
 * @param {*} height 그리드 높이사이즈 (자동 처리시 null)
 */
export const gridPdfConverter = (grid,doc,width,height)=>{
 
    //공통 셋팅
    let settings = {
        styles:{
            cellStyle: { backgroundColor: '#ffffff', borderColor: '#c6c6c6' ,font:{family:'nanum'}},
            altCellStyle: { backgroundColor: '#f9f9f9' },
            groupCellStyle: { backgroundColor: '#dddddd' },
            headerCellStyle: { backgroundColor: '#eaeaea' },
            
        },
        embeddedFonts:[
            {
                source: '/font/NanumGothic/NanumGothic.ttf',
                name:'nanum',
                style:'normal',
                weight: 'nomal',
                sansSerif: true
            }
        ]
    };

    wijmo.grid.pdf.FlexGridPdfConverter.draw(grid,doc,width,height,settings);

}

/**
 * 폰트변경시 호출
 * 기본 폰트사이즈(10),스타일(normal), 굵기(normal)로 셋팅되어 있음.
 * @returns 
 */
export const pdfFont = ()=> {return new wijmo.pdf.PdfFont('nanum',10,'normal','normal');};
