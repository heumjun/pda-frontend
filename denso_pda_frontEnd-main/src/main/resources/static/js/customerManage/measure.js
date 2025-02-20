import GridFactory from "../common/wijmo/gridFactory.js";
import * as input from "../common/wijmo/inputFactory.js";
import * as ajax from "../common/ajax.js";
import * as dateUtils from "../common/dateUtils.js";
import * as consts from "../common/constants.js";
import * as commonRestApi from "../common/commonRestApi.js";
import { pushMsg,alertError,alertWarning,alertInfo,confirm } from "../common/msgBox.js";
import * as commonFunc from "../common/common.js";

const measure = function(){

    let dataMapSex =  new wijmo.grid.DataMap([{key:'M',name:'남자'},{key:'F',name:'여자'}], 'key', 'name');
    let customerGrid = new GridFactory('#customerGrid');
    let measureGrid = new GridFactory('#measureGrid');

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
                        getMeasureList(ctx.item.cusNo)
                    }
                })
            },
            {binding:'cusName',header:'이름',width:80,dataType:'String',align:'center',maxLength:50,
                cellTemplate: wijmo.grid.cellmaker.CellMaker.makeLink({
                    click:(e,ctx)=>{
                        $('#selectNo').text(`${ctx.item.cusName} (${ctx.item.cusNo})`);
                        $('#selectNo').data('no',ctx.item.cusNo);
                        getMeasureList(ctx.item.cusNo)
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
     * 측정결과 등록 리스트
     */
    const measureGridInit = ()=>{

        let inputDate = input.date(document.createElement('div'));
        let inputInbody = input.number(document.createElement('div'),1,0,100,'g0')
        let inputKg = input.number(document.createElement('div'),1,0,100,'g1')

        let columnsDefinition = [
            {binding:'select',header:' ',width:30,dataType:'Boolean',isRequired:false},
            {binding:'meaDate',header:'등록일자',width:120,dataType:'Date',align:'center',editor:inputDate},
            {binding:'meaInbody',header:'인바디점수',width:100,dataType:'Number',align:'center',editor:inputInbody},
            {binding:'meaKg',header:'체중',width:100,dataType:'Number',editor:inputKg,format:'g1'},
            {binding:'meaMuscle',header:'골격근량',width:100,dataType:'Number',editor:inputKg,format:'g1'},
            {binding:'meaFat',header:'체지방량',width:100,dataType:'Number',editor:inputKg,format:'g1'},
            {binding:'meaRmk',header:'비고',width:'*',dataType:'String',align:'left',maxLength:2000},
            {binding:'meaIndte',header:'등록일자',width:80,dataType:'Date',align:'center',isReadOnly:true,visible:false},
            {binding:'meaUpdte',header:'수정일자',width:80,dataType:'Date',align:'center',isReadOnly:true,visible:false},
            {binding:'meaRegid',header:'등록자',width:80,dataType:'String',align:'center',isReadOnly:true,visible:false},
            
        ];

        measureGrid.setColumnsDefinition(columnsDefinition);
        measureGrid.setDynamicHeight(690);
        measureGrid.checkBoxColumns(['select']);
        measureGrid._flexGrid.newRowAtTop = true;
        measureGrid.optionPanel('#measureGrid-option');


        measureGrid._flexCv.getError = (item,prop)=>{
            //셀수정모드 일경우 오류검증 안함 (포커스 이동이 안됨으로)
            if(measureGrid._flexCv.isEditingItem) return null;
                
            switch (prop) {
                case 'meaDate':
                    if(wijmo.isNullOrWhiteSpace(item.meaDate)) return '[등록일자]를 입력하세요.';
                    break;
                case 'meaInbody':
                    if(wijmo.isNullOrWhiteSpace(item.meaInbody)) return '[인바디 점수]을 입력하세요.';
                    break;
                case 'meaKg':
                    if(wijmo.isNullOrWhiteSpace(item.meaKg)) return '[체중]을을 입력하세요.';
                    break;
                case 'meaMuscle':
                    if(wijmo.isNullOrWhiteSpace(item.meaMuscle)) return '[골격근량량]를 입력하세요.';
                    break;    
                case 'meaFat':
                    if(wijmo.isNullOrWhiteSpace(item.meaFat)) return '[체지방량량]을 입력하세요.';
                    break;                                
                default:
                    return null;
            }
        }
        
    }
    /**
     * 고객 측정결과
     * @param {*} no 고객번호
     */
    const getMeasureList = async (no)=>{

        let params = {
            uri: `customer-info/measures/${no}`,
        };
        try {
            let {measureList} = await ajax.getAjax(params,true);
            measureGrid._flexCv.sourceCollection = measureList.map(item=>({...item,select:false}));
            pushMsg(`${measureGrid.getRowCnt()}행 조회 되었습니다.`);

            $('#btn-add').prop('disabled',false);
            $('#btn-save').prop('disabled',false);
            $('#btn-delete').prop('disabled',false);

        } catch (error) {
            console.debug(error);
        }
    }


    /**
     * 저장
     * @returns 
     */
    const saveOfMeasure = ()=>{
        if(!authrity.ins){
            alertWarning('작업불가','권한이 없습니다.');
            return;
        }
        measureGrid.disableAutoRows();

        let no = $('#selectNo').data('no');
        
        if(wijmo.isNullOrWhiteSpace(no)){
            alertWarning('저장불가','고객을 선택해주세요.');
            return;
        }

        if(!measureGrid.gridValidation()){
            alertWarning('저장불가','그리드 오류내역을 확인하세요.');
            return;
        }

        let insertList = measureGrid.gridItemListToArray(measureGrid._flexCv.itemsAdded);
        let updateList = measureGrid.gridItemListToArray(measureGrid._flexCv.itemsEdited);
        let saveList = [...insertList, ...updateList];
        saveList.forEach(item=>item.meaNo = no);

        if(saveList.length<1){
            alertWarning('저장불가','저장할 내역이 없습니다.');
            return;
        }

        confirm('저장 하시겠습니까?','추가 및 수정된 내역이 저장됩니다.',consts.MSGBOX.QUESTION,()=>{
            let params = {
                uri: `customer-info/measures`,
                saveList: saveList,
            };
            ajax.postAjax(params,true).then(async data=>{
                await getMeasureList(no);
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
    const deleteOfMeasure = ()=>{
        if(!authrity.del){
            alertWarning('작업불가','권한이 없습니다.');
            return;
        }
        measureGrid.disableAutoRows();

        let no = $('#selectNo').data('no');
        
        if(wijmo.isNullOrWhiteSpace(no)){
            alertWarning('저장불가','고객을 선택해주세요.');
            return;
        }

        let checkList = measureGrid.getCheckList('select');

        if(wijmo.isEmpty(checkList)){
            alertWarning('삭제불가','선택된 내역이 없습니다.');
            return;
        }
        let deleteList = checkList.filter(item=>{
            if(measureGrid._flexCv.itemsAdded.some(f=>f==item)){
                measureGrid._flexCv.remove(item);
                return false;
            }
            return true;
        });

        if(wijmo.isEmpty(deleteList)) return;

        confirm('삭제 하시겠습니까?','선택된 내역이 삭제됩니다.',consts.MSGBOX.QUESTION,()=>{
            let params = {
                uri: `customer-info/measures`,
                deleteList: deleteList
            }
            ajax.deleteAjax(params,true).then(async ()=>{
                await getMeasureList(no);
                pushMsg('삭제 되었습니다.');
            }).catch((e)=>{});
        });
        

    }
    /**
     * 버튼,input박스 등 모든 이벤트관리
     */
    const handleEvent = async ()=>{

        customerGridInit();
        measureGridInit();

        $('.btn-customerGrid-refresh').on('click',customerSearch);
        $('#btn-add').on('click',()=>{
            measureGrid.enableAutoRows();
            measureGrid.moveFocus(0,'meaDate');
        });
        $('#btn-save').on('click',saveOfMeasure);
        $('#btn-delete').on('click',deleteOfMeasure);
        
        $('#btn-add').prop('disabled',true);
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
        input.nextFocusEvent('#searchEnddat','#btn-search');
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
    measure.init();
    
});
