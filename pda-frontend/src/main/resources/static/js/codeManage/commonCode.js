import GridFactory from "../common/wijmo/gridFactory.js";
import * as input from "../common/wijmo/inputFactory.js";
import * as ajax from "../common/ajax.js";
import * as dateUtils from "../common/dateUtils.js";
import * as consts from "../common/constants.js";
import { pushMsg,alertError,alertWarning,alertInfo,confirm } from "../common/msgBox.js";
import * as commonFunc from "../common/common.js";

const commonCode = function(){

    let groupCodeGrid = new GridFactory('#groupCodeGrid');
    let commonCodeGrid = new GridFactory('#commonCodeGrid');
    
    //페이지 권한
    let dataParams = $('#data-params').data('params');
    const authrity = {ins:dataParams.athIns,del:dataParams.athDel};
    
    /**
     * 그룹코드 그리드 초기화
     */
    const groupCodeGridInit = ()=>{
        let columnsDefinition = [
            {binding:'select',header:' ',width:30,dataType:'Boolean'},
            {binding:'codCount',header:'공통코드수',width:80,dataType:'Number',isReadOnly:true,
                cellTemplate: wijmo.grid.cellmaker.CellMaker.makeButton({
                    click:(e,ctx)=>{
                        $('#selectedGroupCode').text(ctx.item.cohCode+' ('+ctx.item.cohName+')');
                        $('#selectedGroupCode').data('groupCode',ctx.item.cohCode);
                        loadCommonCode(ctx.item.cohCode);
                    }
                })
            },
            {binding:'cohCode',header:'공통코드',width:70,dataType:'String',align:'center',isReadOnly:true,maxLength:4},
            {binding:'cohName',header:'공통코드명',width:140,dataType:'String',maxLength:20},
            {binding:'cohRmk',header:'설명',width:200,dataType:'String',maxLength:100},
            {binding:'cohIndte',header:'등록일자',width:80,dataType:'Date',align:'center',isReadOnly:true,visible:false},
            
        ];

        groupCodeGrid.setColumnsDefinition(columnsDefinition);
        groupCodeGrid.setDynamicHeight(670);
        groupCodeGrid.optionPanel('#groupCodeGrid-option')
        groupCodeGrid.disableReadOnlyForAutoRows(['cohCode']);
        groupCodeGrid.checkBoxColumns(["select"]);
        groupCodeGrid.enableFrozenCol('cohName');

    }
    /**
     * 그룹코드 그리드 이벤트
     */
    const groupCodeGridEvent = ()=>{
        groupCodeGrid._flexCv.getError = (item,prop)=>{

            //셀수정모드 일경우 오류검증 안함 (포커스 이동이 안됨으로)
            if(groupCodeGrid._flexCv.isEditingItem) return null;

            switch (prop) {
                case 'cohCode':
                    if(wijmo.isNullOrWhiteSpace(item.cohCode)) return '[공통코드]를 입력하세요.';
                    if(commonFunc.iskorean(item.cohCode)) return '[공통코드]는 한글사용이 불가능합니다.';
                    if(item.cohCode.getBytes()>4) return '[공통코드]는 4자 이하로 입력하세요.';
                    if(groupCodeGrid.isSameColumnValue(item,['cohCode'])) return '중복되는 [공통코드]가 존재합니다.';
                    break;
                case 'cohName':
                    if(wijmo.isNullOrWhiteSpace(item.cohName)) return '[공통명]을 입력하세요.';
                    if(item.cohName.getBytes()>100) return `[공통명]는 100byte 이하로 입력하세요.(${item.cohName.getBytes()})`;
                    break;
                case 'cohRmk':
                    if(!wijmo.isNullOrWhiteSpace(item.cohRmk)){
                        if(item.cohRmk.getBytes()>100) return `[설명]은 200byte 이하로 입력하세요.(${item.cohRmk.getBytes()})`;
                    }
                    break;
                
                default:
                    break;
            }
        }
        
    }

    /**
     * 그룹코드 리스트
     */
    const getGroupList = async ()=>{

        groupCodeGrid.disableAutoRows();

        let params = {
            uri: `code-manage/common-codes/group`
        }
        await ajax.getAjax(params,true).then((data)=>{
            let groupCodeList = data['groupCodeList'];
            groupCodeList.forEach(item=>item.select = false);

            groupCodeGrid._flexCv.sourceCollection = groupCodeList;
            pushMsg(`${groupCodeGrid.getRowCnt()}행이 조회 되었습니다.`);
        }).catch((e)=>{});
    }

    /**
     * 그룹코드 저장
     */
    const saveOfGroupCode = ()=>{

        if(!authrity.ins){
            alertWarning('작업불가','권한이 없습니다.');
            return;
        }
        groupCodeGrid.disableAutoRows();

        if(!groupCodeGrid.gridValidation()){
            alertInfo('저장불가','그리드 오류내역을 확인하세요.');
            return;
        }
        
        //추가/수정된 내역이 있을경우 
        let itemsAdded = groupCodeGrid.gridItemListToArray(groupCodeGrid._flexCv.itemsAdded);
        let itemsEdited = groupCodeGrid.gridItemListToArray(groupCodeGrid._flexCv.itemsEdited);

        let saveList = [...itemsAdded,...itemsEdited];

        if(wijmo.isEmpty(saveList)){
            alertInfo('저장불가','저장할 내역이 없습니다.');
            return;
        }

        confirm('저장 하시겠습니까?', '추가 및 수정된 내역이 저장됩니다.',consts.MSGBOX.QUESTION,()=>{

            let params = {
                uri: `code-manage/common-codes/group`,
                saveList: saveList
            }

            ajax.postAjax(params,true).then(async ()=>{
                await getGroupList();
                pushMsg('저장 되었습니다.');
            }).catch((e)=>{});

        });
    }

    /**
     * 그룹코드 삭제
     */
    const deleteOfGroupCode = ()=>{
        
        if(!authrity.del){
            alertWarning('작업불가','권한이 없습니다.');
            return;
        }
        groupCodeGrid.disableAutoRows();

        let checkList = groupCodeGrid.getCheckList('select');
        if(wijmo.isEmpty(checkList)){
            alertInfo('삭제불가','선택된 내역이 없습니다.');
            return;
        }

        if(checkList.some(item=>item.codCount>0)){
            alertInfo('삭제불가','등록된 공통코드가 존재합니다.');
        return;
        }

        //삭제할 내역중 추가된내역(itemsAdded 포함되어있는 내역)은 DB에 반영안된 내역으로 그냥 리스트에서 제거 하면 됨.
        //db에 있는 데이터를 걸러서 삭제 구문을 타게 한다.
        let deleteList = checkList.filter(item=>{
            if(groupCodeGrid._flexCv.itemsAdded.some(f=>f.cohCode==item.cohCode)){
                groupCodeGrid._flexCv.remove(item);
                return false;
            }
            return true;
        });

        if(wijmo.isEmpty(deleteList)) return;

        confirm('공통코드를 삭제 하시겠습니까?','다른 프로그램과 연동되어 있을경우 삭제시 문제가 발생합니다.',consts.MSGBOX.ERROR,()=>{
            
            let params = {
                uri: `code-manage/common-codes/group`,
                deleteList: deleteList
            }
            ajax.deleteAjax(params,true).then(async ()=>{
                await getGroupList();
                pushMsg('선택된 내역이 삭제되었습니다.');
                
            }).catch((e)=>{});
            
        });

    }

    /**
     * 공통코드 그리드 초기화
     */
    const commonCodeGridInit = ()=>{

        let columnsDefinition = [
            {binding:'select',header:' ',width:30,dataType:'Boolean'},
            {binding:'codHcode',header:'공통코드',width:80,dataType:'String',align:'center',visible:false},
            {binding:'codOrder',header:'순서',width:80,dataType:'Number',isReadOnly:false,visible:false},
            {binding:'codCode',header:'상세코드',width:80,dataType:'String',align:'center',isReadOnly:true,maxLength:4},
            {binding:'codName',header:'코드명',width:170,dataType:'String',maxLength:20},
            {binding:'codLock',header:'사용중지',width:80,dataType:wijmo.DataType.Boolean,align:'center', cssClass:'switch'},
            {binding:'codIndte',header:'등록일자',width:80,dataType:'Date',align:'center',isReadOnly:true},
            {binding:'codUpdte',header:'수정일자',width:80,dataType:'Date',align:'center',isReadOnly:true},
            {binding:'regName',header:'수정자',width:80,dataType:'String',isReadOnly:true,align:'center'}
            
        ];

        commonCodeGrid.setColumnsDefinition(columnsDefinition);
        commonCodeGrid.setDynamicHeight(660);
        commonCodeGrid.disableReadOnlyForAutoRows(['codCode']);
        commonCodeGrid.checkBoxColumns(["select"]);
        commonCodeGrid.manualColumnsSorting([],true);
        commonCodeGrid.enableMoveRow();   //그리드 행이동 가능토록
    }
    /**
     * 공통코드 그리드 이벤트
     */
    const commonCodeGridEvent = ()=>{
        
        commonCodeGrid._flexCv.getError = (item,prop)=>{
            switch (prop) {
                case 'codCode':
                    if(wijmo.isNullOrWhiteSpace(item.codCode)) return '[상세코드]를 입력하세요.';
                    if(commonFunc.iskorean(item.codCode)) return '[상세코드]는 한글사용이 불가능합니다.';
                    if(item.codCode.getBytes()>4) return '[상세코드]는 4자 이하로 입력하세요.';
                    if(commonCodeGrid.isSameColumnValue(item,['codCode'])) return '중복되는 [상세코드]가 존재합니다.';
                    break;
                case 'codName':
                    if(wijmo.isNullOrWhiteSpace(item.codName)) return '[상세코드명]을 입력하세요.';
                    if(item.codName.getBytes()>20) return `[상세코드명]는 20자 이하로 입력하세요.(${item.codName.getBytes()})`;
                    break;
                default:
                    break;
            }
        }

    }

    /**
     * 메뉴순서 지정 이벤트
     * @param {*} e 
     */
    const commonCodeUpDownEvent = (e)=>{
        commonCodeGrid.disableAutoRows();
        let selectRow = commonCodeGrid._flexGrid.selection.row;
        let moveRow = 0;

        if(selectRow<0){
            alertInfo('작업불가','이동할 행을 선택후 작업하세요.');
            return;
        }
        
        let target = e.target;
        let action = $(target).data('upDown');

        switch (action) {
            case 'first':
                if(selectRow==0) return;
                moveRow = 0;
                break;
            case 'up':
                if(selectRow==0) return;
                moveRow = selectRow-1;
                break;
            case 'down':
                if(selectRow==commonCodeGrid.getRowCnt()-1) return;
                moveRow = selectRow+1;
                break;
            case 'last':
                if(selectRow==commonCodeGrid.getRowCnt()-1) return;
                moveRow = commonCodeGrid.getRowCnt()-1;
            default:
                break;
        }

        //deferupdate 여러데이터를 일괄적으로 변경할경우 사용
        //내부적으로 데이터를 변경할동안 업데이트를 일시 중시시키고 변경된후에 한번만 업데이트하여 성능최적화함.
        let arr = commonCodeGrid._flexCv.sourceCollection;
        commonCodeGrid._flexCv.deferUpdate(()=>{
            let item = arr[selectRow];
            arr.splice(selectRow,1);        //선택된 행 삭제
            arr.splice(moveRow,0,item);     //선택된 행 이동될 row에 복사
            commonCodeGrid._flexCv.moveCurrentToPosition(moveRow);   //이동된 행으로 선택옮기기
        });
        

    }

    /**
     * 공통코드 조회
     * @param {String} code 
     */
    const loadCommonCode = async (code)=>{
        if(!code){
            alertInfo('조회불가','공통코드를 선택하세요.');
            return;
        }

        let params = {
            uri: `code-manage/common-codes/${code}`,
            
        };

        await ajax.getAjax(params,true).then((data)=>{
            
            let commonCodeList = data['commonCodeList'];

            //console.debug(commonCodeList);

            commonCodeList.forEach(item=>{
                item.select = false;
                if(item.codLock==='Y'){
                    item.codLock = true;
                }else{
                    item.codLock = false;
                } 
            });

            commonCodeGrid._flexCv.sourceCollection =  commonCodeList;
            pushMsg(`${commonCodeGrid.getRowCnt()}행이 조회 되었습니다.`);
        }).catch((e)=>{});
    }

    /**
     * 공통코드 저장
     */
    const saveOfCommonCode = ()=>{
        if(!authrity.ins){
            alertWarning('작업불가','권한이 없습니다.');
            return;
        }
        commonCodeGrid.disableAutoRows();

        let groupCode = $('#selectedGroupCode').data('groupCode');
        if(wijmo.isEmpty(groupCode)){
            alertInfo('저장불가','선택된 공통코드가 없습니다.');
            return;
        }

        if(!commonCodeGrid.gridValidation()){
            alertInfo('저장불가','그리드 오류내역을 확인하세요.');
            return;
        }

        //차례로 순번을 재정렬(순서지정 변경할경우 순번이 생성되지만 순서 지정변경없이 추가 되었을경우 순번이 없음.)
        commonCodeGrid._flexGrid.rows.forEach((row,index)=>{
            commonCodeGrid._flexGrid.setCellData(index,'codOrder',index+1);
        });
        
        //추가/수정된 내역이 있을경우 
        let itemsAdded = commonCodeGrid.gridItemListToArray(commonCodeGrid._flexCv.itemsAdded);
        let itemsEdited = commonCodeGrid.gridItemListToArray(commonCodeGrid._flexCv.itemsEdited);
        let saveList = [...itemsAdded,...itemsEdited];
        
        if(wijmo.isEmpty(saveList)){
            alertInfo('저장불가','저장할 내역이 없습니다.');
            return;
        }

        console.debug(saveList);

        confirm('저장 하시겠습니까?', '추가 및 수정된 내역이 저장됩니다.',consts.MSGBOX.QUESTION,()=>{

            saveList = saveList.map(item=>({
                ...item,
                codLock:item.codLock==true?'Y':'N',
                codHcode:groupCode
            }));

            let params = {
                uri: `code-manage/common-codes`,
                saveList: saveList
            };

            ajax.postAjax(params,true).then(async ()=>{
                await loadCommonCode(groupCode);
                pushMsg('저장 되었습니다.');
            }).catch((e)=>{});

        });
    }

    /**
     * 공통코드 삭제
     */
    const deleteOfCommonCode = ()=>{
        if(!authrity.del){
            alertWarning('작업불가','권한이 없습니다.');
            return;
        }
        commonCodeGrid.disableAutoRows();

        let checkList = commonCodeGrid.getCheckList('select');
        if(wijmo.isEmpty(checkList)){
            alertInfo('삭제불가','선택된 내역이 없습니다.');
            return;
        }

        //삭제할 내역중 추가된내역(itemsAdded 포함되어있는 내역)은 DB에 반영안된 내역으로 그냥 리스트에서 제거 하면 됨.
        //db에 있는 데이터를 걸러서 삭제 구문을 타게 한다.
        let deleteList = checkList.filter(item=>{
            if(commonCodeGrid._flexCv.itemsAdded.some(f=>f.codCode==item.codCode)){
                commonCodeGrid._flexCv.remove(item);
                return false;
            }
            return true;
        });

        if(wijmo.isEmpty(deleteList)) return;


        confirm('상세코드를 삭제 하시겠습니까?','다른 프로그램과 연동되어 있을경우 삭제시 문제가 발생합니다.',consts.MSGBOX.ERROR,()=>{
            
            let params = {
                uri: `code-manage/common-codes`,
                deleteList: deleteList
            };
            ajax.deleteAjax(params,true).then(()=>{
                $('.btn-commonCode-refresh').trigger('click');
                pushMsg('선택된 내역이 삭제되었습니다.');
            }).catch((e)=>{});
            
        });
    }



    /**
     * 각종 이벤트 핸들러
     */
    const handleEvent = ()=>{
        groupCodeGridInit();
        groupCodeGridEvent();
        commonCodeGridInit();
        commonCodeGridEvent();
        
        $('.btn-groupCode-refresh').on('click',getGroupList);
        $('#btn-groupCode-save').on('click',saveOfGroupCode);
        $('#btn-groupCode-add').on('click',()=>{
            groupCodeGrid.enableAutoRows();
            groupCodeGrid.moveFocus(groupCodeGrid.getRowCnt(),'cohCode');
        });
        $('#btn-groupCode-delete').on('click',deleteOfGroupCode);
        

        $('.btn-commonCode-refresh').on('click',()=>{
            let groupCode = $('#selectedGroupCode').data('groupCode');
            loadCommonCode(groupCode);
        });
        $('#btn-commonCode-add').on('click',()=>{
            commonCodeGrid.enableAutoRows();
            commonCodeGrid.moveFocus(commonCodeGrid.getRowCnt(),'codCode');
        });
        $('#btn-commonCode-save').on('click',saveOfCommonCode);
        $('#btn-commonCode-delete').on('click',deleteOfCommonCode);

        //메뉴 순서지정 버튼들 이벤트
        $('[data-up-down]').on('click',commonCodeUpDownEvent);
        
    }

    return{
        init:()=>{
            handleEvent();
            getGroupList();
        }
    }
}();


$(()=>{
    commonCode.init();
    
})
