import GridFactory from "../common/wijmo/gridFactory.js";
import * as input from "../common/wijmo/inputFactory.js";
import * as ajax from "../common/ajax.js";
import * as dateUtils from "../common/dateUtils.js";
import * as consts from "../common/constants.js";
import * as commonRestApi from "../common/commonRestApi.js";
import { pushMsg,alertError,alertWarning,alertInfo,confirm } from "../common/msgBox.js";
import * as commonFunc from "../common/common.js";

const diet = function(){

    let dataMapSex =  new wijmo.grid.DataMap([{key:'M',name:'남자'},{key:'F',name:'여자'}], 'key', 'name');
    let customerGrid = new GridFactory('#customerGrid');
    let dietGrid = new GridFactory('#dietGrid');

    //페이지 권한
    let dataParams = $('#data-params').data('params');
    const authrity = {ins:dataParams.athIns,del:dataParams.athDel};
    

    let startDat = input.date('#startDat');
    let endDat = input.date('#endDat');

    startDat.value = dateUtils.addMonth(dateUtils.today(),-1,'YYYY-MM-DD');
    endDat.value = dateUtils.today();
    
    /**
     * 그리드 초기화
     */
    const customerGridInit = ()=>{

        const loadCustomerInfo = (item)=>{

            $('#customerName').text(`${item.cusName} (만 ${dateUtils.calculateAge(item.cusBirth)}세) 고객번호: ${item.cusNo}`);
            $('#customerName').data('no',item.cusNo);
                        
            $('#customerJoinDate').text(dateUtils.formatDate(item.cusJoindat,'YYYY년 MM월 DD일'))

            let customerDiet = customerGrid._flexGrid.getColumn('cusDietCode').dataMap.getDisplayValue(item.cusDietCode);
            $('#customerDiet').text(customerDiet);

            let cusTrainerId = customerGrid._flexGrid.getColumn('cusTrainerId').dataMap.getDisplayValue(item.cusTrainerId);
            $('#customerTrainer').text(cusTrainerId);
        }
        
        let columnsDefinition = [
        
            {binding:'cusNo',header:'고객번호',width:100,dataType:'String',align:'center',isReadOnly:true,maxLength:20,
                cellTemplate: wijmo.grid.cellmaker.CellMaker.makeLink({
                    click:(e,ctx)=>{
                        
                        loadCustomerInfo(ctx.item);
                        getDietExcuteList(ctx.item.cusNo);
                    }
                })
            },
            {binding:'cusName',header:'이름',width:80,dataType:'String',align:'center',maxLength:50,
                cellTemplate: wijmo.grid.cellmaker.CellMaker.makeLink({
                    click:(e,ctx)=>{

                        loadCustomerInfo(ctx.item);
                        getDietExcuteList(ctx.item.cusNo);
                    }
                })
            },
            {binding:'cusBirth',header:'생년월일',width:110,dataType:'Date',align:'center'},
            {binding:'cusSex',header:'성별',width:70,dataType:'String',align:'center',dataMap:dataMapSex},
            {binding:'cusId',header:'아이디',width:100,dataType:'String',align:'left'},
            {binding:'cusTrainerId',header:'담당트레이너',width:100,dataType:'String',align:'left',maxLength:100},
            {binding:'cusJoindat',header:'가입일자',width:110,dataType:'Date',align:'center'},
            {binding:'cusHealthCode',header:'운동프로그램',width:150,dataType:'String',align:'left',maxLength:100},
            {binding:'cusDietCode',header:'식단프로그램',width:150,dataType:'String',align:'left',maxLength:100},
            
            {binding:'cusRmk',header:'비고',width:200,dataType:'String',align:'left',maxLength:2000},
            {binding:'cusIndte',header:'등록일자',width:80,dataType:'Date',align:'center',isReadOnly:true,visible:false},
            {binding:'cusUpdte',header:'수정일자',width:80,dataType:'Date',align:'center',isReadOnly:true,visible:false},
            {binding:'cusRegid',header:'등록자',width:80,dataType:'String',align:'center',isReadOnly:true,visible:false},
            
        ];

        customerGrid.setColumnsDefinition(columnsDefinition);
        customerGrid.setDynamicHeight(670);
        
        customerGrid.createSearchBox('#customerSearch');
        customerGrid.isReadOnly();

        
    }

    /**
     * 조회 함수
     */
    const customerSearch = async ()=>{
        
        let params = {
            uri: `customer-info/customers`
        }
        params = {...params,...ajax.getParams('#searchForm')};
        try {
            let {customerList} = await ajax.getAjax(params,true);
            customerGrid._flexCv.sourceCollection = customerList.map(item=>({...item,select:false}));
            pushMsg(`${customerGrid.getRowCnt()}행 조회 되었습니다.`);

        } catch (error) {
            console.debug(error);
        }
        
    }

    
    /**
     * 측정결과 등록 리스트
     */
    const dietGridInit = ()=>{

        
        let columnsDefinition = [
            {binding:'dexDate',header:'등록일',width:100,dataType:'Date',align:'center', allowMerging:true,},
            {binding:'dimName',header:'프로그램',width:170,dataType:'String',align:'center', allowMerging:true,},
            {binding:'didMeal',header:'식사',width:70,dataType:'String',align:'center'},
            {binding:'didMenu',header:'추천메뉴',width:200,dataType:'String',align:'center'},
            {binding:'dexMenu',header:'실제메뉴',width:200,dataType:'String',align:'center'},
            {binding:'dexPfile',header:'이미지',width:'*',dataType:'String',align:'center'},
            
        ];

        dietGrid.setColumnsDefinition(columnsDefinition);
        dietGrid.setDynamicHeight(550);
        dietGrid.isReadOnly();
        dietGrid.mergeCellAlignCenter(['dexDate','dimName']);
        /**
         * 특정 열의 셀 값이 같을경우 allowMerging = true인 셀에 한해 세로 병합
         */
        dietGrid._flexGrid.mergeManager = new RestrictedMergeManager();
        

        dietGrid._flexGrid.formatItem.addHandler((s,e)=>{
            if(e.panel===s.cells){
                if(s.columns[e.col].binding==='dexPfile'){
                    if(wijmo.isNullOrWhiteSpace(s.rows[e.row].dataItem.dexPfile)) return;
                    let imageUrl = `rest-api/image-view/diet/${s.rows[e.row].dataItem.dexPfile}`;
                    e.cell.innerHTML = `<a class="glightbox" href="${imageUrl}" data-gallery="gallery1" data-glightbox="data-glightbox">
                                            <img src ="${imageUrl}" width="100"></img>
                                        </a> `;
                    glightboxInit();
                }
            }
            
        });
        
    }
    /**
     * 고객 운동동결과
     * @param {*} no 고객번호
     */
    const getDietExcuteList = async (no)=>{

        if(wijmo.isNullOrWhiteSpace(no)){
            alertWarning('조회불가','고객번호가 없습니다.');
            return;
        }

        let params = {
            // uri: `customer-info/diets/${no}`,
            uri: `customer-info/diets/excutes/${no}`,
        };

        params = {...params,...ajax.getParams('#searchForm')};   
        
        try {
            let {dietExcuteList} = await ajax.getAjax(params,true);
            dietGrid._flexCv.sourceCollection = dietExcuteList;
            pushMsg(`${dietGrid.getRowCnt()}행 조회 되었습니다.`);

        } catch (error) {
            console.debug(error);
        }
    }


    
    /**
     * 버튼,input박스 등 모든 이벤트관리
     */
    const handleEvent = async ()=>{

        customerGridInit();
        dietGridInit();

        $('.btn-customerGrid-refresh').on('click',customerSearch);
        

        //운동프로그램,식단프로그램,담당트레이너 정보
        try {
            let {healthList} = await commonRestApi.getHealthList();
            customerGrid._flexGrid.getColumn('cusHealthCode').dataMap = new wijmo.grid.DataMap(healthList,'hemCode','hemName');
            
            let {dietMenuList} = await commonRestApi.getDietMenuList();
            customerGrid._flexGrid.getColumn('cusDietCode').dataMap = new wijmo.grid.DataMap(dietMenuList,'dimCode','dimName');

            let {trainerList} = await commonRestApi.getTrainerList();
            customerGrid._flexGrid.getColumn('cusTrainerId').dataMap = new wijmo.grid.DataMap(trainerList,'traId','traName');

        } catch (error) {
            console.debug(error);    
        }
        

    }

      
    /**
     * input 박스에서 엔터키 누를경우 포커스 이동
     */
    const handleFocus = ()=>{
        input.nextFocusEvent('#endDat','#btn-search');
        $('#btn-search').on('click',()=>{
            let no = $('#customerName').data('no');
            getDietExcuteList(no);
        })
    }

    
    return{
        init:()=>{
            handleEvent();
            handleFocus();
            customerSearch();
        }
    }
}();

class RestrictedMergeManager extends wijmo.grid.MergeManager{
    getMergedRange(panel,r,c,clip = true){
        let rng = new wijmo.grid.CellRange(r,c);
        let col = panel.columns[c];

        // alloMerging = true 인 컬럼만 병합
        if (col.allowMerging){
            
            let val = panel.getCellData(r, 'dexDate', true);        //등록일자
            let pval = panel.getCellData(r, c, true);
            
            // expand up
            while (rng.row > 0 &&
                panel.getCellData(rng.row - 1, 'dexDate', true) == val &&
                panel.getCellData(rng.row - 1, c, true) == pval) {
                rng.row--;
            }
            
            // expand down
            while (rng.row2 < panel.rows.length - 1 &&
                panel.getCellData(rng.row2 + 1, 'dexDate', true) == val &&
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
    diet.init();
    
});
