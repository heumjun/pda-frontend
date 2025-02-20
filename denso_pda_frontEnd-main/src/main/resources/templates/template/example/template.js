import GridFactory from "../common/wijmo/gridFactory.js";
import * as input from "../common/wijmo/inputFactory.js";
import * as ajax from "../common/ajax.js";
import * as dateUtils from "../common/dateUtils.js";
import * as consts from "../common/constants.js";
import * as commonRestApi from "../common/commonRestApi.js";
import { pushMsg,alertError,alertWarning,alertInfo,confirm } from "../common/msgBox.js";
import * as commonFunc from "../common/common.js";

const template = function(){

    /**
     * 그리드 초기화
     */
    const gridInit = ()=>{

        let columnsDefinition = [
            {binding:'select',header:' ',width:30,dataType:'Boolean',isRequired:false},
            {binding:'ex1',header:'String형',width:80,dataType:'String',align:'center',isReadOnly:true,maxLength:4},
            {binding:'ex2',header:'스위치버튼',width:80,dataType:wijmo.DataType.Boolean,align:'center', cssClass:'switch'},
            {binding:'ex3',header:'날짜형',width:80,dataType:'Date',align:'center',isReadOnly:true},
            
        ];

        grid.setColumnsDefinition(columnsDefinition);
        grid.setDynamicHeight(660);
        grid.checkBoxColumns(["select"]);

        grid._flexCv.getError = (item,prop)=>{
            //셀수정모드 일경우 오류검증 안함 (포커스 이동이 안됨으로)
            if(grid._flexCv.isEditingItem) return null;
                
            switch (prop) {
                case '':
                    if(조건문) return '[내용]를 입력하세요.';
                    break;
                default:
                    return null;
            }
        }
        
    }
    /**
     * 버튼,input박스 등 모든 이벤트관리
     */
    const handleEvent = ()=>{

        

    }

    /**
     * 조회 함수
     */
    const searchFunction = async ()=>{
        grid.disableAutoRows();

        let params = {
            uri: ``,
            
        }
        await ajax.postAjax(params,true).then(data=>{
            pushMsg('조회 되었습니다.');
        }).catch((e)=>{});
    }

    const saveFunction = ()=>{
        grid.disableAutoRows();

        if(!grid.gridValidation()){
            alertWarning('저장불가','그리드 오류내역을 확인하세요.');
            return;
        }

        let insertList = grid.gridItemListToArray(grid._flexCv.itemsAdded);
        let updateList = grid.gridItemListToArray(grid._flexCv.itemsEdited);

        if(insertList.length<1 && updateList.length<1){
            alertWarning('저장불가','저장할 내역이 없습니다.');
            return;
        }

        confirm('저장 하시겠습니까?','추가 및 수정된 내역이 저장됩니다.',consts.MSGBOX.QUESTION,()=>{
            let params = {
                uri: ``,
                insertList: insertList,
                updateList: updateList,
            };
            ajax.postAjax(params,true).then((data)=>{
                pushMsg('저장 되었습니다.');
            }).catch((e)=>{
                console.debug(e);
            });
        });
    }
    /**
     * 그리드 선택된 내역 삭제
     * @returns 
     */
    const deleteFunction = ()=>{
        grid.disableAutoRows();

        let checkList = grid.getCheckList('select');

        if(wijmo.isEmpty(checkList)){
            alertWarning('삭제불가','선택된 내역이 없습니다.');
            return;
        }

        //삭제할 내역중 추가된내역(itemsAdded 포함되어있는 내역)은 DB에 반영안된 내역으로 그냥 리스트에서 제거 하면 됨.
        //db에 있는 데이터를 걸러서 삭제 구문을 타게 한다.
        let deleteList = checkList.filter(item=>{
            if(grid._flexCv.itemsAdded.some(f=>f==item)){
                grid._flexCv.remove(item);
                return false;
            }
            return true;
        });

        if(wijmo.isEmpty(deleteList)) return;

        confirm('삭제하시겠습니까?','선택된 내역이 삭제됩니다.',consts.MSGBOX.ERROR,()=>{
            let params = {
                uri: ``,
                deleteList: deleteList
            }
            ajax.deleteAjax(params,true).then(async ()=>{
                await searchFunction();
                pushMsg('삭제 되었습니다.');
                
            }).catch((e)=>{});
        });
    }

    /**
     * input 박스에서 엔터키 누를경우 포커스 이동
     */
    const handleFocus = ()=>{
        input.nextFocusEvent('#이벤트발생 input ID','#이동되는 input ID');
    }

    return{
        init:()=>{
            handleEvent();
            handleFocus();
        }
    }
}();


$(()=>{
    template.init();
    
});
