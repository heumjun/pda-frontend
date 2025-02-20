
/**
 * 그리드 더블클릭 이벤트
 */
grid._flexGrid.addEventListener(grid._flexGrid.hostElement,consts.JQUERYEVENT.DBLCLICK,(e)=>{
    let ht = grid._flexGrid.hitTest(e);     //더블클릭한 셀의 정보
    if(ht.panel==grid._flexGrid.cells){    //그리드 셀에 더블클릭했을때
        if(grid._flexGrid.getColumn(ht.col).binding=='aaaa'){  // aaaa 컬럼 더블클릭했을경우
            
        }
    }
});

/**
 * cellTemplate 사용해서 컬럼에 표시되는 내용 변경가능, formatItem도 있음.
 */
let genderDataMap = new wijmo.grid.DataMap([{key:'M',name:'남'},{key:'F',name:'여'}],'key','name');

let columnsDefinition = [
    // cellTemplate 사용시 필터를 적용하면 원래값으로 필터도 적용됨. 필터에도 cellTemplate과 같은 표현법으로 적용시키려면
    // 아래와같이 dataMap을 사용하면 된다.
    {binding:'Gender',header:'성별',width:50,dataType:'String',align:'center',isReadOnly:true, dataMap:genderDataMap,
        cellTemplate:(ctx)=>(`${ctx.value==='M'?"남":"<span class='text-danger'>여</span>"}`)
    },
    // 아래와같이 값을 바로 사용하기위한 wijmo.glbz 사용도 가능함.
    {binding:'mnaSab',header:'권한자사번',width:80,dataType:'String',align:'center',format:'g0',
        cellTemplate: (ctx)=>{
            //celltemplate에서 '' 를 사용해서 처리를 하지만  템플릿리터럴(`)을 쓰기위해 wijmo.glbz 사용함.
            return wijmo.glbz `
                <div class="d-flex align-items-center">
                    <div class="w-75 text-truncate">${ctx.value}</div>
                    <div class="fas fa-search w-25 cursor-pointer" data-bs-toggle="modal" data-bs-target="#modalSabun" data-target="#insertGrid"></div>
                </div>
            `
        }
    },   
];

/**
 * 그리드 오류체크
 * @param {*} item 
 * @param {*} prop 
 * @returns 
 */
grid._flexCv.getError = (item,prop)=>{
    switch (prop) {
        case 'cohCode':
            if(!item.cohCode) return '[그룹코드]를 입력하세요.';
            if(item.cohCode.getBytes()>4) return '[그룹코드]는 4자 이하로 입력하세요.';
            if(grid.isSameColumnValue(item,['cohCode'])) return '중복되는 [그룹코드]가 존재합니다.';
            break;
        default:
            break;
    }
    return null;
}

/**
 * 콤보박스 변경시 이벤트
 */
combo.selectedIndexChanged.addHandler((s,e)=>{
    s.selectedValue;
});


//셀편집이 시작되기 전에 발생되고 편집을 허용할지 여부를 결정할때사용
grid.beginningEdit.addHandler((s,e)=>{

})    
//셀편집이 끝나기전에 발생되고 입력된 값이 유효한지 확인    
grid.cellEditEnding.addHandler((s,e)=>{      
    s.activeEditor.value    //입력된 값 추출가능
})  


//=====================셀 수정, 붙여넣기 이벤트 같이 사용하기 ==================

const cellEventHandler = (s,e,value)=>{
    switch (s.columns[e.col].binding) {
        case '컬럼명':
            if(value==="") return;

            //서버로 다녀와야할경우 ajax 구분을 넣어서 처리함.
            break;
    }
}
//셀수정 이벤트
grid._flexGrid.cellEditEnding.addHandler((s,e)=>{
    //컬럼내용을 삭제할경우 activeEditor는 null 상태이다.
    let value = wijmo.isNullOrWhiteSpace(s.activeEditor)? "":s.activeEditor.value;
    cellEventHandler(s,e,value);
});

//셀 붙여넣기 이벤트
grid._flexGrid.pastingCell.addHandler((s,e)=>{
    //console.debug(e.data);
    let value = e.data;
    cellEventHandler(s,e,value);
});








 //부서코드 포커스 이동시 부서명산출
 searchSok.lostFocus.addHandler((s,e)=>{
    if(wijmo.isNullOrWhiteSpace(searchSok.text)){
        $('#searchSokName').val('');
        return;
    }

    commonRestApi.getDept(searchSok.text).then((data)=>{
        let deptInfo = data['deptInfo'];
        $('#searchSokName').val(deptInfo.sokName);
    });
    
});

/**
 * 위즈모 그리드 툴팁
 */
let tooltip = new wijmo.Tooltip();  //툴팁객체 생성
grid._flexGrid.formatItem.addHandler((s,e)=>{
    if(e.panel.cellType == wijmo.grid.CellType.ColumnHeader){   //컬럼헤드일때
        if(s.columns[e.col].binding =='aaa'){       //aaa 컬럼에 셀메모 추가
            wijmo.toggleClass(e.cell,'wj-has-notes',true);      //셀메모 모양css
            tooltip.setTooltip(e.cell,'<b>순서설정:</b></br>'+'0번 행을 아래,위로 드래그 하여 순서를 지정하세요.');
        }
    }
});



/**
 * 위즈모 인쇄관련
 */

//pdf인쇄 관련 모듈 import
import * as pdfPrint from "../../common/wijmo/pdfPrintFactory.js";

let doc = pdfPrint.pdfDocument('인쇄',wijmo.pdf.PdfPageOrientation.Landscape);
let titleFont = pdfPrint.pdfFont();
titleFont.size = 12;
titleFont.weight = 'bold';

doc.drawText('<인쇄정보 내역>',null,null,{font:titleFont,align:wijmo.pdf.PdfTextHorizontalAlign.Center});
doc.moveDown(2);
pdfPrint.gridPdfConverter(grid._flexGrid,doc,730,null);
doc.end();


/**
 * 모달관련 jquery사용시
 */
$('#modal').on('shown.bs.modal',function(e){})    //모달 나타날때 이벤트
$('#modal').on('hidden.bs.modal',function(e){});  //모달 사라질때 이벤트
$('#modal').modal('show');    //모달 열기
$('#modal').modal('hide');    //모달 닫기