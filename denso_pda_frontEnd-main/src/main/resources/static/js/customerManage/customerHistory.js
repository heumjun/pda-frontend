import GridFactory from "../common/wijmo/gridFactory.js";
import * as input from "../common/wijmo/inputFactory.js";
import * as ajax from "../common/ajax.js";
import * as dateUtils from "../common/dateUtils.js";
import * as consts from "../common/constants.js";
import * as commonRestApi from "../common/commonRestApi.js";
import { pushMsg,alertError,alertWarning,alertInfo,confirm } from "../common/msgBox.js";
import * as commonFunc from "../common/common.js";

const history = function(){

    let dataMapSex =  new wijmo.grid.DataMap([{key:'M',name:'남자'},{key:'F',name:'여자'}], 'key', 'name');
    let customerGrid = new GridFactory('#customerGrid');
    
    let healthGrid = new GridFactory('#healthGrid');
    let dietGrid = new GridFactory('#dietGrid');
    let trainerGrid = new GridFactory('#trainerGrid');


    //페이지 권한
    let dataParams = $('#data-params').data('params');
    const authrity = {ins:dataParams.athIns,del:dataParams.athDel};
    
    
    /**
     * 그리드 초기화
     */
    const customerGridInit = ()=>{
        
        let columnsDefinition = [
        
            {binding:'cusNo',header:'고객번호',width:100,dataType:'String',align:'center',isReadOnly:true,maxLength:20,
                cellTemplate: wijmo.grid.cellmaker.CellMaker.makeLink({
                    click:(e,ctx)=>{
                        $('#selectNo').text(`${ctx.item.cusName} (${ctx.item.cusNo})`);
                        $('#selectNo').data('no',ctx.item.cusNo);
                        getHistoryList(ctx.item.cusNo)
                    }
                })
            },
            {binding:'cusName',header:'이름',width:80,dataType:'String',align:'center',maxLength:50,
                cellTemplate: wijmo.grid.cellmaker.CellMaker.makeLink({
                    click:(e,ctx)=>{
                        $('#selectNo').text(`${ctx.item.cusName} (${ctx.item.cusNo})`);
                        $('#selectNo').data('no',ctx.item.cusNo);
                        getHistoryList(ctx.item.cusNo)
                    }
                })
            },
            {binding:'cusBirth',header:'생년월일',width:110,dataType:'Date',align:'center'},
            {binding:'cusSex',header:'성별',width:70,dataType:'String',align:'center',dataMap:dataMapSex},
            {binding:'cusId',header:'아이디',width:100,dataType:'String',align:'left'},
            {binding:'cusTrainerId',header:'담당트레이너',width:100,dataType:'String',align:'left',maxLength:100},
            {binding:'cusJoindat',header:'등록일자',width:110,dataType:'Date',align:'center'},
            {binding:'cusHealthCode',header:'운동프로그램',width:150,dataType:'String',align:'left',maxLength:100},
            {binding:'cusDietCode',header:'식단프로그램',width:150,dataType:'String',align:'left',maxLength:100},
            
            {binding:'cusRmk',header:'비고',width:200,dataType:'String',align:'left',maxLength:2000},
            {binding:'cusIndte',header:'등록일자',width:80,dataType:'Date',align:'center',isReadOnly:true,visible:false},
            {binding:'cusUpdte',header:'수정일자',width:80,dataType:'Date',align:'center',isReadOnly:true,visible:false},
            {binding:'cusRegid',header:'등록자',width:80,dataType:'String',align:'center',isReadOnly:true,visible:false},
            
        ];

        customerGrid.setColumnsDefinition(columnsDefinition);
        customerGrid.setDynamicHeight(660);
        
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
     * 이력조회
     * @param {String} no 
     */
    const getHistoryList = async (no) => {
        getHealthHistoryList(no);
        getDietHistoryList(no)
        getTrainerHistoryList(no)
        $('#btn-save').prop('disabled',false);
        $('#btn-delete').prop('disabled',false);

    }

    
    /**
     * 운동 프로그램 그리드 초기화
     */
    const healthGridInit = ()=>{

        let inputDate = input.date(document.createElement('div'));
        
        let columnsDefinition = [
            {binding:'select',header:' ',width:30,dataType:'Boolean',isRequired:false},
            {binding:'chhNo',header:'고객번호',width:120,dataType:'Date',align:'center',isReadOnly:true},
            {binding:'cusName',header:'고객명',width:120,dataType:'Date',align:'center',isReadOnly:true},
            {binding:'chhCodename',header:'운동프로그램',width:200,dataType:'Number',align:'center',isReadOnly:true},
            {binding:'chhSdate',header:'시작일자',width:120,dataType:'Date',align:'center',editor:inputDate},
            {binding:'chhEdate',header:'종료일자',width:120,dataType:'Date',align:'center',editor:inputDate},
            {binding:'chhIndte',header:'등록일자',width:80,dataType:'Date',align:'center',isReadOnly:true},
            {binding:'chhUpdte',header:'수정일자',width:80,dataType:'Date',align:'center',isReadOnly:true},
            {binding:'regName',header:'등록자',width:80,dataType:'String',align:'center',isReadOnly:true},
            
        ];

        healthGrid.setColumnsDefinition(columnsDefinition);
        healthGrid.setDynamicHeight(400);
        healthGrid.checkBoxColumns(['select']);
        healthGrid.optionPanel('#healthGrid-option');

        
    }

    
    /**
     * 운동프로그램 이력 조회
     * @param {*} no 고객번호
     */
    const getHealthHistoryList = async (no)=>{

        let params = {
            uri: `customer-info/history/healths/${no}`,
        };
        try {
            let {healthHistoryList} = await ajax.getAjax(params,true);
            healthGrid._flexCv.sourceCollection = healthHistoryList.map(item=>({...item,select:false}));
            pushMsg(`${healthGrid.getRowCnt()}행 조회 되었습니다.`);

        } catch (error) {
            console.debug(error);
        }
    }

    
    /**
     * 식단 그리드 초기화
     */
    const dietGridInit = ()=>{

        let inputDate = input.date(document.createElement('div'));
        
        let columnsDefinition = [
            {binding:'select',header:' ',width:30,dataType:'Boolean',isRequired:false},
            {binding:'cdhNo',header:'고객번호',width:120,dataType:'Date',align:'center',isReadOnly:true},
            {binding:'cusName',header:'고객명',width:120,dataType:'Date',align:'center',isReadOnly:true},
            {binding:'cdhCodename',header:'운동프로그램',width:200,dataType:'Number',align:'center',isReadOnly:true},
            {binding:'cdhSdate',header:'시작일자',width:120,dataType:'Date',align:'center',editor:inputDate},
            {binding:'cdhEdate',header:'종료일자',width:120,dataType:'Date',align:'center',editor:inputDate},
            {binding:'cdhIndte',header:'등록일자',width:80,dataType:'Date',align:'center',isReadOnly:true},
            {binding:'cdhUpdte',header:'수정일자',width:80,dataType:'Date',align:'center',isReadOnly:true},
            {binding:'regName',header:'등록자',width:80,dataType:'String',align:'center',isReadOnly:true},
            
        ];

        dietGrid.setColumnsDefinition(columnsDefinition);
        dietGrid.setDynamicHeight(400);
        dietGrid.checkBoxColumns(['select']);
        dietGrid.optionPanel('#dietGrid-option');

    }

    
    /**
     * 고객 식단이력 조회
     * @param {*} no 고객번호
     */
    const getDietHistoryList = async (no)=>{

        let params = {
            uri: `customer-info/history/diet/${no}`,
        };
        try {
            let {dietHistoryList} = await ajax.getAjax(params,true);
            dietGrid._flexCv.sourceCollection = dietHistoryList.map(item=>({...item,select:false}));
            pushMsg(`${dietGrid.getRowCnt()}행 조회 되었습니다.`);

        } catch (error) {
            console.debug(error);
        }
    }

    /**
     * 트레이너이력 그리드 초기화
     */
    const trainerGridInit = ()=>{

        let inputDate = input.date(document.createElement('div'));
        
        let columnsDefinition = [
            {binding:'select',header:' ',width:30,dataType:'Boolean',isRequired:false},
            {binding:'cthNo',header:'고객번호',width:120,dataType:'Date',align:'center',isReadOnly:true},
            {binding:'cusName',header:'고객명',width:120,dataType:'Date',align:'center',isReadOnly:true},
            {binding:'trainer',header:'트레이너명',width:200,dataType:'Number',align:'center',isReadOnly:true},
            {binding:'cthSdate',header:'시작일자',width:120,dataType:'Date',align:'center',editor:inputDate},
            {binding:'cthEdate',header:'종료일자',width:120,dataType:'Date',align:'center',editor:inputDate},
            {binding:'cthIndte',header:'등록일자',width:80,dataType:'Date',align:'center',isReadOnly:true},
            {binding:'cthUpdte',header:'수정일자',width:80,dataType:'Date',align:'center',isReadOnly:true},
            {binding:'regName',header:'등록자',width:80,dataType:'String',align:'center',isReadOnly:true},
            
        ];

        trainerGrid.setColumnsDefinition(columnsDefinition);
        trainerGrid.setDynamicHeight(400);
        trainerGrid.checkBoxColumns(['select']);
        trainerGrid.optionPanel('#trainerGrid-option');

    }

    
    /**
     * 고객 측정결과
     * @param {*} no 고객번호
     */
    const getTrainerHistoryList = async (no)=>{

        let params = {
            uri: `customer-info/history/trainer/${no}`,
        };
        try {
            let {trainerHistoryList} = await ajax.getAjax(params,true);
            trainerGrid._flexCv.sourceCollection = trainerHistoryList.map(item=>({...item,select:false}));
            pushMsg(`${trainerGrid.getRowCnt()}행 조회 되었습니다.`);

        } catch (error) {
            console.debug(error);
        }
    }

    /**
     * 저장
     * @returns 
     */
    const saveOfHistory = ()=>{
        if(!authrity.ins){
            alertWarning('작업불가','권한이 없습니다.');
            return;
        }
        
        let no = $('#selectNo').data('no');
        
        if(wijmo.isNullOrWhiteSpace(no)){
            alertWarning('저장불가','고객을 선택해주세요.');
            return;
        }

        let healthList = [...healthGrid.gridItemListToArray(healthGrid._flexCv.itemsAdded),...healthGrid.gridItemListToArray(healthGrid._flexCv.itemsEdited)];
        let dietList = [...dietGrid.gridItemListToArray(dietGrid._flexCv.itemsAdded),...dietGrid.gridItemListToArray(dietGrid._flexCv.itemsEdited)];
        let trainerList = [...trainerGrid.gridItemListToArray(trainerGrid._flexCv.itemsAdded),...trainerGrid.gridItemListToArray(trainerGrid._flexCv.itemsEdited)];

        if(healthList.length<1 && dietList.length<1 && trainerList.length<1){
            alertWarning('저장불가','저장할 내역이 없습니다.');
            return;
        }

        confirm('저장 하시겠습니까?','추가 및 수정된 내역이 저장됩니다.',consts.MSGBOX.QUESTION,()=>{
            let params = {
                uri: `customer-info/history/${no}`,
                saveHealthList: healthList,
                saveDietList: dietList,
                saveTrainerList: trainerList,
            };
            ajax.putAjax(params,true).then(async data=>{
                await getHistoryList(no);
                pushMsg('저장 되었습니다.');
            }).catch((e)=>{
                console.debug(e);
            });
        });
        
    }

    /**
     * 삭제
     * @returns 
     */
    const deleteOfHistory = ()=>{
        if(!authrity.del){
            alertWarning('작업불가','권한이 없습니다.');
            return;
        }
        
        let no = $('#selectNo').data('no');
        
        if(wijmo.isNullOrWhiteSpace(no)){
            alertWarning('삭제불가','고객을 선택해주세요.');
            return;
        }

        let healthCheckList = healthGrid.getCheckList('select');
        let dietCheckList = dietGrid.getCheckList('select');
        let trainerCheckList = trainerGrid.getCheckList('select');

        if(healthCheckList.filter(f=>wijmo.isNullOrWhiteSpace(f.chhEdate)).length>0){
            alertWarning('삭제불가','운동프로그램의 가장최근 이력은 삭제할 수 없습니다.');
            return;
        }

        if(dietCheckList.filter(f=>wijmo.isNullOrWhiteSpace(f.cdhEdate)).length>0){
            alertWarning('삭제불가','식단프로그램의 가장최근 이력은 삭제할 수 없습니다.');
            return;
        }

        if(trainerCheckList.filter(f=>wijmo.isNullOrWhiteSpace(f.cthEdate)).length>0){
            alertWarning('삭제불가','담당트레이너의 가장최근 이력은 삭제할 수 없습니다.');
            return;
        }
            

        if(wijmo.isEmpty(healthCheckList) && wijmo.isEmpty(dietCheckList) && wijmo.isEmpty(trainerCheckList) ){
            alertWarning('삭제불가','선택된 내역이 없습니다.');
            return;
        }
        
        confirm('삭제 하시겠습니까?','선택된 내역이 삭제됩니다.',consts.MSGBOX.QUESTION,()=>{
            let params = {
                uri: `customer-info/history/${no}`,
                deleteHealthList: healthCheckList,
                deleteDietList : dietCheckList,
                deleteTrainerList: trainerCheckList
            }
            ajax.deleteAjax(params,true).then(async ()=>{
                await getHistoryList(no);
                pushMsg('삭제 되었습니다.');
            }).catch((e)=>{});
        });
        

    }
    /**
     * 버튼,input박스 등 모든 이벤트관리
     */
    const handleEvent = async ()=>{

        customerGridInit();
        healthGridInit();
        dietGridInit();
        trainerGridInit();

        $('.btn-customerGrid-refresh').on('click',customerSearch);
        $('.btn-health-refresh').on('click',()=>{
            let no = $('#selectNo').data('no');
            if(wijmo.isNullOrWhiteSpace(no)) return;
            getHealthHistoryList(no);
        });

        $('.btn-diet-refresh').on('click',()=>{
            let no = $('#selectNo').data('no');
            if(wijmo.isNullOrWhiteSpace(no)) return;
            getDietHistoryList(no);
        });

        $('.btn-trainer-refresh').on('click',()=>{
            let no = $('#selectNo').data('no');
            if(wijmo.isNullOrWhiteSpace(no)) return;
            getTrainerHistoryList(no);
        });

        
        $('#btn-save').on('click',saveOfHistory);
        $('#btn-delete').on('click',deleteOfHistory);
        
        //$('#btn-add').prop('disabled',true);
        $('#btn-save').prop('disabled',true);
        $('#btn-delete').prop('disabled',true);
                

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
        // input.nextFocusEvent('#searchEnddat','#btn-search');
    }

    
    return{
        init:()=>{
            handleEvent();
            handleFocus();
            customerSearch();
        }
    }
}();


$(()=>{
    history.init();
    
});
