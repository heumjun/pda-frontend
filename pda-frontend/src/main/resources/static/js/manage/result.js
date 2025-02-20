import GridFactory from "../common/wijmo/gridFactory.js";
import * as input from "../common/wijmo/inputFactory.js";
import * as ajax from "../common/ajax.js";
import * as dateUtils from "../common/dateUtils.js";
import * as consts from "../common/constants.js";
import * as commonRestApi from "../common/commonRestApi.js";
import { pushMsg,alertError,alertWarning,alertInfo,confirm } from "../common/msgBox.js";
import * as commonFunc from "../common/common.js";

const result = function(){

    let grid = new GridFactory('#resultGrid');
    let searchStartdat = input.date('#searchStartdat',dateUtils.firstDayOfThisMonth('YYYY-MM-DD'));
    let searchEnddat = input.date('#searchEnddat',dateUtils.lastDayOfThisMonth('YYYY-MM-DD'));
    
    //페이지 권한
    let dataParams = $('#data-params').data('params');
    const authrity = {ins:dataParams.athIns,del:dataParams.athDel};
    

    /**
     * 운동프로그램 차트 초기화
     */
    const gridInit = ()=>{

        let inputDate = input.date(document.createElement('div'));
        let dataMapSex =  new wijmo.grid.DataMap([{key:'M',name:'남자'},{key:'F',name:'여자'}], 'key', 'name');

        let columnsDefinition = [
            {binding:'cusNo',header:'고객번호',width:100,dataType:'String',align:'center',allowMerging:true},
            {binding:'cusName',header:'이름',width:80,dataType:'String',align:'center',allowMerging:true},
            {binding:'cusSex',header:'성별',width:70,dataType:'String',align:'center',dataMap:dataMapSex,allowMerging:true},
            {binding:'cusJoindat',header:'가입일자',width:110,dataType:'Date',align:'center',editor:inputDate,allowMerging:true},
            {binding:'hemName',header:'운동프로그램',width:120,dataType:'String',align:'left',allowMerging:true},
            {binding:'dimName',header:'식단프로그램',width:120,dataType:'String',align:'left',allowMerging:true},
            {binding:'traName',header:'담당트레이너',width:100,dataType:'String',align:'center',allowMerging:true},
            {binding:'flag',header:'구분',width:100,dataType:'String',align:'center',
                cellTemplate:(ctx)=>{
                    return ctx.value==1? '운동 달성률':'식단 달성률';
                }
            },
            {binding:'chart',header:'달성률(%)',width:'*',dataType:'String',align:'left',},
        ];
        consts.wijmoColumns.allowMerging
        grid.setColumnsDefinition(columnsDefinition);
        grid.optionPanel('#resultGrid-option');
        grid.setDynamicHeight(640);
        grid.isReadOnly();
        
        grid._flexGrid.formatItem.addHandler((s,e)=>{
            if(e.panel.cellType===wijmo.grid.CellType.Cell){
                if(s.columns[e.col].binding==='chart'){
                    e.cell.innerHTML = '';
                    
                    let dataItem = s.rows[e.row].dataItem;
                    let color = dataItem.flag==1?'bg-success':'bg-warning';
                    let per = 0;
                    if(dataItem.cnt>0){
                        per = parseInt(dataItem.cnt/dataItem.days * 100);
                    }
                    let sss = `<div class="progress w-100" style="height:15px">
                                 <div class="progress-bar progress-bar-striped ${color} " role="progressbar" style="width: ${per}%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">${per}%</div>
                               </div>`;
                    //console.debug(sss);

                    e.cell.innerHTML=sss;

                }
            }
        });

        /**
         * 이전 열의 셀 값이 같을경우 allowMerging = true인 셀에 한해 세로 병합
         */
        grid._flexGrid.mergeManager = new RestrictedMergeManager();
        

    }

    
    /**
     * 고객별 운동프로그램,식단 달성률
     */
    const getCustomerExcuteResult = async ()=>{
        
        // let result = [
        //     {cusNo:'100100001',cusName:'정윤재',cusSex:'M',cnt:7,days:30,flag:'H'},
        //     {cusNo:'100100001',cusName:'정윤재',cusSex:'M',cnt:25,days:30,flag:'D'}
        // ]
        
        
        try {
            let params = {
                uri: `customer-info/healths/excutes/result`,
                startDat: searchStartdat.text,
                endDat:searchEnddat.text
            }
            let {healthExcuteResult} = await ajax.getAjax(params,true);

            params.uri = `customer-info/diets/excutes/result`;
            let {dietExcuteResult} = await ajax.getAjax(params,true);

            let result = [...healthExcuteResult,...dietExcuteResult];
            result.sort((a,b)=>{
                // cusNo 기준으로 정렬
                if (a.cusNo < b.cusNo) return -1;
                if (a.cusNo > b.cusNo) return 1;
            
                // cusNo가 동일하면 flag 기준으로 정렬
                return a.flag - b.flag;
            });

            console.debug(result);
            grid._flexCv.sourceCollection = result;
            pushMsg('조회 되었습니다.');

        } catch (error) {
            console.debug(error);    
        }
        


        

    }

    /**
     * 버튼,input박스 등 모든 이벤트관리
     */
    const handleEvent = ()=>{
        gridInit();
        
        $('#btn-search').on('click',getCustomerExcuteResult);

        
        getCustomerExcuteResult();

        
    }

    
    /**
     * input 박스에서 엔터키 누를경우 포커스 이동
     */
    const handleFocus = ()=>{
        input.nextFocusEvent('#searchEnddat','#btn-search');
    }

    return{
        init:()=>{
            handleEvent();
            handleFocus();
        }
    }
}();

/**
 * 고객번호 열의 셀 값이 같을경우 allowMerging = true인 셀에 한해 세로 병합
 */
class RestrictedMergeManager extends wijmo.grid.MergeManager{
    getMergedRange(panel,r,c,clip = true){
        let rng = new wijmo.grid.CellRange(r,c);
        let col = panel.columns[c];

        // alloMerging = true 인 컬럼만 병합
        if (col.allowMerging){
            
            let val = panel.getCellData(r, 'cusNo', true);        //고객번호
            let pval = panel.getCellData(r, c, true);
            
            // expand up
            while (rng.row > 0 &&
                panel.getCellData(rng.row - 1, 'cusNo', true) == val &&
                panel.getCellData(rng.row - 1, c, true) == pval) {
                rng.row--;
            }
            
            // expand down
            while (rng.row2 < panel.rows.length - 1 &&
                panel.getCellData(rng.row2 + 1, 'cusNo', true) == val &&
                panel.getCellData(rng.row2 + 1, c, true) == pval) {
                rng.row2++;
            }
        } 
        
        // 병합된 셀이 하나라면 null반환
        if (rng.isSingleCell) {
            rng = null;
        }

        return rng;
        
    }
    
}

 
$(()=>{
    result.init();
    
});
